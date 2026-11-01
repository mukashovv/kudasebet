/* Куда Себет — личный конструктор корзины */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const WA = "996509130090";
  const STATE_KEY = "kuda_pb_state_v2", CATALOG_KEY = "kuda_pb_catalog_v2", UNLOCK_KEY = "kuda_pb_unlocked_v1";
  /* SHA-256 пароля раздела «Комиссия». Пустое значение = раздел заблокирован.
     Получить хэш: в консоли браузера выполнить
     crypto.subtle.digest("SHA-256", new TextEncoder().encode("ПАРОЛЬ")).then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("")))  */
  const COMMISSION_HASH = "";

  const FALLBACK = [["Печенья", "Печенье в банке", 590], ["Печенья", "Елочка Печенья", 600], ["Печенья", "Oreo Original", 310], ["Печенья", "Choco Pie (12 шт)", 280], ["Печенья", "Юбилейное шоколадное", 170], ["Печенья", "Milka Choco Cookie", 230], ["Конфеты", "Raffaello", 800], ["Конфеты", "Ferrero Rocher", 1800], ["Конфеты", "Ferrero Rocher (8 шт)", 850], ["Конфеты", "Fiorella LA TRUFA, 200 г", 215], ["Конфеты", "Kinder Дед Мороз", 240], ["Конфеты", "Коркунов ассорти", 350], ["Конфеты", "M&M's", 190], ["Конфеты", "Китайские конфеты", 0], ["Сладости", "Маленький Merci", 400], ["Сладости", "Большая шоколадка Merci", 1150], ["Сладости", "Toblerone мини", 190], ["Сладости", "Toblerone шоколад", 800], ["Сладости", "Горький шоколад", 580], ["Сладости", "Ritter Sport", 731], ["Сладости", "Milka Alpine Milk", 240], ["Сладости", "Nutella mini", 300], ["Фрукты", "Сердце дракона фрукт", 250], ["Фрукты", "Гранат", 320], ["Фрукты", "Манго", 450], ["Фрукты", "Ананас", 620], ["Фрукты", "Маракуйя", 200], ["Фрукты", "Мандарины 7 шт", 160], ["Фрукты", "Мандарины 1 кг", 160], ["Алкоголь", "Шампанское Santo Stefano", 530], ["Алкоголь", "Хорошее шампанское", 1000], ["Алкоголь", "Martini Asti", 1650], ["Алкоголь", "Jagermeister 0.5", 2300], ["Алкоголь", "Jack Daniel's 0.5", 2400], ["Алкоголь", "Вино Rioja", 1800], ["Соки", "Yan маленький Яблоко-Груша", 135], ["Соки", "Сок Yan Виноград", 430], ["Соки", "Сок Yan Яблоко-Груша", 430], ["Соки", "Rich Апельсин 1л", 220], ["Соки", "J7 Яблоко 1л", 210], ["Соки", "Organic 1л", 190], ["Соки", "Чай (Richard)", 340], ["Газировки", "Coca-Cola 1л", 140], ["Газировки", "Fanta 1л", 140], ["Газировки", "Sprite 1л", 140], ["Газировки", "Schweppes 1л", 180], ["Газировки", "Шампанское (Праздничное)", 220], ["Дополнительно", "Икра 50-100гр", 1790], ["Дополнительно", "Сеточка под продукты", 200], ["Дополнительно", "Декор", 250], ["Дополнительно", "Елочки", 250], ["Дополнительно", "Ткань", 150], ["Дополнительно", "Корзина S", 500], ["Дополнительно", "Корзина M", 750], ["Дополнительно", "Корзина Vip", 850], ["Дополнительно", "Корзина (новогодняя)", 400], ["Дополнительно", "Корзина (базовая)", 600]];

  const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const fmt = (n) => Math.round(Number(n) || 0).toLocaleString("ru-RU") + " сом";
  const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
  const store = {
    get(k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) { /* ignore */ } },
    del(k, s) { try { (s ? sessionStorage : localStorage).removeItem(k); } catch (e) { /* ignore */ } }
  };
  const plural = (n, a, b, c) => { const m = n % 100, d = n % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d >= 2 && d <= 4 ? b : c; };
  const parsePrice = (v) => { const s = String(v ?? "").trim().replace(/\s+/g, "").replace(",", "."); if (!s) return null; const n = Number(s); return Number.isFinite(n) && n >= 0 ? n : null; };

  /* ---------- Состояние ---------- */
  let catalog = [];                 // из таблицы или запасной
  const S = { qty: {}, prices: {}, custom: [], collapsed: {}, pct: 0 };
  let priceMode = false, editMode = false, unlocked = store.get(UNLOCK_KEY, true) === "1";
  let customQty = 1;

  function loadState() {
    try {
      const d = JSON.parse(store.get(STATE_KEY) || "null");
      if (!d) return;
      S.qty = d.qty && typeof d.qty === "object" ? d.qty : {};
      S.prices = d.prices && typeof d.prices === "object" ? d.prices : {};
      S.custom = Array.isArray(d.custom) ? d.custom.filter((c) => c && c.name && c.category) : [];
      S.collapsed = d.collapsed && typeof d.collapsed === "object" ? d.collapsed : {};
      S.pct = Number(d.pct) >= 0 ? Number(d.pct) : 0;
    } catch (e) { /* ignore */ }
  }
  const saveState = () => store.set(STATE_KEY, JSON.stringify(S));

  const keyOf = (it) => it.category + "||" + it.name;
  const allItems = () => catalog.concat(S.custom.map((c) => ({ category: c.category, name: c.name, price: Number(c.price) || 0, custom: true })));
  const markup = () => (unlocked ? S.pct : 0);
  const basePrice = (it) => (S.prices[keyOf(it)] !== undefined ? S.prices[keyOf(it)] : it.price);
  const unitPrice = (it) => Math.round(basePrice(it) * (1 + markup() / 100));
  const qtyOf = (it) => S.qty[keyOf(it)] || 0;

  function selection() {
    const sel = []; let total = 0, count = 0;
    allItems().forEach((it) => {
      const q = qtyOf(it); if (q <= 0) return;
      const price = unitPrice(it);
      sel.push({ it, q, price, sum: price * q }); total += price * q; count += q;
    });
    return { sel, total, count };
  }

  /* ---------- Каталог ---------- */
  function rowsToCatalog(rows) {
    if (!Array.isArray(rows) || rows.length < 2) return [];
    const h = rows[0].map((c) => String(c || "").trim().toLocaleLowerCase("ru"));
    const ci = Math.max(0, h.findIndex((x) => /катег/.test(x)));
    const ni = Math.max(1, h.findIndex((x) => /себет|корзин|товар|наимен/.test(x)));
    const pi = Math.max(2, h.findIndex((x) => /цен|price|стоим/.test(x)));
    const seen = new Set(), out = [];
    rows.slice(1).forEach((r) => {
      const category = norm(r?.[ci]), name = norm(r?.[ni]), price = parsePrice(r?.[pi]);
      if (!category || !name || price === null || /^объявлен/i.test(category)) return;
      const k = category + "||" + name; if (seen.has(k)) return; seen.add(k);
      out.push({ category, name, price });
    });
    return out;
  }
  const fallbackCatalog = () => FALLBACK.map(([category, name, price]) => ({ category, name, price }));

  /* ---------- Отрисовка каталога ---------- */
  function categories() {
    const map = new Map();
    allItems().forEach((it) => { if (!map.has(it.category)) map.set(it.category, []); map.get(it.category).push(it); });
    return map;
  }
  function renderCategories() {
    const cats = categories();
    $("categories").innerHTML = Array.from(cats, ([cat, items], idx) => {
      const picked = items.reduce((s, it) => s + (qtyOf(it) > 0 ? 1 : 0), 0);
      const isOpen = S.collapsed[cat] === undefined ? idx === 0 : !S.collapsed[cat];
      return `<details class="pb-cat" data-cat="${esc(cat)}"${isOpen ? " open" : ""}>
        <summary>${esc(cat)}<span class="pb-cat__meta">${picked ? `<b>выбрано ${picked}</b> · ` : ""}${items.length}</span></summary>
        <div class="pb-items">${items.map(itemRow).join("")}</div></details>`;
    }).join("");
    fillCategorySelect(Array.from(cats.keys()));
    syncToggleAll();
  }
  function itemRow(it) {
    const q = qtyOf(it), k = esc(keyOf(it)), base = basePrice(it), changed = S.prices[keyOf(it)] !== undefined && S.prices[keyOf(it)] !== it.price;
    const priceCell = priceMode
      ? `<input class="input pb-price-input${changed ? " is-changed" : ""}" type="number" min="0" max="1000000" step="1" inputmode="numeric" value="${base}" data-price-key="${k}" aria-label="Цена: ${esc(it.name)}">`
      : `<div class="pb-item__price">${fmt(unitPrice(it))}${changed ? `<s>${fmt(Math.round(it.price * (1 + markup() / 100)))}</s>` : ""}</div>`;
    return `<div class="pb-item${q > 0 ? " is-selected" : ""}" data-key="${k}"><div class="pb-item__name">${esc(it.name)}</div>${priceCell}
      <div class="qty"><button type="button" data-d="-1" aria-label="Убрать ${esc(it.name)}"${q === 0 ? " disabled" : ""}>−</button><span>${q}</span><button type="button" data-d="1" aria-label="Добавить ${esc(it.name)}">+</button></div></div>`;
  }
  function fillCategorySelect(names) {
    const sel = $("customCategory"), prev = sel.value;
    sel.innerHTML = names.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join("") + `<option value="Другое">Другое</option>`;
    if (prev && Array.from(sel.options).some((o) => o.value === prev)) sel.value = prev;
  }
  function syncToggleAll() {
    const ds = $$("#categories .pb-cat"), allOpen = ds.length > 0 && ds.every((d) => d.open);
    $("toggleAllBtn").textContent = allOpen ? "Свернуть все" : "Развернуть все";
  }

  const byKey = (k) => allItems().find((it) => keyOf(it) === k);
  function refreshRow(row) {
    const it = byKey(row.dataset.key); if (!it) return;
    const q = qtyOf(it);
    row.classList.toggle("is-selected", q > 0);
    row.querySelector(".qty span").textContent = String(q);
    row.querySelector('[data-d="-1"]').disabled = q === 0;
    const det = row.closest(".pb-cat"), meta = det.querySelector(".pb-cat__meta");
    const items = categories().get(det.dataset.cat) || [], picked = items.filter((x) => qtyOf(x) > 0).length;
    meta.innerHTML = (picked ? `<b>выбрано ${picked}</b> · ` : "") + items.length;
  }
  function setQty(it, q) {
    const k = keyOf(it);
    if (q > 0) S.qty[k] = Math.min(q, 99); else delete S.qty[k];
    if (q <= 0 && it.custom) { /* кастомный товар остаётся в списке, пока его не удалят */ }
    saveState();
  }

  $("categories").addEventListener("click", (e) => {
    const b = e.target.closest("[data-d]"); if (!b) return;
    const row = b.closest(".pb-item"), it = byKey(row.dataset.key); if (!it) return;
    setQty(it, qtyOf(it) + Number(b.dataset.d));
    refreshRow(row); renderCart();
  });
  $("categories").addEventListener("input", (e) => {
    const inp = e.target.closest("[data-price-key]"); if (!inp) return;
    const it = byKey(inp.dataset.priceKey); if (!it) return;
    const v = parsePrice(inp.value), k = keyOf(it);
    if (v === null) { delete S.prices[k]; inp.classList.remove("is-changed"); }
    else if (v === it.price) { delete S.prices[k]; inp.classList.remove("is-changed"); }
    else { S.prices[k] = v; inp.classList.add("is-changed"); }
    saveState(); renderCart();
  });
  $("categories").addEventListener("toggle", (e) => {
    const d = e.target; if (!d.classList || !d.classList.contains("pb-cat")) return;
    S.collapsed[d.dataset.cat] = !d.open; saveState(); syncToggleAll();
  }, true);

  $("toggleAllBtn").addEventListener("click", () => {
    const ds = $$("#categories .pb-cat"), open = !ds.every((d) => d.open);
    ds.forEach((d) => { d.open = open; S.collapsed[d.dataset.cat] = !open; });
    saveState(); syncToggleAll();
  });
  $("priceModeBtn").addEventListener("click", () => {
    priceMode = !priceMode;
    $("priceModeBtn").textContent = "Режим цен: " + (priceMode ? "вкл" : "выкл");
    $("priceModeBtn").setAttribute("aria-pressed", String(priceMode));
    renderCategories();
    toast(priceMode ? "Режим цен включён: цены можно менять вручную" : "Режим цен выключен");
  });
  $("resetPricesBtn").addEventListener("click", () => {
    if (!Object.keys(S.prices).length) { toast("Изменённых цен нет"); return; }
    if (!confirm("Вернуть все цены из таблицы?")) return;
    S.prices = {}; saveState(); renderCategories(); renderCart(); toast("Цены сброшены");
  });

  /* ---------- Корзина ---------- */
  function cartHtml() {
    const { sel } = selection();
    if (!sel.length) return `<div class="pb-empty">Пока пусто.<br>Добавьте товары из списка.</div>`;
    return sel.map(({ it, q, price, sum }) => `<div class="pb-line" data-key="${esc(keyOf(it))}">
      <div class="pb-line__name">${esc(it.name)}<small>${esc(it.category)} · ${fmt(price)} × ${q}</small></div>
      <div class="pb-line__sum">${fmt(sum)}</div>
      ${editMode ? `<div class="pb-line__edit"><div class="qty"><button type="button" data-cd="-1" aria-label="Меньше">−</button><span>${q}</span><button type="button" data-cd="1" aria-label="Больше">+</button></div><button class="pb-line__del" type="button" data-del>Удалить</button></div>` : ""}
    </div>`).join("");
  }
  function renderCart() {
    const { total, count } = selection();
    const html = cartHtml();
    $("cartList").innerHTML = html; $("sheetList").innerHTML = html;
    ["cartTotal", "sheetTotal", "barTotal"].forEach((id) => { $(id).textContent = fmt(total); });
    ["cartCount", "sheetCount", "barCount"].forEach((id) => { $(id).textContent = String(count); });
    ["editBtn", "editBtn2"].forEach((id) => { $(id).setAttribute("aria-pressed", String(editMode)); });
    $$("[data-send],[data-clear],[data-copy]").forEach((b) => { b.disabled = b.hasAttribute("data-clear") ? count === 0 : count === 0; });
  }
  function onCartClick(e) {
    const line = e.target.closest(".pb-line"); if (!line) return;
    const it = byKey(line.dataset.key); if (!it) return;
    const d = e.target.closest("[data-cd]");
    if (d) setQty(it, qtyOf(it) + Number(d.dataset.cd));
    else if (e.target.closest("[data-del]")) { setQty(it, 0); if (it.custom) removeCustom(it); }
    else return;
    if (it.custom && qtyOf(it) === 0) removeCustom(it);
    renderCategories(); renderCart();
  }
  function removeCustom(it) { S.custom = S.custom.filter((c) => !(c.category === it.category && c.name === it.name)); delete S.prices[keyOf(it)]; saveState(); }
  $("cartList").addEventListener("click", onCartClick);
  $("sheetList").addEventListener("click", onCartClick);
  const toggleEdit = () => { editMode = !editMode; renderCart(); };
  $("editBtn").addEventListener("click", toggleEdit);
  $("editBtn2").addEventListener("click", toggleEdit);

  /* Текст состава */
  function composition(withPrices) {
    const { sel, total } = selection();
    const lines = sel.map(({ it, q, sum }, i) => `${i + 1}. ${it.name} × ${q}` + (withPrices ? ` — ${fmt(sum)}` : ""));
    if (withPrices) lines.push("", "Итого: " + fmt(total));
    return lines.join("\n");
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* fallback */ }
    try {
      const ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      const ok = document.execCommand("copy"); ta.remove(); return ok;
    } catch (e) { return false; }
  }
  document.addEventListener("click", async (e) => {
    const c = e.target.closest("[data-copy]");
    if (c) {
      if (!selection().count) { toast("Сначала добавьте товары"); return; }
      const ok = await copyText(composition(c.dataset.copy === "prices"));
      toast(ok ? (c.dataset.copy === "prices" ? "Состав с ценами скопирован" : "Состав скопирован") : "Не удалось скопировать");
      return;
    }
    if (e.target.closest("[data-send]")) {
      const { sel, total } = selection();
      if (!sel.length) { toast("Сначала добавьте товары"); return; }
      const text = "Здравствуйте! Хочу собрать корзину:\n" + composition(false) + "\n\nИтого: " + fmt(total);
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      return;
    }
    if (e.target.closest("[data-clear]")) {
      if (!selection().count) return;
      if (!confirm("Очистить всю корзину?")) return;
      S.qty = {}; S.custom = S.custom.filter(() => false); saveState();
      closeSheet(); renderCategories(); renderCart(); toast("Корзина очищена");
    }
  });

  /* Шторка (телефон) */
  const sheet = $("sheet");
  const openSheet = () => { sheet.hidden = false; document.body.style.overflow = "hidden"; $("closeSheetBtn").focus(); };
  function closeSheet() { sheet.hidden = true; document.body.style.overflow = ""; }
  $("openSheetBtn").addEventListener("click", openSheet);
  $("closeSheetBtn").addEventListener("click", closeSheet);
  sheet.addEventListener("click", (e) => { if (e.target === sheet) closeSheet(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });
  matchMedia("(min-width: 1001px)").addEventListener("change", (m) => { if (m.matches) closeSheet(); });

  /* ---------- Свой товар ---------- */
  const setCustomQty = (n) => { customQty = Math.max(1, Math.min(99, n)); $("customQty").textContent = String(customQty); };
  $("customQtyDec").addEventListener("click", () => setCustomQty(customQty - 1));
  $("customQtyInc").addEventListener("click", () => setCustomQty(customQty + 1));
  function customError(msg, field) {
    const el = $("customError"); el.textContent = msg || ""; el.hidden = !msg;
    ["customName", "customPrice"].forEach((id) => $(id).classList.toggle("is-invalid", !!msg && id === field));
    if (field && msg) $(field).focus();
  }
  $("customForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = norm($("customName").value), price = parsePrice($("customPrice").value), category = $("customCategory").value || "Другое";
    if (!name) { customError("Введите название товара", "customName"); return; }
    if (price === null) { customError("Введите цену — число от 0", "customPrice"); return; }
    if (price > 100000) { customError("Цена не может быть больше 100 000 сом", "customPrice"); return; }
    customError("");
    let it = allItems().find((x) => x.category === category && x.name.toLocaleLowerCase("ru") === name.toLocaleLowerCase("ru"));
    if (!it) { S.custom.push({ category, name, price }); it = byKey(category + "||" + name); }
    else if (it.custom) { const c = S.custom.find((x) => x.category === category && x.name === it.name); if (c) c.price = price; }
    setQty(it, qtyOf(it) + customQty);
    if (S.collapsed[category]) S.collapsed[category] = false;
    $("customName").value = ""; $("customPrice").value = ""; setCustomQty(1);
    saveState(); renderCategories(); renderCart(); toast("«" + name + "» добавлен в корзину");
  });
  ["customName", "customPrice"].forEach((id) => $(id).addEventListener("input", () => customError("")));

  /* ---------- Комиссия ---------- */
  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function renderCommission() {
    $("comForm").hidden = unlocked; $("comControls").hidden = !unlocked;
    $("comPercent").value = unlocked && S.pct ? String(S.pct) : "";
    $("comHint").textContent = unlocked ? (S.pct ? "Наценка " + S.pct + "% применяется ко всем ценам, итогу и копируемому составу." : "Укажите процент наценки.") : "Секция закрыта.";
  }
  $("comForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pass = $("comPassword").value;
    if (!COMMISSION_HASH) { $("comHint").textContent = "Пароль ещё не настроен: задайте COMMISSION_HASH в assets/js/builder.js."; return; }
    if (!pass) { $("comHint").textContent = "Введите пароль."; $("comPassword").focus(); return; }
    if (!(window.crypto && crypto.subtle)) { $("comHint").textContent = "Проверка пароля работает только на защищённом соединении (https)."; return; }
    let ok = false; try { ok = (await sha256(pass)) === COMMISSION_HASH; } catch (err) { ok = false; }
    $("comPassword").value = "";
    if (!ok) { $("comHint").textContent = "Неверный пароль."; return; }
    unlocked = true; store.set(UNLOCK_KEY, "1", true); renderCommission(); renderCategories(); renderCart(); toast("Раздел открыт");
  });
  $("comPercent").addEventListener("input", () => {
    let v = parsePrice($("comPercent").value);
    S.pct = v === null ? 0 : Math.min(300, v);
    saveState(); renderCommissionHintOnly(); renderCategories(); renderCart();
  });
  function renderCommissionHintOnly() { $("comHint").textContent = S.pct ? "Наценка " + S.pct + "% применяется ко всем ценам, итогу и копируемому составу." : "Укажите процент наценки."; }
  $("comResetBtn").addEventListener("click", () => { S.pct = 0; saveState(); renderCommission(); renderCategories(); renderCart(); toast("Наценка сброшена"); });
  $("comLockBtn").addEventListener("click", () => { unlocked = false; store.del(UNLOCK_KEY, true); renderCommission(); renderCategories(); renderCart(); });

  /* ---------- Уведомления ---------- */
  let toastTimer = 0;
  function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  /* ---------- Загрузка ---------- */
  function applyCatalog(list, label) {
    catalog = list; renderCategories(); renderCart();
    $("catalogStatus").textContent = label || "";
  }
  function start() {
    loadState();
    let cached = null; try { cached = JSON.parse(store.get(CATALOG_KEY) || "null"); } catch (e) { cached = null; }
    const cachedCat = rowsToCatalog(cached);
    applyCatalog(cachedCat.length ? cachedCat : fallbackCatalog(), cachedCat.length ? "" : "Загружаем актуальные цены…");
    renderCommission();
    const SC = window.KudaSebetSheetCatalog;
    if (!SC) { $("catalogStatus").textContent = "Показаны сохранённые цены"; return; }
    SC.loadRows("Товары").then((rows) => {
      const list = rowsToCatalog(rows);
      if (!list.length) throw new Error("empty");
      store.set(CATALOG_KEY, JSON.stringify(rows));
      applyCatalog(list, "Цены обновлены из таблицы");
      setTimeout(() => { if ($("catalogStatus").textContent === "Цены обновлены из таблицы") $("catalogStatus").textContent = ""; }, 3000);
    }).catch((err) => {
      console.warn("Каталог конструктора не обновлён.", err);
      $("catalogStatus").textContent = "Не удалось обновить цены — показаны сохранённые";
    });
  }
  window.addEventListener("storage", (e) => { if (e.key === STATE_KEY) { loadState(); renderCategories(); renderCart(); } });
  start();
})();
