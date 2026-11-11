/* Куда Себет — веб-приложение */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const CART_KEY = "kuda_sebet_cart_v1", ADDR_KEY = "kuda_sebet_delivery_address_v1", HIDE_KEY = "kuda_sebet_install_hidden_v1";
  const WA = "996509130090";
  const FALLBACK = "assets/img/cards/kuda_sebet_s-removebg-preview_square.png";
  const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const fmt = (n) => Number(n).toLocaleString("ru-RU") + " сом";
  const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const key = (s) => norm(s).toLocaleLowerCase("ru");
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  /* ---------- Данные ---------- */
  const BASE = [
    { id: "sebet-s", name: "Куда Себет S", price: 4790, group: "classic", img: "assets/img/cards/kuda_sebet_s.jpg", desc: "Корзина S — маленький мир сладостей, подобранных с любовью. Каждый элемент выбран так, чтобы порадовать самых близких любителей вкусного.", comp: "«Merci», «Toblerone» mini, сок яблоко-груша 0,25 мл, виноград «Дамские пальчики», фрукт «Сердце дракона», гранат ~600 г, манго ~500 г." },
    { id: "sebet-m", name: "Куда Себет M", price: 6990, group: "classic", img: "assets/img/cards/kuda_sebet_m.jpg", desc: "Подарочная корзина со свежими фруктами и сладостями: ананас, манго, гранат, маракуйя, виноград, «Сердце дракона», печенье в банке и натуральный сок Yan.", comp: "Фрукт «Сердце дракона», гранат, манго, ананас, печенье в банке, маракуйя, сок Yan «Виноград», сеточка под продукты, виноград «Дамские пальчики»." },
    { id: "sebet-vip", name: "Куда Себет Vip", price: 13790, group: "classic", img: "assets/img/cards/kuda_sebet_vip.jpg", desc: "Стильная премиальная корзина для особых случаев. Вместительная, прочная и эстетичная — подчёркивает статус и ценность подарка.", comp: "Виноград «Дамские пальчики», фрукт «Сердце дракона», гранат, манго, ананас, печенье в банке, маракуйя, сок Yan «Яблоко–Груша», сеточка под продукты, шоколад «Toblerone», Raffaello, Ferrero Rocher, большая шоколадка Merci, корзина." },
    { id: "sebet-combo", name: "Куда Себет Комбо 3в1", price: 25570, group: "combo", img: "assets/img/stories/story-combo.webp", desc: "Большая праздничная корзина с богатым составом для семейных торжеств и важных событий.", comp: "Расширенный набор фруктов, сладостей, напитков и фирменная корзина большого объема." }
  ];
  BASE.forEach((p) => { p.category = "Себеттер"; });
  const ACTIVE = new Set(BASE.map((p) => p.name));
  let products = BASE.map((p) => ({ ...p, img: window.KudaSebetSheetCatalog.DEFAULT_PHOTO, images: window.KudaSebetSheetCatalog.defaultPhotos(), available: false }));
  let publishedProducts = null;
  const IMG = Object.fromEntries(BASE.map((p) => [p.name, p.img]));
  const slugify = (s) => String(s || "").trim().toLocaleLowerCase("ru").replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "item";

  const DEFAULT_ITEMS = [
    ["Виноград «Дамские пальчики»", 650, "Фрукты"], ["Фрукт «Сердце дракона»", 520, "Фрукты"], ["Гранат", 290, "Фрукты"],
    ["Манго", 340, "Фрукты"], ["Ананас", 430, "Фрукты"], ["Маракуйя", 230, "Фрукты"],
    ["Печенье в банке", 260, "Сладости"], ["Шоколад «Toblerone»", 310, "Сладости"], ["Raffaello", 320, "Сладости"],
    ["Ferrero Rocher", 350, "Сладости"], ["Большая шоколадка Merci", 420, "Сладости"],
    ["Сок Yan «Яблоко–Груша»", 180, "Напитки"],
    ["Сеточка под продукты", 90, "Упаковка"], ["Корзина", 600, "Упаковка"]
  ].map(([name, price, category]) => ({ name, price, category }));
  const SIZES = [{ id: "s", label: "S", goal: 7 }, { id: "m", label: "M", goal: 9 }, { id: "l", label: "Vip", goal: 12 }];

  /* ---------- Корзина ---------- */
  let cart = [];
  function loadCart() {
    try {
      const d = JSON.parse(store.get(CART_KEY) || "[]");
      cart = Array.isArray(d) ? d.filter((i) => i && i.name).map((i) => ({ name: String(i.name), price: Number(i.price) || 0, qty: Math.max(1, Number(i.qty) || 1), details: typeof i.details === "string" ? i.details : "" })) : [];
    } catch (e) { cart = []; }
  }
  const saveCart = () => store.set(CART_KEY, JSON.stringify(cart));
  function addToCart(name, price, details) {
    loadCart(); details = details || "";
    const ex = cart.find((i) => i.name === name && i.price === Number(price) && i.details === details);
    if (ex) ex.qty += 1; else cart.push({ name, price: Number(price), qty: 1, details });
    saveCart(); updateBadges(); if (route === "cart") renderCart();
  }
  function updateBadges() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    $$("[data-count]").forEach((b) => { b.textContent = count > 99 ? "99+" : String(count); b.hidden = count === 0; });
  }

  /* ---------- Навигация ---------- */
  const PAGES = ["home", "builder", "cart", "profile"];
  let route = "home";
  function go(page, opts) {
    if (!PAGES.includes(page)) page = "home";
    route = page;
    $$(".page").forEach((p) => { p.hidden = p.dataset.page !== page; });
    $$(".tab").forEach((t) => t.classList.toggle("is-on", t.dataset.go === page));
    if (page === "cart") { loadCart(); renderCart(); }
    if (!(opts && opts.keepScroll)) window.scrollTo(0, 0);
    if (location.hash !== "#" + page) history.replaceState(null, "", "#" + page);
  }
  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]"); if (g) { go(g.dataset.go); return; }
    const c = e.target.closest("[data-cat]"); if (c) { bCategory = c.dataset.cat; go("builder"); renderBuilder(); return; }
    if (e.target.closest("#toProducts")) { const el = $("#products"); if (el) el.scrollIntoView({ block: "start" }); return; }
    if (e.target.closest("[data-install]")) { install(); return; }
    const inf = e.target.closest("[data-info]"); if (inf) { openInfo(inf.dataset.info); return; }
    if (e.target.closest("#locBtn")) { openInfo("delivery"); return; }
  });
  window.addEventListener("hashchange", () => go(location.hash.slice(1), { keepScroll: false }));

  /* ---------- Каталог ---------- */
  let filter = "all", query = "";
  function renderFilters() {
    const cats = [...new Set(products.map((p) => p.category))];
    if (filter !== "all" && !cats.includes(filter)) filter = "all";
    const box = $("#filters");
    box.hidden = cats.length < 2;
    box.innerHTML = ["all"].concat(cats).map((c) => `<button class="chip${c === filter ? " is-on" : ""}" type="button" data-f="${esc(c)}">${c === "all" ? "Все" : esc(c)}</button>`).join("");
  }
  function renderGrid() {
    renderFilters();
    const list = products.filter((p) => (filter === "all" || p.category === filter) && key(p.name).includes(key(query)));
    $("#grid").innerHTML = list.map((p) => `<article class="pcard">
      <button class="pcard__open" type="button" data-open="${esc(p.id)}" style="border:0;background:none;text-align:left;padding:0;display:flex;flex-direction:column;flex:1">
        <div class="pcard__img"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy"></div>
        <div class="pcard__body"><div class="pcard__name">${esc(p.name)}</div><div class="pcard__price">${fmt(p.price)}</div></div>
      </button>
      <button class="pcard__favorite" type="button" data-favorite-id="${esc(p.id)}" aria-label="Сохранить в избранное">♡</button>
      ${(p.available ?? ACTIVE.has(p.name)) ? `<button class="pcard__add" type="button" data-quick="${esc(p.id)}" aria-label="Добавить ${esc(p.name)} в корзину">+</button>` : `<span class="pcard__soon">Скоро</span>`}</article>`).join("");
    $("#noResults").hidden = list.length > 0;
    if (publishedProducts !== products) {
      const registry = {};
      products.forEach((p) => {
        const id = String(p.id || "").replace(/-popular$/, "");
        const slug = p.slug || id;
        registry[id] = { slug, name: p.name, price: p.price, priceText: fmt(p.price), image: p.img || window.KudaSebetSheetCatalog.DEFAULT_PHOTO, href: "./product.html?item=" + encodeURIComponent(slug) };
      });
      window.KudaSebetProducts = Object.assign(window.KudaSebetProducts || {}, registry);
      publishedProducts = products;
    }
    if (window.KudaSebetAccount) window.KudaSebetAccount.catalogChanged();
  }
  $("#search").addEventListener("input", (e) => { query = e.target.value; renderGrid(); });
  $("#filters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    filter = b.dataset.f; renderGrid();
  });
  $("#grid").addEventListener("click", (e) => {
    const q = e.target.closest("[data-quick]");
    if (q) {
      const p = products.find((x) => x.id === q.dataset.quick); if (!p || !(p.available ?? ACTIVE.has(p.name))) return;
      addToCart(p.name, p.price);
      q.textContent = "✓"; q.classList.add("is-done");
      setTimeout(() => { q.textContent = "+"; q.classList.remove("is-done"); }, 1000);
      return;
    }
    const o = e.target.closest("[data-open]"); if (o) openProduct(o.dataset.open);
  });

  /* ---------- Шторка ---------- */
  const overlay = $("#overlay"), sheet = $("#sheet");
  function openSheet(html) {
    sheet.innerHTML = `<div class="sheet__grab"></div><button class="sheet__close" type="button" data-close aria-label="Закрыть">×</button>${html}`;
    overlay.hidden = false; document.body.style.overflow = "hidden"; sheet.scrollTop = 0;
  }
  function closeSheet() { overlay.hidden = true; sheet.innerHTML = ""; document.body.style.overflow = ""; }
  overlay.addEventListener("click", (e) => { if (e.target === overlay || e.target.closest("[data-close]")) closeSheet(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) closeSheet(); });

  function openProduct(id) {
    const p = products.find((x) => x.id === id); if (!p) return;
    const active = (p.available ?? ACTIVE.has(p.name));
    const photos = p.images || [p.img];
    openSheet(`<div class="sheet__img" id="sheetGallery"><img src="${esc(photos[0])}" alt="${esc(p.name)}"></div>
      ${photos.length > 1 ? `<div class="chips" id="sheetPhotos">${photos.map((src, i) => `<button class="chip${i === 0 ? " is-on" : ""}" type="button" data-photo="${i}" aria-label="Фото ${i + 1}">${i + 1}</button>`).join("")}</div>` : ""}
      <div class="product-share-slot" id="sheetShare"></div>
      <h2>${esc(p.name)}</h2><div class="sheet__price">${fmt(p.price)}</div>
      ${p.desc ? `<p>${esc(p.desc)}</p>` : ""}${p.comp ? `<p><b>Состав:</b> ${esc(p.comp)}</p>` : ""}
      <button class="btn btn--block" type="button" id="sheetAdd"${active ? "" : " disabled"}>${active ? "Добавить в корзину" : "Скоро в продаже"}</button>`);
    window.KudaSebetShare.mount($("#sheetShare"), { slug: p.slug || window.KudaSebetSheetCatalog.slug(p.name), name: p.name });
    const add = $("#sheetAdd");
    const showPhoto = index => {
      $("#sheetGallery img").src = photos[index];
      $$("#sheetPhotos [data-photo]").forEach((button, i) => button.classList.toggle("is-on", i === index));
    };
    const selectPhoto = window.KudaSebetSheetCatalog?.bindGallery($("#sheetGallery"), photos.length, showPhoto);
    $("#sheetPhotos")?.addEventListener("click", event => {
      const button = event.target.closest("[data-photo]");
      if (button) (selectPhoto || showPhoto)(Number(button.dataset.photo));
    });
    if (active) add.addEventListener("click", (e) => { addToCart(p.name, p.price); e.currentTarget.textContent = "✓ Добавлено"; setTimeout(closeSheet, 600); });
  }

  const INFO = {
    delivery: ["Способы доставки", "<p>Доставка курьером по Бишкеку, самовывоз из пункта выдачи или точечная доставка ко времени. Работаем со вторника по воскресенье, с 10:00 до 20:00.</p><p>В день отправки присылаем фото готовой корзины перед выездом.</p>"],
    payment: ["Способы оплаты", "<p>Онлайн-оплата картой, перевод по номеру телефона и безналичный счет для компаний.</p><p>Чек и подтверждение оплаты отправляются сразу после оформления.</p>"],
    safety: ["Безопасность заказа", "<p>Каждая корзина собирается вручную и фиксируется для безопасной перевозки.</p><p>Перед отправкой проводится контроль качества и проверка комплектации.</p>"],
    policy: ["Политика конфиденциальности", "<p>1. Мы собираем только минимально необходимые данные: имя, телефон, адрес доставки, состав заказа и способ оплаты.</p><p>2. Данные используются только для обработки заказа, доставки, обратной связи и возврата средств при необходимости.</p><p>3. Мы не передаем данные третьим лицам, кроме служб доставки и платежных провайдеров.</p><p>4. Данные хранятся ограниченный срок и защищены техническими и организационными мерами.</p><p>5. Для запроса удаления данных можно написать на support@mukashov.com.</p>"]
  };
  function openInfo(k) { const it = INFO[k]; if (it) openSheet(`<h2>${esc(it[0])}</h2>${it[1]}`); }

  /* ---------- Конструктор ---------- */
  let items = DEFAULT_ITEMS.slice(), bCategory = "Все", bSize = "s";
  const bQty = new Map();
  const goal = () => SIZES.find((s) => s.id === bSize).goal;
  function selection() {
    let total = 0, count = 0; const sel = [];
    items.forEach((it) => { const q = bQty.get(it.name) || 0; if (q > 0) { sel.push({ ...it, qty: q }); total += it.price * q; count += q; } });
    return { sel, total, count };
  }
  function renderBuilder() {
    $("#sizes").innerHTML = SIZES.map((s) => `<button class="size${s.id === bSize ? " is-on" : ""}" type="button" data-size="${s.id}"><strong>${s.label}</strong><small>от ${s.goal} позиций</small></button>`).join("");
    const cats = ["Все"].concat([...new Set(items.map((i) => i.category))]);
    if (!cats.includes(bCategory)) bCategory = "Все";
    $("#bChips").innerHTML = cats.map((c) => `<button class="chip${c === bCategory ? " is-on" : ""}" type="button" role="tab" data-chip="${esc(c)}">${esc(c)}</button>`).join("");
    const shown = items.filter((i) => bCategory === "Все" || i.category === bCategory);
    $("#bList").innerHTML = shown.map((it) => `<div class="item" data-name="${esc(it.name)}"><div class="item__main"><div class="item__name">${esc(it.name)}</div><div class="item__price">${fmt(it.price)}</div></div>
      <div class="stepper"><button type="button" data-d="-1" aria-label="Убрать ${esc(it.name)}">−</button><span>${bQty.get(it.name) || 0}</span><button type="button" data-d="1" aria-label="Добавить ${esc(it.name)}">+</button></div></div>`).join("");
    renderProgress();
  }
  function renderProgress() {
    const { total, count } = selection(), g = goal();
    $("#bCount").textContent = count + " " + (count % 10 === 1 && count % 100 !== 11 ? "позиция" : (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? "позиции" : "позиций"));
    $("#bGoal").textContent = count === 0 ? "Ваша корзина только начинается" : count >= g ? "Набор собран" : "Ещё " + (g - count) + " до размера " + SIZES.find((s) => s.id === bSize).label;
    $("#bBar").style.width = Math.min(100, (count / g) * 100) + "%";
    $("#bTotal").textContent = fmt(total);
    $("#bAdd").disabled = count === 0;
  }
  $("#sizes").addEventListener("click", (e) => { const b = e.target.closest("[data-size]"); if (!b) return; bSize = b.dataset.size; renderBuilder(); });
  $("#bChips").addEventListener("click", (e) => { const b = e.target.closest("[data-chip]"); if (!b) return; bCategory = b.dataset.chip; renderBuilder(); });
  $("#bList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-d]"); if (!b) return;
    const row = b.closest(".item"), name = row.dataset.name;
    const q = Math.max(0, (bQty.get(name) || 0) + Number(b.dataset.d));
    if (q) bQty.set(name, q); else bQty.delete(name);
    row.querySelector(".stepper span").textContent = String(q);
    renderProgress();
  });
  $("#bAdd").addEventListener("click", () => {
    const { sel, total, count } = selection(); if (!sel.length) return;
    addToCart(`Өзүң чогулт (${count} поз.)`, total, "Состав: " + sel.map((i) => `${i.name} ×${i.qty}`).join(", "));
    bQty.clear(); renderBuilder(); go("cart");
  });

  /* ---------- Страница корзины ---------- */
  function renderCart() {
    const body = $("#cartBody");
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty"><div class="em">🧺</div><h2>Здесь пока пусто</h2><p>Добавьте готовый себет или соберите свою корзину.</p><button class="btn" type="button" data-go="home">Выбрать подарок</button></div>`;
      updateBadges(); return;
    }
    let total = 0, count = 0;
    const rows = cart.map((it, i) => {
      total += it.price * it.qty; count += it.qty;
      return `<div class="cart-row"><img src="${esc(IMG[it.name] || FALLBACK)}" alt="">
        <div class="cart-row__main"><div class="cart-row__name">${esc(it.name)}</div>${it.details ? `<div class="cart-row__det">${esc(it.details)}</div>` : ""}
          <div class="cart-row__sum">${fmt(it.price * it.qty)}</div>
          <div class="stepper"><button type="button" data-ci="${i}" data-d="-1" aria-label="Меньше">−</button><span>${it.qty}</span><button type="button" data-ci="${i}" data-d="1" aria-label="Больше">+</button></div></div></div>`;
    }).join("");
    body.innerHTML = `<div class="list">${rows}</div>
      <div class="rows"><div class="r"><span>Товаров</span><span>${count}</span></div><div class="r total"><span>Итого</span><span>${fmt(total)}</span></div></div>
      <div class="group__title">Адрес доставки</div>
      <div class="group"><div class="field"><label for="addr">Улица, дом, квартира</label><input id="addr" type="text" autocomplete="street-address" placeholder="Например, ул. Токтогула 100, кв. 5"><div class="field__meta"><button class="link" type="button" id="geoBtn">Определить автоматически</button><span class="field__status" id="addrStatus" aria-live="polite"></span></div></div></div>
      <p class="note">Менеджер подтвердит наличие и адрес доставки в WhatsApp. Перед оформлением убедитесь, что адрес указан верно.</p>
      <button class="btn btn--block" type="button" id="checkout">Оформить в WhatsApp</button>
      <button class="btn btn--block btn--gray" type="button" data-go="home" style="margin-top:10px">Продолжить покупки</button>`;
    const input = $("#addr"); input.value = norm(store.get(ADDR_KEY) || "");
    input.addEventListener("input", () => { store.set(ADDR_KEY, norm(input.value)); $("#addrStatus").textContent = ""; });
    $("#geoBtn").addEventListener("click", (e) => detectAddress(e.currentTarget, input, $("#addrStatus")));
    $("#checkout").addEventListener("click", checkout);
    updateBadges();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ci]"); if (!b) return;
    const i = Number(b.dataset.ci), it = cart[i]; if (!it) return;
    it.qty += Number(b.dataset.d);
    if (it.qty <= 0) cart.splice(i, 1);
    saveCart(); updateBadges(); renderCart();
  });
  function detectAddress(btn, input, statusEl) {
    const status = (t, err) => { statusEl.textContent = t || ""; statusEl.classList.toggle("is-error", !!err); };
    if (!navigator.geolocation) { status("Геолокация недоступна", true); return; }
    btn.disabled = true; status("Определяем адрес...");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = Number(pos.coords.latitude.toFixed(6)), lon = Number(pos.coords.longitude.toFixed(6));
      let found = "";
      try {
        const r = await fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + lat + "&lon=" + lon + "&accept-language=ru");
        if (r.ok) { const d = await r.json(); found = norm(String(d.display_name || "").replace(/,\s*\d{6}\s*,\s*(Киргизия|Кыргызстан|Kyrgyzstan)\.?$/i, "").replace(/,\s*(Киргизия|Кыргызстан|Kyrgyzstan)\.?$/i, "")); }
      } catch (e) { found = ""; }
      input.value = found || "Координаты: " + lat + ", " + lon;
      store.set(ADDR_KEY, input.value);
      status(found ? "Адрес определен" : "Точка определена по геолокации");
      btn.disabled = false;
    }, () => { status("Не удалось определить геопозицию", true); btn.disabled = false; }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }
  function checkout() {
    loadCart(); if (!cart.length) return;
    const input = $("#addr"), address = norm(input ? input.value : store.get(ADDR_KEY));
    if (!address) { const s = $("#addrStatus"); s.textContent = "Укажите адрес доставки"; s.classList.add("is-error"); if (input) input.focus(); return; }
    store.set(ADDR_KEY, address);
    const lines = ["Здравствуйте! Хочу заказать подарочные корзины:", "Адрес доставки: " + address];
    let total = 0;
    cart.forEach((it) => { lines.push("• " + it.name + " × " + it.qty + " — " + it.price * it.qty + " сом"); if (it.details) lines.push("   " + it.details); total += it.price * it.qty; });
    lines.push("Итого: " + total + " сом");
    window.location.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  /* ---------- Установка на экран «Домой» ---------- */
  const ua = navigator.userAgent || "";
  const isStandalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; });
  const ico = (id) => `<svg class="i"><use href="#${id}"/></svg>`;
  async function install() {
    if (isStandalone) { openSheet(`<h2>Уже установлено</h2><p>Куда Себет уже добавлен на экран «Домой» этого устройства.</p>`); return; }
    if (deferredPrompt) { deferredPrompt.prompt(); try { await deferredPrompt.userChoice; } catch (e) { /* ignore */ } deferredPrompt = null; return; }
    if (isIOS) {
      openSheet(`<h2>Добавить на экран «Домой»</h2>
        <p>На iPhone и iPad это делается за несколько секунд через меню браузера:</p>
        <ol class="steps">
          <li><span class="n">1</span><span>Нажмите «Поделиться» ${ico("i-share")} внизу экрана Safari (в Chrome — справа от адресной строки).</span></li>
          <li><span class="n">2</span><span>Прокрутите список и выберите «На экран “Домой”» ${ico("i-plus-sq")}.</span></li>
          <li><span class="n">3</span><span>Нажмите «Добавить» — иконка «Куда Себет» появится среди ваших приложений.</span></li>
        </ol>
        <button class="btn btn--block btn--gray" type="button" data-close>Понятно</button>`);
      return;
    }
    const android = /android/i.test(ua);
    openSheet(`<h2>Установить приложение</h2>
      <ol class="steps">
        <li><span class="n">1</span><span>${android ? "Откройте меню браузера (⋮)." : "Откройте меню браузера или значок установки в адресной строке."}</span></li>
        <li><span class="n">2</span><span>${android ? "Выберите «Добавить на главный экран»." : "Выберите «Установить приложение»."}</span></li>
      </ol>
      <button class="btn btn--block btn--gray" type="button" data-close>Понятно</button>`);
  }
  const banner = $("#installBanner");
  if (!isStandalone && store.get(HIDE_KEY) !== "1") banner.hidden = false;
  $("#installClose").addEventListener("click", () => { banner.hidden = true; store.set(HIDE_KEY, "1"); });
  if (isStandalone) $("#installHint").textContent = "Установлено";

  /* ---------- Google Sheets (необязательно) ---------- */
  const price = (v) => { const s = String(v ?? "").trim(), n = Number(s.replace(/\s+/g, "").replace(",", ".")); return s && Number.isFinite(n) && n >= 0 ? n : null; };
  function sheetRows(rows) {
    if (window.KudaSebetSheetCatalog) return window.KudaSebetSheetCatalog.parseRows(rows);
    if (!Array.isArray(rows) || rows.length < 2) return [];
    const h = rows[0].map((c) => String(c || "").trim().toLocaleLowerCase("ru"));
    const ci = Math.max(0, h.findIndex((x) => /катег/.test(x))), ni = Math.max(1, h.findIndex((x) => /себет|корзин|товар|наимен/.test(x))), pi = Math.max(2, h.findIndex((x) => /цен|price|стоим/.test(x)));
    return rows.slice(1).flatMap((r) => {
      const category = String(r?.[ci] ?? "").trim(), name = String(r?.[ni] ?? "").trim(), cost = price(r?.[pi]);
      return category && name && cost !== null ? [{ category, name, price: cost }] : [];
    });
  }
  const CACHE_B = "kuda_sebet_sheet_baskets_v1", CACHE_I = "kuda_sebet_sheet_items_v1";
  let basketGeneration = 0;
  async function applyBaskets(rows) {
    const list = sheetRows(rows); if (!list.length) return false;
    const current = ++basketGeneration;
    const pool = BASE.map((p) => ({ ...p })), next = [];
    list.forEach((sp) => {
      let i = pool.findIndex((c) => key(c.name) === key(sp.name));
      if (i < 0) i = pool.findIndex((c) => key(c.category) === key(sp.category) && c.price === sp.price);
      const base = i >= 0 ? pool[i] : { id: window.KudaSebetSheetCatalog.slug(sp.name), img: FALLBACK, desc: "", comp: "" };
      next.push({ ...base, ...sp, id: sp.slug + (window.KudaSebetSheetCatalog.isPopular(sp.category) ? "-popular" : ""), name: sp.name, price: sp.price, category: sp.category, desc: sp.desc || base.desc, comp: sp.composition || base.comp });
    });
    await Promise.all(next.map(async (p) => { p.images = await window.KudaSebetSheetCatalog.resolvePhotos(p.photo); p.img = p.images[0]; }));
    if (current !== basketGeneration) return false;
    products = next;
    products.forEach((p) => { IMG[p.name] = p.img; });
    renderGrid();
    return true;
  }
  function applyItems(rows) {
    const list = sheetRows(rows); if (!list.length) return false;
    items = list; renderBuilder(); return true;
  }
  function cached(k) { try { return JSON.parse(store.get(k) || "null"); } catch (e) { return null; } }
  async function loadSheets() {
    const cb = cached(CACHE_B), ci = cached(CACHE_I);
    const SC = window.KudaSebetSheetCatalog; if (!SC) return;
    // Start network refreshes before resolving any cached photo galleries.
    const freshBaskets = SC.loadRows("Себеттер"), freshItems = SC.loadRows("Товары");
    if (cb) applyBaskets(cb).catch(error => console.warn("Сохранённый каталог не загружен.", error));
    if (ci) applyItems(ci);
    freshBaskets.then(async rows => { if (await applyBaskets(rows)) store.set(CACHE_B, JSON.stringify(rows)); }).catch(error => console.warn("Каталог себетов не обновлён.", error));
    freshItems.then(rows => { if (applyItems(rows)) store.set(CACHE_I, JSON.stringify(rows)); }).catch(error => console.warn("Каталог конструктора не обновлён.", error));
  }

  /* ---------- Старт ---------- */
  loadCart(); updateBadges(); renderGrid(); renderBuilder();
  go(PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : "home", { keepScroll: true });
  loadSheets();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  window.addEventListener("storage", (e) => { if (e.key === CART_KEY) { loadCart(); updateBadges(); if (route === "cart") renderCart(); } });
  document.addEventListener("error", (e) => { const t = e.target; if (t && t.tagName === "IMG" && !t.dataset.fb) { t.dataset.fb = "1"; t.src = FALLBACK; } }, true);
})();
