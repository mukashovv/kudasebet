/* Куда Себет — страница товара */
(function () {
  "use strict";
  const { esc, fmt, norm, add, modal, closeAll, geo, getAddr, setAddr, cleanAddr, WA, FALLBACK } = window.KS;
  const $ = (id) => document.getElementById(id);

  const IMGS = {
    "sebet-s": ["assets/img/cards/kuda_sebet_s.jpg", FALLBACK],
    "sebet-m": ["assets/img/cards/kuda_sebet_m.jpg", FALLBACK],
    "sebet-vip": ["assets/img/cards/kuda_sebet_vip.jpg", FALLBACK],
    "sebet-combo": ["assets/img/stories/story-combo.webp", FALLBACK]
  };
  const products = {
    "sebet-s": { name: "Куда Себет S", price: 4790, desc: "Корзина S — это маленький мир сладостей, подобранных с любовью. Каждый элемент выбран так, чтобы порадовать самых близких любителей вкусного.", composition: "«Merci», «Toblerone» mini, сок яблоко-груша 0,25 мл, виноград «Дамские пальчики», фрукт «Сердце дракона», гранат ~600 г, манго ~500 г." },
    "sebet-m": { name: "Куда Себет M", price: 6990, desc: "Подарочная корзина, наполненная свежими фруктами и сладостями. Внутри — сочный ананас, манго, гранат, маракуйя, виноград «Дамские пальчики», экзотический «Сердце дракона», печенье в банке и натуральный сок Yan. Идеальный подарок для любимых и близких.", composition: "Фрукт «Сердце дракона», гранат, манго, ананас, печенье в банке, маракуйя, сок Yan «Виноград», сеточка под продукты, виноград «Дамские пальчики»." },
    "sebet-vip": { name: "Куда Себет Vip", price: 13790, desc: "Стильная премиальная корзина, созданная для особых случаев. Вместительная, прочная и эстетичная — идеально подчёркивает статус и ценность подарка.", composition: "Виноград «Дамские пальчики», фрукт «Сердце дракона», гранат, манго, ананас, печенье в банке, маракуйя, сок Yan «Яблоко–Груша», сеточка под продукты, шоколад «Toblerone», Raffaello, Ferrero Rocher, большая шоколадка Merci, корзина." },
    "sebet-combo": { name: "Куда Себет Комбо 3в1", price: 25570, desc: "Большая праздничная корзина с богатым составом для семейных торжеств и важных событий.", composition: "Расширенный набор фруктов, сладостей, напитков и фирменная корзина большого объема." }
  };
  const ACTIVE = new Set(["Куда Себет S", "Куда Себет M", "Куда Себет Vip", "Куда Себет Комбо 3в1"]);
  const RECOMMEND = [
    ["sebet-s", "Куда Себет S", 4790, "Компактный бокс на каждый день."],
    ["sebet-m", "Куда Себет M", 6990, "Оптимальный формат для семьи."],
    ["sebet-vip", "Куда Себет Vip", 13790, "Премиальная праздничная сборка."],
    ["sebet-combo", "Куда Себет Комбо 3в1", 25570, "Максимальный размер и состав."],
    ["sebet-s", "Кыргыз Box Стандарт", 5890, "Локальный стиль и вкус."],
    ["sebet-m", "Майрам Box Family", 7990, "Для семейного праздника."],
    ["sebet-m", "Love Story Box", 8990, "Романтическая тематическая сборка."],
    ["sebet-vip", "Белек Platinum", 17990, "Флагманский подарочный набор."],
    ["sebet-s", "Веган Box Fresh", 5690, "Натуральный веган формат."],
    ["sebet-vip", "Веган Box Natural", 11990, "Большой веган набор."],
    ["sebet-vip", "Кыргыз Box Ultra", 14990, "Расширенная праздничная версия."],
    ["sebet-vip", "Майрам Box Special", 15990, "Для крупных мероприятий."]
  ];

  const slug = new URLSearchParams(location.search).get("item");
  const product = products[slug] || products["sebet-s"];
  const images = IMGS[products[slug] ? slug : "sebet-s"];

  document.title = product.name + " — Куда Себет";
  $("crumb").textContent = product.name;
  $("pName").textContent = product.name;
  $("pDesc").textContent = product.desc;
  $("pComp").textContent = product.composition;
  $("pPrice").textContent = fmt(product.price);

  /* Галерея */
  $("gMain").innerHTML = `<img id="gImg" src="${esc(images[0])}" alt="${esc(product.name)}">`;
  $("gThumbs").innerHTML = images.map((src, i) => `<button class="thumb${i === 0 ? " is-active" : ""}" type="button" data-i="${i}" aria-label="Фото ${i + 1}"><img src="${esc(src)}" alt=""></button>`).join("");
  $("gThumbs").addEventListener("click", (e) => {
    const t = e.target.closest(".thumb"); if (!t) return;
    $("gImg").src = images[Number(t.dataset.i)];
    $("gThumbs").querySelectorAll(".thumb").forEach((x) => x.classList.toggle("is-active", x === t));
  });

  /* Рекомендации */
  $("recommend").innerHTML = RECOMMEND.map(([s, name, cost, desc]) => {
    const active = ACTIVE.has(name);
    const href = "product.html?item=" + encodeURIComponent(s);
    const media = `<div class="card__img"><img src="${esc((IMGS[s] || [FALLBACK])[0])}" alt="${esc(name)}" loading="lazy"></div>`;
    return `<article class="card${active ? "" : " card--soon"}">
      ${active ? `<a href="${href}">${media}</a>` : media}
      <h3>${active ? `<a href="${href}">${esc(name)}</a>` : esc(name)}</h3>
      <p class="card__desc">${esc(desc)}</p>
      <div class="card__foot"><span class="price">${active ? fmt(cost) : "Скоро"}</span>
        ${active ? `<button class="btn btn--primary btn--sm" type="button" data-add data-name="${esc(name)}" data-price="${cost}">В корзину</button>` : `<button class="btn btn--sm" type="button" disabled>Скоро</button>`}</div></article>`;
  }).join("");

  /* Добавление в корзину */
  function flash(btn, text) { const prev = btn.textContent; btn.textContent = text; setTimeout(() => { btn.textContent = prev; }, 1000); }
  $("addBtn").addEventListener("click", (e) => { add(product.name, product.price); flash(e.currentTarget, "✓ Добавлено"); });
  $("recommend").addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]"); if (!b) return;
    add(b.dataset.name, Number(b.dataset.price)); flash(b, "✓ Добавлено");
  });

  /* Купить сейчас */
  $("buyBtn").addEventListener("click", () => {
    const body = modal("Купить сейчас", `
      <p class="muted">${esc(product.name)} • ${fmt(product.price)}</p>
      <label class="field-label" for="qbAddr">Укажите точный адрес</label>
      <input class="input" id="qbAddr" type="text" placeholder="Улица, дом, квартира" autocomplete="street-address">
      <div class="addr-meta"><button class="link-btn" type="button" id="qbGeo">Определить автоматически</button><span class="addr-status" id="qbStatus" aria-live="polite"></span></div>
      <p class="note">Перед оформлением заказа убедитесь в правильности указанного адреса.</p>
      <button class="btn btn--primary btn--lg btn--block" type="button" id="qbSubmit">Заказать корзину</button>`);
    const input = body.querySelector("#qbAddr"), status = body.querySelector("#qbStatus");
    input.value = getAddr(); input.focus();
    input.addEventListener("input", () => { status.textContent = ""; });
    body.querySelector("#qbGeo").addEventListener("click", (e) => geo(e.currentTarget, input, status));
    const submit = () => {
      const address = norm(input.value);
      if (!address) { status.textContent = "Укажите точный адрес доставки"; status.classList.add("is-error"); input.focus(); return; }
      setAddr(address, null);
      const lines = ["Здравствуйте! Хочу купить сейчас:", "Товар: " + product.name, "Цена: " + fmt(product.price), "Адрес доставки: " + cleanAddr(address)];
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n")), "_blank");
      closeAll();
    };
    body.querySelector("#qbSubmit").addEventListener("click", submit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } });
  });
})();
