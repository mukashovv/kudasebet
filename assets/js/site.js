/* Куда Себет — общий скрипт: корзина, адрес, окна. Подключается на всех страницах магазина. */
(function () {
  "use strict";
  const CART_KEY = "kuda_sebet_cart_v1";
  const ADDR_KEY = "kuda_sebet_delivery_address_v1";
  const COORDS_KEY = "kuda_sebet_delivery_coords_v1";
  const WA = "996509130090";
  const FALLBACK = "assets/img/cards/kuda_sebet_s-removebg-preview_square.png";
  const IMG = {
    "Куда Себет S": "assets/img/cards/kuda_sebet_s.jpg",
    "Куда Себет M": "assets/img/cards/kuda_sebet_m.jpg",
    "Куда Себет Vip": "assets/img/cards/kuda_sebet_vip.jpg",
    "Куда Себет Комбо 3в1": "assets/img/stories/story-combo.webp"
  };

  const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const fmt = (n) => Number(n).toLocaleString("ru-RU") + " сом";
  const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const cleanAddr = (a) => norm(a)
    .replace(/,\s*\d{6}\s*,\s*(Киргизия|Кыргызстан|Kyrgyzstan)\.?$/i, "")
    .replace(/,\s*(Киргизия|Кыргызстан|Kyrgyzstan)\.?$/i, "")
    .replace(/,\s*\d{6}$/i, "");
  const inputAddr = (a) => norm(cleanAddr(a).replace(/,\s*г\.?\s+/i, ", ").replace(/,\s*город\s+/i, ", ").replace(/^\s*г\.?\s+/i, "").replace(/^\s*город\s+/i, ""));

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  /* ---------- Корзина ---------- */
  let cart = [];
  function loadCart() {
    try {
      const d = JSON.parse(store.get(CART_KEY) || "[]");
      cart = Array.isArray(d) ? d.filter((i) => i && i.name).map((i) => ({
        name: String(i.name), price: Number(i.price) || 0,
        qty: Math.max(1, Number(i.qty) || 1), details: typeof i.details === "string" ? i.details : ""
      })) : [];
    } catch (e) { cart = []; }
  }
  const saveCart = () => store.set(CART_KEY, JSON.stringify(cart));
  function add(name, price, details) {
    loadCart();
    details = details || "";
    const ex = cart.find((i) => i.name === name && i.price === Number(price) && i.details === details);
    if (ex) ex.qty += 1; else cart.push({ name, price: Number(price), qty: 1, details });
    saveCart(); renderCart();
  }

  /* ---------- Адрес ---------- */
  const getAddr = () => norm(store.get(ADDR_KEY) || "");
  function getCoords() {
    try {
      const c = JSON.parse(store.get(COORDS_KEY) || "null");
      return c && typeof c.lat === "number" && typeof c.lon === "number" ? c : null;
    } catch (e) { return null; }
  }
  function setAddr(address, coords) {
    address = norm(address);
    if (address) store.set(ADDR_KEY, address); else store.del(ADDR_KEY);
    if (coords) store.set(COORDS_KEY, JSON.stringify(coords)); else store.del(COORDS_KEY);
    return address;
  }
  function mapSrc(address, coords) {
    if (coords) return "https://www.google.com/maps?q=" + encodeURIComponent(coords.lat + "," + coords.lon) + "&z=16&output=embed";
    return address ? "https://www.google.com/maps?q=" + encodeURIComponent(address) + "&z=16&output=embed" : "";
  }
  function geo(btn, input, statusEl, done) {
    const status = (t, err) => { statusEl.textContent = t || ""; statusEl.classList.toggle("is-error", !!err); };
    if (!navigator.geolocation) { status("Геолокация недоступна в браузере", true); return; }
    btn.disabled = true; status("Определяем адрес...");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords = { lat: Number(pos.coords.latitude.toFixed(6)), lon: Number(pos.coords.longitude.toFixed(6)) };
      let found = "";
      try {
        const r = await fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + coords.lat + "&lon=" + coords.lon + "&accept-language=ru");
        if (r.ok) { const d = await r.json(); found = inputAddr(d.display_name || ""); }
      } catch (e) { found = ""; }
      const finalAddr = found || "Координаты: " + coords.lat + ", " + coords.lon;
      input.value = finalAddr;
      setAddr(finalAddr, coords);
      status(found ? "Адрес определен автоматически" : "Точка определена по геолокации");
      btn.disabled = false;
      if (done) done(finalAddr, coords);
    }, () => { status("Не удалось определить геопозицию", true); btn.disabled = false; },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }

  /* ---------- Разметка окон ---------- */
  document.body.insertAdjacentHTML("beforeend", `
    <div class="overlay overlay--right" id="ksCart" hidden>
      <aside class="drawer" role="dialog" aria-modal="true" aria-label="Корзина">
        <div class="drawer__head"><h2>Ваш заказ</h2><button class="icon-btn" type="button" data-close aria-label="Закрыть">×</button></div>
        <div class="drawer__list" id="ksCartList"></div>
        <div class="drawer__foot">
          <div class="drawer__total"><span>Сумма</span><span id="ksCartTotal">0 сом</span></div>
          <label class="field-label" for="ksAddr">Укажите адрес</label>
          <input class="input" id="ksAddr" type="text" placeholder="Улица, дом, квартира" autocomplete="street-address">
          <div class="addr-meta"><button class="link-btn" type="button" id="ksGeo">Определить автоматически</button><span class="addr-status" id="ksAddrStatus" aria-live="polite"></span></div>
          <div class="addr-map" id="ksMapWrap" hidden><iframe id="ksMap" title="Проверка адреса доставки на карте" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
          <p class="note">Перед оформлением заказа убедитесь в правильности указанного адреса.</p>
          <button class="btn btn--primary btn--lg btn--block" type="button" id="ksCheckout">Оформить через WhatsApp</button>
        </div>
      </aside>
    </div>
    <div class="overlay overlay--center" id="ksModal" hidden>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="ksModalTitle">
        <button class="icon-btn modal__close" type="button" data-close aria-label="Закрыть">×</button>
        <h2 id="ksModalTitle"></h2>
        <div class="modal__body" id="ksModalBody"></div>
      </div>
    </div>`);

  const $ = (id) => document.getElementById(id);
  const cartOv = $("ksCart"), modalOv = $("ksModal");
  const addrInput = $("ksAddr"), addrStatus = $("ksAddrStatus"), mapWrap = $("ksMapWrap"), mapFrame = $("ksMap");

  function renderMap() {
    const src = mapSrc(norm(addrInput.value), getCoords());
    if (!src) { mapFrame.removeAttribute("src"); mapWrap.hidden = true; return; }
    if (mapFrame.getAttribute("src") !== src) mapFrame.src = src;
    mapWrap.hidden = false;
  }

  function renderCart() {
    let total = 0, count = 0;
    const list = $("ksCartList");
    if (!cart.length) list.innerHTML = '<div class="cart-empty">Корзина пуста</div>';
    else list.innerHTML = cart.map((it, i) => {
      total += it.price * it.qty; count += it.qty;
      return `<div class="cart-row">
        <img src="${esc(IMG[it.name] || FALLBACK)}" alt="">
        <div><div class="cart-row__name">${esc(it.name)}</div>${it.details ? `<div class="cart-row__details">${esc(it.details)}</div>` : ""}
          <div class="qty"><button type="button" data-act="dec" data-i="${i}" aria-label="Меньше">−</button><span>${it.qty}</span><button type="button" data-act="inc" data-i="${i}" aria-label="Больше">+</button></div></div>
        <div class="cart-row__sum">${fmt(it.price * it.qty)}</div></div>`;
    }).join("");
    $("ksCartTotal").textContent = fmt(total);
    document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = count > 99 ? "99+" : String(count); el.hidden = count === 0; });
  }

  function openCart() {
    loadCart(); renderCart();
    addrInput.value = getAddr(); renderMap();
    cartOv.hidden = false; document.body.style.overflow = "hidden";
  }
  function closeAll() { cartOv.hidden = true; modalOv.hidden = true; document.body.style.overflow = ""; }
  function modal(title, html) {
    $("ksModalTitle").textContent = title;
    const body = $("ksModalBody"); body.innerHTML = html;
    modalOv.hidden = false; document.body.style.overflow = "hidden";
    return body;
  }

  $("ksCartList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const it = cart[Number(b.dataset.i)]; if (!it) return;
    it.qty += b.dataset.act === "inc" ? 1 : -1;
    if (it.qty <= 0) cart.splice(Number(b.dataset.i), 1);
    saveCart(); renderCart();
  });
  let mapTimer = 0;
  addrInput.addEventListener("input", () => {
    setAddr(addrInput.value, null); addrStatus.textContent = "";
    clearTimeout(mapTimer); mapTimer = setTimeout(renderMap, 300);
  });
  $("ksGeo").addEventListener("click", () => geo($("ksGeo"), addrInput, addrStatus, renderMap));
  $("ksCheckout").addEventListener("click", () => {
    loadCart();
    if (!cart.length) { alert("Добавьте хотя бы одну позицию"); return; }
    const address = norm(addrInput.value || getAddr());
    if (!address) { addrStatus.textContent = "Укажите адрес доставки"; addrStatus.classList.add("is-error"); addrInput.focus(); return; }
    setAddr(address, getCoords());
    const lines = ["Здравствуйте! Хочу заказать:", "Адрес доставки: " + cleanAddr(address)];
    let total = 0;
    cart.forEach((it) => {
      lines.push("• " + it.name + " × " + it.qty + " — " + it.price * it.qty + " сом");
      if (it.details) lines.push("   " + it.details);
      total += it.price * it.qty;
    });
    lines.push("Итого: " + total + " сом");
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n")), "_blank");
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-cart]")) { e.preventDefault(); openCart(); return; }
    if (e.target === cartOv || e.target === modalOv || e.target.closest("[data-close]")) closeAll();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  window.addEventListener("storage", (e) => { if (e.key === CART_KEY) { loadCart(); renderCart(); } });
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && !t.dataset.fb) { t.dataset.fb = "1"; t.src = FALLBACK; }
  }, true);

  /* Мобильное меню в шапке */
  const menuBtn = $("menuBtn"), compact = $("compactMenu");
  if (menuBtn && compact) {
    menuBtn.addEventListener("click", (e) => { e.stopPropagation(); compact.hidden = !compact.hidden; menuBtn.setAttribute("aria-expanded", String(!compact.hidden)); });
    compact.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", () => { compact.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); });
  }
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".support-dropdown[open]").forEach((menu) => {
      if (!menu.contains(e.target)) menu.removeAttribute("open");
    });
  });

  loadCart(); renderCart();

  window.KS = { add, fmt, esc, norm, FALLBACK, IMG, WA, modal, closeAll, openCart, geo, getAddr, setAddr, cleanAddr, inputAddr };
})();
