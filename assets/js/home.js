/* Куда Себет — главная страница */
(function () {
  "use strict";
  const { esc, fmt, norm, add, FALLBACK, IMG } = window.KS;
  const $ = (id) => document.getElementById(id);

  const ACTIVE = new Set(["Куда Себет S", "Куда Себет M", "Куда Себет Vip", "Куда Себет Комбо 3в1"]);
  const SECTION_IDS = {
    "куда себеттер": "section-sebetter", "себеттер": "section-sebetter",
    "кыргыз box": "section-kyrgyz-box", "майрамдарга": "section-mayramdar",
    "тематикалык бокстор": "section-tematik-box", "белектер": "section-gifts", "веган box": "section-vegan-box"
  };
  const key = (s) => norm(s).toLocaleLowerCase("ru");
  const slugify = (s) => key(s).replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "item";
  const sectionId = (c) => SECTION_IDS[key(c)] || "section-catalog-" + slugify(c);
  const price = (v) => { const n = Number(String(v ?? "").trim().replace(/\s+/g, "").replace(",", ".")); return String(v ?? "").trim() && Number.isFinite(n) && n >= 0 ? n : null; };

  const P = (category, slug, name, cost, tag, desc) => ({ category, slug, name, price: cost, tag, desc });
  let catalog = [
    P("Себеттер", "sebet-s", "Куда Себет S", 4790, "S", "Корзина S — маленький мир сладостей, подобранных с любовью."),
    P("Себеттер", "sebet-m", "Куда Себет M", 6990, "M", "Подарочная корзина со свежими фруктами, сладостями и соком Yan."),
    P("Себеттер", "sebet-vip", "Куда Себет Vip", 13790, "Vip", "Премиальная корзина для особых случаев и статуса подарка."),
    P("Себеттер", "sebet-combo", "Куда Себет Комбо 3в1", 25570, "XL", "Максимальный размер набора для больших поздравлений и щедрых подарков."),
    P("Кыргыз Box", "sebet-s", "Кыргыз Box Стандарт", 5890, "K", "Яркий набор с фруктами и сладким наполнением для семейных встреч."),
    P("Кыргыз Box", "sebet-m", "Кыргыз Box Үй-бүлө", 8390, "K", "Продуманный состав для больших столов и теплых семейных праздников."),
    P("Кыргыз Box", "sebet-vip", "Кыргыз Box Премиум", 12990, "K", "Статусная подача и премиальные ингредиенты для особенного случая."),
    P("Кыргыз Box", "sebet-vip", "Кыргыз Box Ultra", 14990, "K", "Расширенная версия для больших семейных столов и крупных подарков."),
    P("Майрамдарга", "sebet-s", "Майрам Box Classic", 5490, "M", "Универсальный выбор на праздник, день рождения или семейный ужин."),
    P("Майрамдарга", "sebet-m", "Майрам Box Family", 7990, "M", "Праздничная корзина на компанию с яркой подачей и насыщенным составом."),
    P("Майрамдарга", "sebet-vip", "Майрам Box Grand", 13990, "G", "Премиальный набор для важных мероприятий и статусных поздравлений."),
    P("Майрамдарга", "sebet-vip", "Майрам Box Special", 15990, "S", "Супернабор с акцентом на масштаб и эффектную праздничную подачу."),
    P("Тематикалык бокстор", "sebet-s", "Romantic Box", 6190, "R", "Сборка для свидания с красивой подачей и праздничной атмосферой."),
    P("Тематикалык бокстор", "sebet-m", "Kids Party Box", 7290, "K", "Идеальный тематический подарок для детей и семейных праздников."),
    P("Тематикалык бокстор", "sebet-vip", "Office Box", 9490, "O", "Практичный набор для команды, коллег и корпоративных поздравлений."),
    P("Тематикалык бокстор", "sebet-m", "Love Story Box", 8990, "L", "Нежный тематический бокс с праздничной атмосферой и красивой подачей."),
    P("Белектер", "sebet-s", "Белек Mini", 4990, "B", "Компактная подарочная корзина с аккуратной подачей и приятным составом."),
    P("Белектер", "sebet-m", "Белек Gold", 8690, "B", "Оптимальный набор для значимых дат и теплых поздравлений близким."),
    P("Белектер", "sebet-vip", "Белек Signature", 14990, "S", "Стильный премиум-набор с насыщенным составом и подачей высокого уровня."),
    P("Белектер", "sebet-vip", "Белек Platinum", 17990, "P", "Премиальный уровень подарка для особых случаев и крупных поздравлений."),
    P("Веган Box", "sebet-s", "Веган Box Fresh", 5690, "V", "Легкий и свежий состав для тех, кто выбирает растительное питание."),
    P("Веган Box", "sebet-m", "Веган Box Balance", 7990, "V", "Продуманная веган-сборка для подарка, офиса или полезного праздника."),
    P("Веган Box", "sebet-vip", "Веган Box Premium", 10490, "V", "Премиальная веган-корзина с фокусом на вкус, стиль и полезный состав."),
    P("Веган Box", "sebet-vip", "Веган Box Natural", 11990, "N", "Натуральный расширенный состав для тех, кто выбирает осознанное питание.")
  ];

  /* ---------- Каталог ---------- */
  const STATIC_NAV = [["#section-ozun-chogult", "Өзүң чогулт"], ["#section-app", "Приложение"], ["./personal-builder.html", "Личный конструктор"]];
  let activeNav = "";

  function card(p) {
    const active = p.available ?? ACTIVE.has(p.name);
    const canOpen = active || p.sheet;
    const href = "product.html?item=" + encodeURIComponent(p.slug);
    const media = `<div class="card__img">${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ""}<img src="${esc(p.img || window.KudaSebetSheetCatalog.DEFAULT_PHOTO)}" alt="${esc(p.name)}" loading="lazy"></div>`;
    const cost = active || p.sheet ? fmt(p.price) : "Скоро";
    return `<article class="card${active ? "" : " card--soon"}">
      ${canOpen ? `<a href="${href}">${media}</a>` : media}
      <div class="card__cat">${esc(p.category)}</div>
      <h3>${canOpen ? `<a href="${href}">${esc(p.name)}</a>` : esc(p.name)}</h3>
      <p class="card__desc">${esc(p.desc)}</p>
      <div class="card__foot"><span class="price">${cost}</span>
        ${active ? `<button class="btn btn--primary btn--sm" type="button" data-add data-name="${esc(p.name)}" data-price="${p.price}">В корзину</button>` : `<button class="btn btn--sm" type="button" disabled>Скоро</button>`}
      </div></article>`;
  }

  function groups() {
    const map = new Map();
    catalog.filter((p) => !window.KudaSebetSheetCatalog?.isPopular(p.category)).forEach((p) => {
      const id = sectionId(p.category);
      if (!map.has(id)) map.set(id, { id, title: p.category, items: [] });
      map.get(id).items.push(p);
    });
    return [...map.values()];
  }

  function renderCatalog() {
    $("catalog").innerHTML = groups().map((g) => `<section class="section" id="${g.id}"><div class="container">
      <h2 class="section-title">${esc(g.title)}</h2><div class="grid grid--products">${g.items.map(card).join("")}</div></div></section>`).join("");
  }

  function renderNav() {
    const links = groups().map((g) => [`#${g.id}`, g.title]).concat(STATIC_NAV);
    if (!activeNav) activeNav = links[0][0];
    $("categoryNav").innerHTML = links.map(([h, t]) => `<a href="${esc(h)}"${h === activeNav ? ' class="is-active"' : ""}>${esc(t)}</a>`).join("");
  }
  $("categoryNav").addEventListener("click", (e) => {
    const a = e.target.closest("a"); if (!a) return;
    activeNav = a.getAttribute("href");
    $("categoryNav").querySelectorAll("a").forEach((x) => x.classList.toggle("is-active", x === a));
  });

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]"); if (!b) return;
    add(b.dataset.name, Number(b.dataset.price));
    const prev = b.textContent; b.textContent = "✓ Добавлено";
    setTimeout(() => { b.textContent = prev; }, 1000);
  });

  /* ---------- Google Sheets ---------- */
  function sheetProducts(rows) {
    if (window.KudaSebetSheetCatalog) return window.KudaSebetSheetCatalog.parseRows(rows);
    if (!Array.isArray(rows) || rows.length < 2) return [];
    const h = rows[0].map((c) => String(c || "").trim().toLocaleLowerCase("ru"));
    const ci = Math.max(0, h.findIndex((x) => /катег/.test(x)));
    const ni = Math.max(1, h.findIndex((x) => /себет|корзин|товар|наимен/.test(x)));
    const pi = Math.max(2, h.findIndex((x) => /цен|price|стоим/.test(x)));
    return rows.slice(1).flatMap((r) => {
      const category = String(r?.[ci] ?? "").trim(), name = String(r?.[ni] ?? "").trim(), cost = price(r?.[pi]);
      return category && name && cost !== null ? [{ category, name, price: cost }] : [];
    });
  }
  async function applyBaskets(rows) {
    const items = sheetProducts(rows); if (!items.length) return;
    const pool = [...catalog], next = [];
    items.forEach((sp) => {
      let i = pool.findIndex((c) => key(c.name) === key(sp.name));
      if (i < 0) i = pool.findIndex((c) => key(c.category) === key(sp.category) && c.price === sp.price);
      const base = i >= 0 ? pool[i] : { tag: "", desc: "" };
      const slug = sp.slug;
      next.push({ ...base, ...sp, slug, desc: sp.desc || base.desc, sheet: true, tag: base.tag || sp.category.slice(0, 1) });
    });
    await Promise.all(next.map(async (p) => { p.img = await window.KudaSebetSheetCatalog.resolvePhoto(p.photo); IMG[p.name] = p.img; }));
    catalog = next;
    renderCatalog(); renderNav();
    const popular = catalog.filter((p) => window.KudaSebetSheetCatalog.isPopular(p.category));
    const note = $("popular").querySelector(".card--note");
    $("popular").innerHTML = popular.map((p) => {
      const active = p.available ?? ACTIVE.has(p.name), href = "product.html?item=" + encodeURIComponent(p.slug);
      return `<article class="card" data-pop data-name="${esc(p.name)}">
        <a href="${href}"><div class="card__img"><img src="${esc(p.img || IMG[p.name] || FALLBACK)}" alt="${esc(p.name)}" loading="lazy"></div></a>
        <h3><a href="${href}">${esc(p.name)}</a></h3>
        <div class="card__foot"><span class="price">${fmt(p.price)}</span>${active ? `<button class="btn btn--primary btn--sm" type="button" data-add data-name="${esc(p.name)}" data-price="${p.price}">Добавить</button>` : `<button class="btn btn--sm" type="button" disabled>Скоро</button>`}</div></article>`;
    }).join("");
    if (note) $("popular").append(note);
  }

  /* ---------- Конструктор ---------- */
  const DEFAULT_B = [["Виноград «Дамские пальчики»", 650], ["Фрукт «Сердце дракона»", 520], ["Гранат", 290], ["Манго", 340], ["Ананас", 430], ["Печенье в банке", 260], ["Маракуйя", 230], ["Сок Yan «Яблоко–Груша»", 180], ["Сеточка под продукты", 90], ["Шоколад «Toblerone»", 310], ["Raffaello", 320], ["Ferrero Rocher", 350], ["Большая шоколадка Merci", 420], ["Корзина", 600]];
  let bItems = DEFAULT_B.map(([name, cost]) => ({ name, price: cost, category: "Состав корзины" }));
  const bQty = new Map();

  function renderBuilder() {
    const g = new Map();
    bItems.forEach((it) => { if (!g.has(it.category)) g.set(it.category, []); g.get(it.category).push(it); });
    [...bQty.keys()].forEach((n) => { if (!bItems.some((i) => i.name === n)) bQty.delete(n); });
    $("bList").innerHTML = [...g].map(([cat, items], idx) => `<details class="b-group"${idx === 0 ? " open" : ""}>
      <summary>${esc(cat)}<small>${items.length}</small></summary><div class="b-items">${items.map((it) => `
        <div class="b-item" data-name="${esc(it.name)}"><div class="b-name">${esc(it.name)}</div><div class="b-price">${fmt(it.price)}</div>
          <div class="qty"><button type="button" data-b="dec" aria-label="Уменьшить ${esc(it.name)}">−</button><span>${bQty.get(it.name) || 0}</span><button type="button" data-b="inc" aria-label="Добавить ${esc(it.name)}">+</button></div></div>`).join("")}
      </div></details>`).join("");
    renderBSummary();
  }
  function selection() {
    let total = 0, count = 0; const sel = [];
    bItems.forEach((it) => { const q = bQty.get(it.name) || 0; if (q > 0) { sel.push({ ...it, qty: q }); total += it.price * q; count += q; } });
    return { sel, total, count };
  }
  function renderBSummary() {
    const { sel, total } = selection();
    $("bSummaryList").innerHTML = sel.length
      ? sel.map((i) => `<div class="b-summary__row"><span>${esc(i.name)} × ${i.qty}</span><span>${fmt(i.price * i.qty)}</span></div>`).join("")
      : '<div class="muted">Выберите ингредиенты для своей корзины.</div>';
    $("bTotal").textContent = "Итого: " + fmt(total);
    $("bAdd").disabled = sel.length === 0;
  }
  $("bList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-b]"); if (!b) return;
    const row = b.closest(".b-item"), name = row.dataset.name;
    const q = Math.max(0, (bQty.get(name) || 0) + (b.dataset.b === "inc" ? 1 : -1));
    if (q) bQty.set(name, q); else bQty.delete(name);
    row.querySelector(".qty span").textContent = String(q);
    renderBSummary();
  });
  $("bAdd").addEventListener("click", () => {
    const { sel, total, count } = selection();
    if (!sel.length || total <= 0) { alert("Выберите хотя бы один продукт для своей корзины"); return; }
    add(`Өзүң чогулт (${count} поз.)`, total, "Состав: " + sel.map((i) => `${i.name} ×${i.qty}`).join(", "));
    bQty.clear(); renderBuilder();
  });
  function applyBuilder(rows) {
    const items = sheetProducts(rows); if (!items.length) return;
    bItems = items; renderBuilder();
  }

  /* ---------- Информация ---------- */
  const INFO = {
    delivery: ["Способы доставки", "<p>Доставка курьером по городу, самовывоз из пункта выдачи или точечная доставка ко времени.</p><p>В день отправки присылаем фото готовой корзины перед выездом.</p>"],
    payment: ["Способы оплаты", "<p>Онлайн-оплата картой, перевод по номеру телефона и безналичный счет для компаний.</p><p>Чек и подтверждение оплаты отправляются сразу после оформления.</p>"],
    safety: ["Безопасность заказа", "<p>Каждая корзина собирается вручную и фиксируется для безопасной перевозки.</p><p>Перед отправкой проводится контроль качества и проверка комплектации.</p>"],
    policy: ["Политика конфиденциальности", "<p>1. Мы собираем только минимально необходимые данные: имя, телефон, адрес доставки, состав заказа и способ оплаты.</p><p>2. Данные используются только для обработки заказа, доставки, обратной связи и возврата средств при необходимости.</p><p>3. Мы не передаем данные третьим лицам, кроме служб доставки и платежных провайдеров.</p><p>4. Данные хранятся ограниченный срок и защищены техническими и организационными мерами.</p><p>5. Для запроса удаления данных можно написать на support@mukashov.com.</p>"]
  };
  document.querySelectorAll("[data-info]").forEach((b) => b.addEventListener("click", () => {
    const it = INFO[b.dataset.info]; if (it) window.KS.modal(it[0], it[1]);
  }));

  /* ---------- Старт ---------- */
  // Wait for the table before allowing purchases from the built-in catalog.
  if (window.KudaSebetSheetCatalog) {
    catalog.forEach(p => { p.available = false; });
    $("popular").querySelectorAll("[data-add]").forEach(button => { button.disabled = true; });
  }
  renderCatalog(); renderNav(); renderBuilder();
  const SC = window.KudaSebetSheetCatalog;
  if (SC) {
    SC.loadRows("Себеттер").then(applyBaskets).catch(error => console.warn("Каталог себетов не обновлён.", error));
    SC.loadRows("Товары").then(applyBuilder).catch(error => console.warn("Каталог конструктора не обновлён.", error));
  }
})();
