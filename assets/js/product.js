/* Куда Себет — страница товара */
(function () {
  "use strict";
  const { esc, fmt, norm, add, modal, closeAll, geo, getAddr, setAddr, cleanAddr, WA, FALLBACK } = window.KS;
  const $ = (id) => document.getElementById(id);

  const SC = window.KudaSebetSheetCatalog;
  const DEFAULT_PHOTO = SC.DEFAULT_PHOTO;
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

  const slug = new URLSearchParams(location.search).get("item") || "sebet-s";
  let product = { ...(products[slug] || { name: "Загрузка…", price: 0, desc: "", composition: "" }), available: false };
  // Do not paint a guessed image while the table's photos are loading.
  let images = [];
  let selectPhoto;
  let gallerySignature = "";
  let displayedPhoto = null;

  function renderProduct() {
    document.title = product.name + " — Куда Себет";
    $("crumb").textContent = product.name;
    $("pName").textContent = product.name;
    $("pDesc").textContent = product.desc;
    $("pComp").textContent = product.composition;
    $("pPrice").textContent = product.name === "Загрузка…" ? "" : fmt(product.price);
    const active = product.available ?? ACTIVE.has(product.name);
    $("addBtn").disabled = !active;
    $("buyBtn").disabled = !active;
    $("addBtn").textContent = active ? "В корзину" : "Скоро";
    $("favoriteProductButton").setAttribute("data-favorite-id", product.slug || SC.slug(product.name) || slug);
    if (window.KudaSebetAccount) window.KudaSebetAccount.catalogChanged();

    /* Галерея */
    const signature = JSON.stringify(images);
    if (signature === gallerySignature) return;
    gallerySignature = signature;
    const previousSrc = $("gImg")?.getAttribute("src");
    const previousIndex = Number($("gThumbs").querySelector(".is-active")?.dataset.i || 0);
    $("gMain").setAttribute("aria-busy", String(!images.length));
    $("gMain").innerHTML = images.length ? `<img id="gImg" src="${esc(images[0])}" alt="${esc(product.name)}" fetchpriority="high">` : "";
    $("gThumbs").innerHTML = images.map((src, i) => `<button class="thumb${i === 0 ? " is-active" : ""}" type="button" data-i="${i}" aria-label="Фото ${i + 1}"><img src="${esc(src)}" alt=""></button>`).join("");
    selectPhoto = SC.bindGallery($("gMain"), images.length, showPhoto);
    if (images.length) {
      const index = images[previousIndex] === previousSrc ? previousIndex : Math.max(0, images.indexOf(previousSrc));
      (selectPhoto || showPhoto)(index);
    }
  }
  renderProduct();
  function showPhoto(index) {
    $("gImg").src = images[index];
    $("gThumbs").querySelectorAll(".thumb").forEach((thumb, i) => thumb.classList.toggle("is-active", i === index));
  }
  $("gThumbs").addEventListener("click", (e) => {
    const t = e.target.closest(".thumb"); if (!t) return;
    (selectPhoto || showPhoto)(Number(t.dataset.i));
  });

  /* Рекомендации */
  $("recommend").innerHTML = RECOMMEND.map(([s, name, cost, desc]) => {
    const active = false;
    const href = "product.html?item=" + encodeURIComponent(s);
    const media = `<div class="card__img"><img src="${esc(DEFAULT_PHOTO)}" alt="${esc(name)}" loading="lazy"></div>`;
    return `<article class="card${active ? "" : " card--soon"}" data-recommend="${esc(name)}">
      ${active ? `<a href="${href}">${media}</a>` : media}
      ${active ? `<button class="card-favorite" type="button" data-favorite-id="${esc(s)}" aria-label="Сохранить в избранное">♡</button>` : ""}
      <h3>${active ? `<a href="${href}">${esc(name)}</a>` : esc(name)}</h3>
      <p class="card__desc">${esc(desc)}</p>
      <div class="card__foot"><span class="price">${active ? fmt(cost) : "Скоро"}</span>
        ${active ? `<button class="btn btn--primary btn--sm" type="button" data-add data-name="${esc(name)}" data-price="${cost}">В корзину</button>` : `<button class="btn btn--sm" type="button" disabled>Скоро</button>`}</div></article>`;
  }).join("");

  /* Добавление в корзину */
  function flash(btn, text) { const prev = btn.textContent; btn.textContent = text; setTimeout(() => { btn.textContent = prev; }, 1000); }
  $("addBtn").addEventListener("click", (e) => { if (!(product.available ?? ACTIVE.has(product.name))) return; add(product.name, product.price); flash(e.currentTarget, "✓ Добавлено"); });
  $("recommend").addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]"); if (!b) return;
    add(b.dataset.name, Number(b.dataset.price)); flash(b, "✓ Добавлено");
  });

  /* Купить сейчас */
  $("buyBtn").addEventListener("click", () => {
    if (!(product.available ?? ACTIVE.has(product.name))) return;
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
  let rowsSignature = "", generation = 0;
  async function applyRows(rows) {
    const signature = JSON.stringify(rows);
    if (signature === rowsSignature) return;
    rowsSignature = signature;
    const current = ++generation;
    const list = SC.parseRows(rows);
    const base = products[slug];
    // Keep old bookmarks working while new links use the table code or name.
    const match = (p) => p.slug === slug || SC.slug(p.name) === slug || (base && SC.key(p.name) === SC.key(base.name));
    const main = list.filter(p => !SC.isPopular(p.category));
    const found = main.find(p => p.slug === slug) || main.find(match) || list.find(match);
    if (found) {
      product = { ...found, desc: found.desc || base?.desc || "", composition: found.composition || base?.composition || "" };
      // Text and buying controls do not need to wait for image downloads.
      renderProduct();
      window.KudaSebetShare.mount($("productShare"), { slug: found.slug, name: found.name });
      const cover = await SC.resolvePhoto(found.photo);
      if (current !== generation) return;
      if (!images.length || displayedPhoto !== found.photo) images = found.photo ? [cover] : SC.defaultPhotos();
      displayedPhoto = found.photo;
      window.KS.IMG[found.name] = images[0];
      renderProduct();
      // Add the remaining slides after the cover is visible.
      SC.resolvePhotos(found.photo).then(photos => {
        if (current !== generation) return;
        images = photos;
        renderProduct();
      }).catch(error => console.warn("Галерея себета не обновлена.", error));
    } else {
      product = { name: "Себет не найден", price: 0, desc: "", composition: "" };
      images = SC.defaultPhotos();
      renderProduct();
    }
    await Promise.all([...$("recommend").querySelectorAll("[data-recommend]")].map(async (card) => {
      const item = list.find(p => !SC.isPopular(p.category) && SC.key(p.name) === SC.key(card.dataset.recommend));
      if (!item) return;
      const active = item.available ?? ACTIVE.has(item.name);
      const href = "product.html?item=" + encodeURIComponent(item.slug);
      const img = await SC.resolvePhoto(item.photo);
      if (current !== generation) return;
      card.classList.toggle("card--soon", !active);
      card.innerHTML = `<a href="${esc(href)}"><div class="card__img"><img src="${esc(img)}" alt="${esc(item.name)}" loading="lazy"></div></a>
        <button class="card-favorite" type="button" data-favorite-id="${esc(item.slug)}" aria-label="Сохранить в избранное">♡</button>
        <h3><a href="${esc(href)}">${esc(item.name)}</a></h3><p class="card__desc">${esc(item.desc)}</p>
        <div class="card__foot"><span class="price">${active ? fmt(item.price) : "Скоро"}</span>${active ? `<button class="btn btn--primary btn--sm" type="button" data-add data-name="${esc(item.name)}" data-price="${item.price}">В корзину</button>` : `<button class="btn btn--sm" type="button" disabled>Скоро</button>`}</div>`;
    }));
    if (window.KudaSebetAccount) window.KudaSebetAccount.catalogChanged();
  }
  const savedRows = SC.cachedRows("Себеттер");
  if (savedRows) applyRows(savedRows).catch(error => console.warn("Сохранённый себет не загружен.", error));
  SC.loadRows("Себеттер").then(applyRows).catch((error) => {
    console.warn("Карточка себета не обновлена.", error);
    if (savedRows) return;
    images = SC.defaultPhotos();
    if (!products[slug]) {
      product = { name: "Не удалось загрузить себет", price: 0, desc: "Попробуйте обновить страницу.", composition: "" };
    }
    renderProduct();
  });
})();
