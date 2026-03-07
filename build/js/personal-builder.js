(async () => {
    const WA_PHONE = "996509130090";
    const SESSION_KEY = "kudasebet-personal-builder-v1";
    const GOOGLE_SHEET_SHARE_URL = "https://docs.google.com/spreadsheets/d/1_MtkToKftXgZsrl6SAvC5LJBujP4PvGmnq9lVH5MI-g/edit?usp=sharing";
    const CATALOG_XLSX_FILE = "./kuda-sebet-products.xlsx";
    const CATALOG_XLSX_SHEET = "Товары";

    const fallbackCatalog = [
        {
            id: "cookies",
            name: "Печенья",
            items: [
                { id: "cookie-pechenye-banke", name: "Печенье в банке", price: 590 },
                { id: "cookie-elka", name: "Елочка Печенья", price: 600 },
                { id: "cookie-oreo", name: "Oreo Original", price: 210 },
                { id: "cookie-choco-pie", name: "Choco Pie (12 шт)", price: 280 },
                { id: "cookie-jubilee", name: "Юбилейное шоколадное", price: 170 },
                { id: "cookie-milka", name: "Milka Choco Cookie", price: 230 }
            ]
        },
        {
            id: "candies",
            name: "Конфеты",
            items: [
                { id: "candy-raffaello", name: "Raffaello", price: 680 },
                { id: "candy-ferrero", name: "Ferrero Rocher", price: 1500 },
                { id: "candy-ferrero-8", name: "Ferrero Rocher (8 шт)", price: 850 },
                { id: "candy-fiorella-trufa-200", name: "Fiorella LA TRUFA, 200 г", price: 215 },
                { id: "candy-kinder-santa", name: "Kinder Дед Мороз", price: 240 },
                { id: "candy-korkunov", name: "Коркунов ассорти", price: 320 },
                { id: "candy-mms", name: "M&M's", price: 190 },
                { id: "candy-chinese", name: "Китайские конфеты", price: 0 }
            ]
        },
        {
            id: "sweets",
            name: "Сладости",
            items: [
                { id: "sweet-merci-small", name: "Маленький Merci", price: 400 },
                { id: "sweet-merci-big", name: "Большая шоколадка Merci", price: 1150 },
                { id: "sweet-toblerone-mini", name: "Toblerone мини", price: 190 },
                { id: "sweet-toblerone", name: "Toblerone шоколад", price: 800 },
                { id: "sweet-dark-choco", name: "Горький шоколад", price: 580 },
                { id: "sweet-ritter", name: "Ritter Sport", price: 731 },
                { id: "sweet-milka", name: "Milka Alpine Milk", price: 240 },
                { id: "sweet-nutella", name: "Nutella mini", price: 290 }
            ]
        },
        {
            id: "fruits",
            name: "Фрукты",
            items: [
                { id: "fruit-grape-ladyfingers", name: "Виноград \"Дамские пальчики\"", price: 250 },
                { id: "fruit-dragon", name: "Сердце дракона фрукт", price: 250 },
                { id: "fruit-pomegranate", name: "Гранат", price: 320 },
                { id: "fruit-mango", name: "Манго", price: 450 },
                { id: "fruit-pineapple", name: "Ананас", price: 620 },
                { id: "fruit-passion", name: "Маракуйя", price: 200 },
                { id: "fruit-mandarin-7", name: "Мандарины 7 шт", price: 160 },
                { id: "fruit-mandarin-kg", name: "Мандарины 1 кг", price: 160 }
            ]
        },
        {
            id: "alcohol",
            name: "Алкоголь",
            items: [
                { id: "alco-santo-stefano", name: "Шампанское Santo Stefano", price: 530 },
                { id: "alco-good-champagne", name: "Хорошее шампанское", price: 1000 },
                { id: "alco-martini", name: "Martini Asti", price: 1650 },
                { id: "alco-jager", name: "Jagermeister 0.5", price: 2300 },
                { id: "alco-jack", name: "Jack Daniel's 0.5", price: 2400 },
                { id: "alco-rioja", name: "Вино Rioja", price: 1800 }
            ]
        },
        {
            id: "juices",
            name: "Соки",
            items: [
                { id: "juice-yan-mini-apple-pear", name: "Yan маленький Яблоко-Груша", price: 135 },
                { id: "juice-yan-grape", name: "Сок Yan Виноград", price: 430 },
                { id: "juice-yan-apple-pear", name: "Сок Yan Яблоко-Груша", price: 430 },
                { id: "juice-rich-orange", name: "Rich Апельсин 1л", price: 220 },
                { id: "juice-j7-apple", name: "J7 Яблоко 1л", price: 210 },
                { id: "juice-dobry-multi", name: "Organic 1л", price: 190 },
                { id: "juice-richard-tea", name: "Чай (Richard)", price: 340 }
            ]
        },
        {
            id: "soda",
            name: "Газировки",
            items: [
                { id: "soda-cola", name: "Coca-Cola 1л", price: 140 },
                { id: "soda-fanta", name: "Fanta 1л", price: 140 },
                { id: "soda-sprite", name: "Sprite 1л", price: 140 },
                { id: "soda-schweppes", name: "Schweppes 1л", price: 180 },
                { id: "soda-festive-champ", name: "Шампанское (Праздничное)", price: 220 }
            ]
        },
        {
            id: "extra",
            name: "Дополнительно",
            items: [
                { id: "extra-caviar", name: "Икра 50-100гр", price: 1790 },
                { id: "extra-net", name: "Сеточка под продукты", price: 200 },
                { id: "extra-decor", name: "Декор", price: 250 },
                { id: "extra-tree-decor", name: "Елочки", price: 250 },
                { id: "extra-fabric", name: "Ткань", price: 150 },
                { id: "extra-basket-s", name: "Корзина S", price: 500 },
                { id: "extra-basket-m", name: "Корзина M", price: 750 },
                { id: "extra-basket-vip", name: "Корзина Vip", price: 850 },
                { id: "extra-basket-new-year", name: "Корзина (новогодняя)", price: 400 },
                { id: "extra-basket-base", name: "Корзина (базовая)", price: 600 }
            ]
        }
    ];

    const categoryContainer = document.getElementById("categoryContainer");
    if (!categoryContainer) return;

    const ui = {
        topControls: document.getElementById("topControls"),
        floatingControls: document.getElementById("floatingControls"),
        mobileFloatingControls: document.getElementById("mobileFloatingControls"),
        collapseAllBtn: document.getElementById("collapseAllBtn"),
        expandAllBtn: document.getElementById("expandAllBtn"),
        priceModeBtn: document.getElementById("priceModeBtn"),
        resetPricesBtn: document.getElementById("resetPricesBtn"),
        toggleAllFloatBtn: document.getElementById("toggleAllFloatBtn"),
        priceModeFloatBtn: document.getElementById("priceModeFloatBtn"),
        toggleAllMobileFloatBtn: document.getElementById("toggleAllMobileFloatBtn"),
        priceModeMobileFloatBtn: document.getElementById("priceModeMobileFloatBtn"),
        resetPricesMobileFloatBtn: document.getElementById("resetPricesMobileFloatBtn"),
        customProductForm: document.getElementById("customProductForm"),
        customProductName: document.getElementById("customProductName"),
        customProductPrice: document.getElementById("customProductPrice"),
        customProductQty: document.getElementById("customProductQty"),
        customProductQtyDec: document.getElementById("customProductQtyDec"),
        customProductQtyInc: document.getElementById("customProductQtyInc"),
        customProductCategory: document.getElementById("customProductCategory"),
        summaryMeta: document.getElementById("summaryMeta"),
        toggleSummaryEditBtn: document.getElementById("toggleSummaryEditBtn"),
        toggleCornerEditBtn: document.getElementById("toggleCornerEditBtn"),
        toggleMobileEditBtn: document.getElementById("toggleMobileEditBtn"),
        bottomSummaryList: document.getElementById("bottomSummaryList"),
        bottomSummaryTotal: document.getElementById("bottomSummaryTotal"),
        cornerCartList: document.getElementById("cornerCartList"),
        cornerCartTotal: document.getElementById("cornerCartTotal"),
        mobileCartList: document.getElementById("mobileCartList"),
        mobileCartTotal: document.getElementById("mobileCartTotal"),
        stickyTotal: document.getElementById("stickyTotal"),
        stickyTotalBar: document.querySelector(".pb-sticky-total"),
        cornerCount: document.getElementById("cornerCount"),
        floatingCartCount: document.getElementById("floatingCartCount"),
        floatingCartBtn: document.getElementById("floatingCartBtn"),
        mobileCartSheet: document.getElementById("mobileCartSheet"),
        closeMobileSheetBtn: document.getElementById("closeMobileSheetBtn"),
        sheetBackdrop: document.getElementById("sheetBackdrop"),
        sendBottomBtn: document.getElementById("sendBottomBtn"),
        sendCornerBtn: document.getElementById("sendCornerBtn"),
        sendMobileBtn: document.getElementById("sendMobileBtn"),
        sendStickyBtn: document.getElementById("sendStickyBtn"),
        copyBottomBtn: document.getElementById("copyBottomBtn"),
        copyCornerBtn: document.getElementById("copyCornerBtn"),
        copyMobileBtn: document.getElementById("copyMobileBtn"),
        copyBottomMenuBtn: document.getElementById("copyBottomMenuBtn"),
        copyCornerMenuBtn: document.getElementById("copyCornerMenuBtn"),
        copyMobileMenuBtn: document.getElementById("copyMobileMenuBtn"),
        copyBottomMenu: document.getElementById("copyBottomMenu"),
        copyCornerMenu: document.getElementById("copyCornerMenu"),
        copyMobileMenu: document.getElementById("copyMobileMenu"),
        copyBottomWithPricesBtn: document.getElementById("copyBottomWithPricesBtn"),
        copyCornerWithPricesBtn: document.getElementById("copyCornerWithPricesBtn"),
        copyMobileWithPricesBtn: document.getElementById("copyMobileWithPricesBtn"),
        commissionPassword: document.getElementById("commissionPassword"),
        commissionUnlockBtn: document.getElementById("commissionUnlockBtn"),
        commissionHint: document.getElementById("commissionHint"),
        commissionControls: document.getElementById("commissionControls"),
        commissionPercent: document.getElementById("commissionPercent"),
        commissionResetBtn: document.getElementById("commissionResetBtn"),
        clearBottomBtn: document.getElementById("clearBottomBtn"),
        clearCornerBtn: document.getElementById("clearCornerBtn"),
        clearMobileBtn: document.getElementById("clearMobileBtn"),
        toast: document.getElementById("toast")
    };

    const itemIndex = new Map();
    const defaultPrices = new Map();
    const state = {
        quantities: new Map(),
        prices: new Map(),
        customItems: new Map(),
        priceMode: false,
        summaryEditMode: false,
        commissionUnlocked: false,
        commissionPercent: 0
    };
    const copyMenus = [
        { toggleBtn: ui.copyBottomMenuBtn, menu: ui.copyBottomMenu },
        { toggleBtn: ui.copyCornerMenuBtn, menu: ui.copyCornerMenu },
        { toggleBtn: ui.copyMobileMenuBtn, menu: ui.copyMobileMenu }
    ];
    const editModeButtons = [ui.toggleSummaryEditBtn, ui.toggleCornerEditBtn, ui.toggleMobileEditBtn];
    let catalog = fallbackCatalog;

    await initCatalogData();
    initCustomCategorySelect();
    loadSession();
    renderCatalog();
    bindEvents();
    render();

    function formatSom(value) {
        return `${Number(value || 0).toLocaleString("ru-RU")} сом`;
    }

    function clamp(value, min, max) {
        if (!Number.isFinite(value)) return min;
        return Math.min(max, Math.max(min, Math.round(value)));
    }

    function clampPercent(value) {
        if (!Number.isFinite(value)) return 0;
        return Math.min(300, Math.max(0, Math.round(value * 10) / 10));
    }

    function preventRapidTapZoom() {
        if (!window.matchMedia("(pointer: coarse)").matches) return;

        document.addEventListener(
            "dblclick",
            (event) => {
                const target = event.target;
                if (target instanceof Element && target.closest("input, textarea, select")) return;
                event.preventDefault();
            },
            { passive: false }
        );
    }

    function escapeHtml(text) {
        return String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function normalizeItemName(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");
    }

    function slugifyName(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-zа-я0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 40) || "custom-item";
    }

    function parsePrice(value) {
        if (typeof value === "number") return clamp(value, 0, 100000);
        const normalized = String(value || "")
            .trim()
            .replace(/\s+/g, "")
            .replace(",", ".");
        if (!normalized) return 0;
        return clamp(Number(normalized), 0, 100000);
    }

    function buildGoogleSheetCsvUrls(shareUrl) {
        try {
            const url = new URL(String(shareUrl || ""));
            const directCsv =
                (url.searchParams.get("output") || "").toLowerCase() === "csv" ||
                (url.searchParams.get("format") || "").toLowerCase() === "csv";
            if (directCsv) return [url.toString()];

            const idMatch = url.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            if (!idMatch || !idMatch[1]) return [];

            const hashParams = new URLSearchParams(String(url.hash || "").replace(/^#/, ""));
            const gid = url.searchParams.get("gid") || hashParams.get("gid") || "0";
            const encodedGid = encodeURIComponent(gid);
            const spreadsheetId = idMatch[1];

            return [
                `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${encodedGid}`,
                `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${encodedGid}`
            ];
        } catch (error) {
            return [];
        }
    }

    function parseCsvTable(csvText) {
        const rows = [];
        let row = [];
        let cell = "";
        let inQuotes = false;
        const text = String(csvText || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

        for (let i = 0; i < text.length; i += 1) {
            const char = text[i];

            if (inQuotes) {
                if (char === '"') {
                    if (text[i + 1] === '"') {
                        cell += '"';
                        i += 1;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    cell += char;
                }
                continue;
            }

            if (char === '"') {
                inQuotes = true;
                continue;
            }

            if (char === ",") {
                row.push(cell);
                cell = "";
                continue;
            }

            if (char === "\n") {
                row.push(cell);
                rows.push(row);
                row = [];
                cell = "";
                continue;
            }

            cell += char;
        }

        row.push(cell);
        rows.push(row);

        if (rows[0]?.[0]) {
            rows[0][0] = String(rows[0][0]).replace(/^\uFEFF/, "");
        }

        while (rows.length > 0 && rows[rows.length - 1].every((value) => String(value || "").trim() === "")) {
            rows.pop();
        }

        return rows;
    }

    function buildCatalogFromSheetRows(rows) {
        if (!Array.isArray(rows) || rows.length < 2) return [];

        const headers = Array.isArray(rows[0])
            ? rows[0].map((cell) => String(cell || "").trim().toLowerCase())
            : [];

        const pickHeaderIndex = (matcher, fallbackIndex) => {
            const index = headers.findIndex((header) => matcher.test(header));
            return index >= 0 ? index : fallbackIndex;
        };

        const categoryCol = pickHeaderIndex(/катег|category/i, 0);
        const itemCol = pickHeaderIndex(/товар|наимен|item|product/i, 1);
        const priceCol = pickHeaderIndex(/цен|price|стоим/i, 2);

        const categories = [];
        const categoryByName = new Map();
        const categoryIdCounter = new Map();
        const itemIdCounter = new Map();

        const ensureCategory = (categoryNameRaw) => {
            const categoryName = String(categoryNameRaw || "").trim();
            if (!categoryName) return null;
            const normalized = normalizeItemName(categoryName);
            if (categoryByName.has(normalized)) return categoryByName.get(normalized);

            const baseId =
                normalized === "дополнительно"
                    ? "extra"
                    : `cat-${slugifyName(categoryName)}`;
            const nextCount = (categoryIdCounter.get(baseId) || 0) + 1;
            categoryIdCounter.set(baseId, nextCount);
            const categoryId = nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
            const category = { id: categoryId, name: categoryName, items: [] };
            categoryByName.set(normalized, category);
            categories.push(category);
            return category;
        };

        for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
            const row = rows[rowIndex];
            if (!Array.isArray(row)) continue;

            const categoryName = String(row[categoryCol] || "").trim();
            const itemName = String(row[itemCol] || "").trim();
            if (!categoryName || !itemName) continue;

            const category = ensureCategory(categoryName);
            if (!category) continue;

            const price = parsePrice(row[priceCol]);
            const itemBaseId = `${category.id}-${slugifyName(itemName)}`;
            const itemCount = (itemIdCounter.get(itemBaseId) || 0) + 1;
            itemIdCounter.set(itemBaseId, itemCount);
            const itemId = itemCount === 1 ? itemBaseId : `${itemBaseId}-${itemCount}`;

            category.items.push({ id: itemId, name: itemName, price });
        }

        return categories.filter((category) => category.items.length > 0);
    }

    async function loadCatalogFromExcel() {
        if (typeof window.XLSX === "undefined") return null;

        const response = await fetch(CATALOG_XLSX_FILE, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Unable to load ${CATALOG_XLSX_FILE}: ${response.status}`);
        }

        const workbookData = await response.arrayBuffer();
        const workbook = window.XLSX.read(workbookData, { type: "array" });
        if (!Array.isArray(workbook.SheetNames) || workbook.SheetNames.length === 0) return null;

        const targetSheetName = workbook.SheetNames.includes(CATALOG_XLSX_SHEET)
            ? CATALOG_XLSX_SHEET
            : workbook.SheetNames[0];
        const sheet = workbook.Sheets[targetSheetName];
        if (!sheet) return null;

        const rows = window.XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
            raw: true
        });
        const nextCatalog = buildCatalogFromSheetRows(rows);
        return nextCatalog.length > 0 ? nextCatalog : null;
    }

    async function loadCatalogFromGoogleSheet() {
        const csvUrls = buildGoogleSheetCsvUrls(GOOGLE_SHEET_SHARE_URL);
        if (csvUrls.length === 0) return null;

        let lastError = null;

        for (const csvUrl of csvUrls) {
            try {
                const response = await fetch(csvUrl, { cache: "no-store" });
                if (!response.ok) continue;

                const csvText = await response.text();
                if (/<!doctype html|<html[\s>]/i.test(csvText)) continue;

                const rows = parseCsvTable(csvText);
                const nextCatalog = buildCatalogFromSheetRows(rows);
                if (nextCatalog.length > 0) return nextCatalog;
            } catch (error) {
                lastError = error;
            }
        }

        if (lastError) throw lastError;
        return null;
    }

    function initializeCatalogState() {
        itemIndex.clear();
        defaultPrices.clear();
        state.quantities.clear();
        state.prices.clear();

        catalog.forEach((category) => {
            category.items.forEach((item) => {
                itemIndex.set(item.id, { ...item, categoryId: category.id, categoryName: category.name });
                defaultPrices.set(item.id, item.price);
                state.quantities.set(item.id, 0);
                state.prices.set(item.id, item.price);
            });
        });
    }

    async function initCatalogData() {
        catalog = fallbackCatalog;
        try {
            const fromGoogleSheet = await loadCatalogFromGoogleSheet();
            if (Array.isArray(fromGoogleSheet) && fromGoogleSheet.length > 0) {
                catalog = fromGoogleSheet;
                initializeCatalogState();
                return;
            }
        } catch (error) {
            console.warn("Failed to load catalog from Google Sheet. Trying Excel fallback.", error);
        }

        try {
            const fromExcel = await loadCatalogFromExcel();
            if (Array.isArray(fromExcel) && fromExcel.length > 0) {
                catalog = fromExcel;
            }
        } catch (error) {
            console.warn("Failed to load catalog from Excel. Built-in fallback catalog is used.", error);
        }
        initializeCatalogState();
    }

    function getCategoryById(categoryId) {
        return catalog.find((entry) => entry.id === categoryId) || null;
    }

    function initCustomCategorySelect() {
        if (!ui.customProductCategory) return;
        ui.customProductCategory.innerHTML = catalog
            .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
            .join("");
        if (catalog.some((category) => category.id === "extra")) {
            ui.customProductCategory.value = "extra";
        }
    }

    function renderCatalog() {
        const html = catalog
            .map((category, index) => {
                const rows = category.items
                    .map((item) => {
                        const price = state.prices.get(item.id) || item.price;
                        return `
                            <article class="pb-item" data-item-id="${item.id}">
                                <div>
                                    <h3 class="pb-item__name">${escapeHtml(item.name)}</h3>
                                    <div class="pb-item__price-wrap">
                                        <span class="pb-item__price" data-role="price-label">${formatSom(price)}</span>
                                        <input
                                            class="pb-item__price-input"
                                            data-role="price-input"
                                            aria-label="Цена для ${escapeHtml(item.name)}"
                                            type="number"
                                            min="0"
                                            max="100000"
                                            step="10"
                                            inputmode="numeric"
                                            value="${price}"
                                        >
                                    </div>
                                </div>
                                <div class="pb-item__controls">
                                    <button class="pb-qty-btn" type="button" data-action="dec" aria-label="Уменьшить">−</button>
                                    <span class="pb-qty-value" data-role="qty">0</span>
                                    <button class="pb-qty-btn" type="button" data-action="inc" aria-label="Увеличить">+</button>
                                </div>
                            </article>
                        `;
                    })
                    .join("");

                return `
                    <details class="pb-category" data-category-id="${category.id}" ${index < 3 ? "open" : ""}>
                        <summary>
                            <span class="pb-category__title">
                                <strong>${escapeHtml(category.name)}</strong>
                                <span class="pb-category__hint" data-role="category-total">0 сом</span>
                            </span>
                            <span class="pb-category__count" data-role="category-count">0</span>
                        </summary>
                        <div class="pb-category__items">${rows}</div>
                    </details>
                `;
            })
            .join("");

        categoryContainer.innerHTML = html;
    }

    function collectSummary() {
        const groups = [];
        const groupMap = new Map();
        let total = 0;
        let count = 0;

        const ensureGroup = (groupId, groupName) => {
            if (groupMap.has(groupId)) return groupMap.get(groupId);
            const group = {
                id: groupId,
                name: groupName,
                items: [],
                categoryTotal: 0,
                categoryCount: 0
            };
            groupMap.set(groupId, group);
            groups.push(group);
            return group;
        };

        catalog.forEach((category) => {
            category.items.forEach((item) => {
                const qty = state.quantities.get(item.id) || 0;
                if (qty <= 0) return;

                const price = state.prices.get(item.id) || 0;
                const lineTotal = price * qty;
                const group = ensureGroup(category.id, category.name);
                group.items.push({
                    id: item.id,
                    name: item.name,
                    qty,
                    price,
                    lineTotal,
                    removeType: "base",
                    removeKey: item.id
                });
                group.categoryTotal += lineTotal;
                group.categoryCount += qty;
                total += lineTotal;
                count += qty;
            });
        });

        state.customItems.forEach((customItem, customKey) => {
            const qty = customItem.qty || 0;
            const price = customItem.price || 0;
            if (qty <= 0) return;

            const categoryId = customItem.categoryId || "extra";
            const categoryName = customItem.categoryName || getCategoryById(categoryId)?.name || "Дополнительно";
            const lineTotal = price * qty;
            const group = ensureGroup(categoryId, categoryName);
            group.items.push({
                id: `custom-${customKey}`,
                name: customItem.name,
                qty,
                price,
                lineTotal,
                removeType: "custom",
                removeKey: customKey
            });
            group.categoryTotal += lineTotal;
            group.categoryCount += qty;
            total += lineTotal;
            count += qty;
        });

        const subtotal = total;
        const commissionPercent = state.commissionUnlocked ? state.commissionPercent : 0;
        const commissionAmount = commissionPercent > 0 ? Math.round((subtotal * commissionPercent) / 100) : 0;
        const finalTotal = subtotal + commissionAmount;

        return {
            groups,
            subtotal,
            commissionPercent,
            commissionAmount,
            total: finalTotal,
            count
        };
    }

    function buildSummaryHtml(groups) {
        if (groups.length === 0) {
            return `<div class="pb-empty">Добавьте товары, чтобы увидеть состав корзины.</div>`;
        }

        return groups
            .map(
                (group) => `
                    <div class="pb-selected-group">
                        <h4>${escapeHtml(group.name)} (${group.categoryCount})</h4>
                        ${group.items
                            .map(
                                (item) => `
                                <div class="pb-selected-item">
                                    <span>${escapeHtml(item.name)}${state.summaryEditMode ? "" : ` × ${item.qty}`}</span>
                                    <div class="pb-selected-item__right">
                                        ${
                                            state.summaryEditMode
                                                ? `
                                        <div class="pb-selected-item__qty-edit" role="group" aria-label="Изменить количество товара">
                                            <input
                                                class="pb-selected-item__qty-input"
                                                type="number"
                                                min="1"
                                                max="99"
                                                step="1"
                                                inputmode="numeric"
                                                data-action="selected-qty-input"
                                                data-remove-type="${escapeHtml(item.removeType || "base")}"
                                                data-remove-key="${encodeURIComponent(String(item.removeKey || item.id || ""))}"
                                                value="${item.qty}"
                                                aria-label="Количество товара ${escapeHtml(item.name)}"
                                            >
                                            <div class="pb-selected-item__qty-stepper" aria-hidden="false">
                                                <button class="pb-selected-item__qty-step-btn" type="button" data-action="selected-qty-step" data-delta="1" data-remove-type="${escapeHtml(item.removeType || "base")}" data-remove-key="${encodeURIComponent(String(item.removeKey || item.id || ""))}" aria-label="Увеличить количество">▲</button>
                                                <button class="pb-selected-item__qty-step-btn" type="button" data-action="selected-qty-step" data-delta="-1" data-remove-type="${escapeHtml(item.removeType || "base")}" data-remove-key="${encodeURIComponent(String(item.removeKey || item.id || ""))}" aria-label="Уменьшить количество">▼</button>
                                            </div>
                                        </div>
                                        `
                                                : ""
                                        }
                                        <span>${formatSom(item.lineTotal)}</span>
                                        ${
                                            state.summaryEditMode
                                                ? `<button class="pb-selected-remove-btn" type="button" data-action="remove-selected-item" data-remove-type="${escapeHtml(item.removeType || "base")}" data-remove-key="${encodeURIComponent(String(item.removeKey || item.id || ""))}" aria-label="Удалить товар из состава">×</button>`
                                                : ""
                                        }
                                    </div>
                                </div>
                            `
                            )
                            .join("")}
                    </div>
                `
            )
            .join("");
    }

    function buildShareText(summary, options = {}) {
        const includeItemPrices = Boolean(options.includeItemPrices);
        const includeCommissionLine = options.includeCommissionLine !== false;
        const lines = ["Состав подарочной корзины", ""];

        summary.groups.forEach((group) => {
            lines.push(`${group.name}:`);
            group.items.forEach((item) => {
                if (includeItemPrices) {
                    lines.push(`• ${item.name} ×${item.qty} — ${formatSom(item.lineTotal)}`);
                    return;
                }
                lines.push(`• ${item.name} ×${item.qty}`);
            });
            lines.push("");
        });

        lines.push(`Позиций: ${summary.count}`);
        if (includeCommissionLine && summary.commissionAmount > 0) {
            lines.push(`Наценка (${summary.commissionPercent}%): ${formatSom(summary.commissionAmount)}`);
        }
        lines.push(`Итоговая цена: ${formatSom(summary.total)}`);
        lines.push("");
        lines.push("Собрано в личном конструкторе Куда Себет.");
        return lines.join("\n");
    }

    function showToast(message) {
        if (!ui.toast) return;
        ui.toast.textContent = message;
        ui.toast.classList.add("is-visible");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            ui.toast.classList.remove("is-visible");
        }, 1800);
    }

    function saveSession() {
        const payload = {
            quantities: Object.fromEntries(state.quantities),
            prices: Object.fromEntries(state.prices),
            customItems: Array.from(state.customItems.entries())
        };
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
        } catch (error) {
            // Ignore quota/session restrictions.
        }
    }

    function loadSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (!data || typeof data !== "object") return;

            if (data.quantities && typeof data.quantities === "object") {
                Object.entries(data.quantities).forEach(([itemId, qty]) => {
                    if (!itemIndex.has(itemId)) return;
                    state.quantities.set(itemId, clamp(Number(qty), 0, 99));
                });
            }

            if (data.prices && typeof data.prices === "object") {
                Object.entries(data.prices).forEach(([itemId, price]) => {
                    if (!itemIndex.has(itemId)) return;
                    state.prices.set(itemId, clamp(Number(price), 0, 100000));
                });
            }

            if (Array.isArray(data.customItems)) {
                data.customItems.forEach((entry) => {
                    if (!Array.isArray(entry) || entry.length < 2) return;
                    const [customKey, rawItem] = entry;
                    if (!customKey || !rawItem || typeof rawItem !== "object") return;

                    const name = String(rawItem.name || "").trim();
                    if (!name) return;

                    const categoryId = String(rawItem.categoryId || "extra");
                    const categoryName = rawItem.categoryName || getCategoryById(categoryId)?.name || "Дополнительно";
                    const price = clamp(Number(rawItem.price), 0, 100000);
                    const qty = clamp(Number(rawItem.qty), 0, 99);
                    if (qty <= 0) return;

                    state.customItems.set(String(customKey), {
                        name,
                        categoryId,
                        categoryName,
                        price,
                        qty
                    });
                });
            }
        } catch (error) {
            // Ignore malformed session payload.
        }
    }

    function unlockCommission() {
        const password = ui.commissionPassword?.value.trim() || "";
        if (password !== "362") {
            if (ui.commissionHint) ui.commissionHint.textContent = "Неверный пароль.";
            showToast("Неверный пароль для комиссии");
            return;
        }

        state.commissionUnlocked = true;
        if (ui.commissionPassword) ui.commissionPassword.value = "";
        render();
        showToast("Секция комиссии открыта");
        ui.commissionPercent?.focus();
    }

    function setCommissionPercent(nextPercentRaw) {
        if (!state.commissionUnlocked) return;

        const raw = String(nextPercentRaw ?? "").trim();
        if (!raw) {
            state.commissionPercent = 0;
            render();
            return;
        }

        const parsed = Number(raw.replace(",", "."));
        if (!Number.isFinite(parsed)) return;
        state.commissionPercent = clampPercent(parsed);
        render();
    }

    function closeCopyMenus() {
        copyMenus.forEach(({ toggleBtn, menu }) => {
            if (menu) menu.hidden = true;
            toggleBtn?.setAttribute("aria-expanded", "false");
        });
    }

    function updateFloatingControlsVisibility() {
        const desktopAnchorRect = ui.topControls?.getBoundingClientRect();
        const desktopShouldShow = desktopAnchorRect ? desktopAnchorRect.bottom < 24 : window.scrollY > 140;
        const mobileShouldShow = window.scrollY > 4;

        if (ui.floatingControls) {
            if (window.innerWidth <= 860) {
                ui.floatingControls.classList.remove("is-visible");
            } else {
                ui.floatingControls.classList.toggle("is-visible", desktopShouldShow);
            }
        }

        if (ui.mobileFloatingControls) {
            if (window.innerWidth > 860) {
                ui.mobileFloatingControls.classList.remove("is-visible");
            } else {
                ui.mobileFloatingControls.classList.toggle("is-visible", mobileShouldShow);
            }
        }
    }

    function updateStickyTotalViewportOffset() {
        if (!ui.stickyTotalBar) return;
        const stickyHeight = Math.max(0, Math.round(ui.stickyTotalBar.getBoundingClientRect().height || 0));
        document.documentElement.style.setProperty("--pb-sticky-total-height", `${stickyHeight}px`);

        if (window.innerWidth > 1159) {
            ui.stickyTotalBar.style.setProperty("--pb-sticky-bottom-offset", "0px");
            return;
        }

        const viewport = window.visualViewport;
        if (!viewport) {
            ui.stickyTotalBar.style.setProperty("--pb-sticky-bottom-offset", "0px");
            return;
        }

        const layoutHeight = document.documentElement.clientHeight;
        const viewportOffsetTop = Math.max(0, Number(viewport.offsetTop) || 0);
        const viewportHeight = Math.max(0, Number(viewport.height) || 0);
        const visualBottom = viewportOffsetTop + viewportHeight;
        const bottomOffset = Math.max(0, layoutHeight - visualBottom);
        ui.stickyTotalBar.style.setProperty("--pb-sticky-bottom-offset", `${bottomOffset}px`);
    }

    function getOpenCategoriesCount() {
        return Array.from(categoryContainer.querySelectorAll(".pb-category")).filter((entry) => entry.open).length;
    }

    function syncFloatingToggleButton() {
        const openCount = getOpenCategoriesCount();
        if (ui.toggleAllFloatBtn) {
            ui.toggleAllFloatBtn.textContent = openCount >= 2 ? "Свернуть все" : "Развернуть все";
        }
        if (ui.toggleAllMobileFloatBtn) {
            const shouldCollapse = openCount >= 1;
            ui.toggleAllMobileFloatBtn.textContent = shouldCollapse ? "−" : "+";
            ui.toggleAllMobileFloatBtn.setAttribute("aria-label", shouldCollapse ? "Свернуть все" : "Развернуть все");
            ui.toggleAllMobileFloatBtn.setAttribute("title", shouldCollapse ? "Свернуть все" : "Развернуть все");
        }
    }

    function scrollToCollapsedCatalogPreview() {
        const catalogTop = window.scrollY + categoryContainer.getBoundingClientRect().top;
        const topPadding = window.innerWidth <= 600 ? 16 : 24;
        const targetTop = Math.max(0, catalogTop - topPadding);
        window.scrollTo({ top: targetTop, behavior: "smooth" });
    }

    function scheduleCollapsedCatalogPreview() {
        if (window.innerWidth > 1160) return;
        window.clearTimeout(scheduleCollapsedCatalogPreview.timer);
        scheduleCollapsedCatalogPreview.timer = window.setTimeout(() => {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    scrollToCollapsedCatalogPreview();
                });
            });
        }, 70);
    }

    function render() {
        const summary = collectSummary();

        categoryContainer.querySelectorAll(".pb-item").forEach((row) => {
            const itemId = row.dataset.itemId;
            if (!itemId) return;

            const qty = state.quantities.get(itemId) || 0;
            const price = state.prices.get(itemId) || 0;

            row.classList.toggle("is-selected", qty > 0);
            const qtyNode = row.querySelector('[data-role="qty"]');
            if (qtyNode) qtyNode.textContent = String(qty);

            const priceNode = row.querySelector('[data-role="price-label"]');
            if (priceNode) priceNode.textContent = formatSom(price);

            const priceInput = row.querySelector('[data-role="price-input"]');
            if (priceInput && document.activeElement !== priceInput) {
                priceInput.value = String(price);
            }
        });

        categoryContainer.querySelectorAll(".pb-category").forEach((details) => {
            const categoryId = details.dataset.categoryId;
            const category = catalog.find((entry) => entry.id === categoryId);
            if (!category) return;

            let categoryCount = 0;
            let categoryTotal = 0;

            category.items.forEach((item) => {
                const qty = state.quantities.get(item.id) || 0;
                if (qty <= 0) return;
                const price = state.prices.get(item.id) || 0;
                categoryCount += qty;
                categoryTotal += price * qty;
            });

            const countNode = details.querySelector('[data-role="category-count"]');
            if (countNode) countNode.textContent = String(categoryCount);

            const totalNode = details.querySelector('[data-role="category-total"]');
            if (totalNode) totalNode.textContent = formatSom(categoryTotal);
        });

        const summaryHtml = buildSummaryHtml(summary.groups);
        if (ui.bottomSummaryList) ui.bottomSummaryList.innerHTML = summaryHtml;
        if (ui.cornerCartList) ui.cornerCartList.innerHTML = summaryHtml;
        if (ui.mobileCartList) ui.mobileCartList.innerHTML = summaryHtml;

        if (ui.bottomSummaryTotal) ui.bottomSummaryTotal.textContent = formatSom(summary.total);
        if (ui.cornerCartTotal) ui.cornerCartTotal.textContent = formatSom(summary.total);
        if (ui.mobileCartTotal) ui.mobileCartTotal.textContent = formatSom(summary.total);
        if (ui.stickyTotal) ui.stickyTotal.textContent = formatSom(summary.total);

        if (ui.cornerCount) ui.cornerCount.textContent = String(summary.count);
        if (ui.floatingCartCount) ui.floatingCartCount.textContent = String(summary.count);
        if (ui.summaryMeta) {
            const extra = summary.commissionAmount > 0 ? ` • наценка ${summary.commissionPercent}%` : "";
            ui.summaryMeta.textContent = `${summary.count} позиций${extra}`;
        }

        if (ui.commissionControls) {
            ui.commissionControls.hidden = !state.commissionUnlocked;
        }

        if (ui.commissionPassword) {
            ui.commissionPassword.disabled = state.commissionUnlocked;
        }

        if (ui.commissionUnlockBtn) {
            ui.commissionUnlockBtn.disabled = state.commissionUnlocked;
            ui.commissionUnlockBtn.textContent = state.commissionUnlocked ? "Открыто" : "Открыть";
        }

        if (ui.commissionPercent && document.activeElement !== ui.commissionPercent) {
            ui.commissionPercent.value = state.commissionPercent > 0 ? String(state.commissionPercent) : "";
        }

        if (ui.commissionHint) {
            if (!state.commissionUnlocked) {
                ui.commissionHint.textContent = "Секция закрыта.";
            } else if (summary.commissionAmount > 0) {
                ui.commissionHint.textContent = `Наценка ${summary.commissionPercent}% (+${formatSom(summary.commissionAmount)}).`;
            } else {
                ui.commissionHint.textContent = "Секция открыта. Введите процент наценки.";
            }
        }

        editModeButtons.forEach((button) => {
            if (!button) return;
            const modeLabel = state.summaryEditMode ? "Отключить редактирование состава" : "Включить редактирование состава";
            button.textContent = state.summaryEditMode ? "✔" : "✎";
            button.setAttribute("aria-label", modeLabel);
            button.setAttribute("title", modeLabel);
        });

        document.body.classList.toggle("summary-edit-mode", state.summaryEditMode);
        document.body.classList.toggle("price-edit-mode", state.priceMode);
        [ui.priceModeBtn, ui.priceModeFloatBtn].forEach((button) => {
            if (!button) return;
            button.textContent = `Режим цен: ${state.priceMode ? "вкл" : "выкл"}`;
        });

        if (ui.priceModeMobileFloatBtn) {
            const isPriceEditActive = state.priceMode;
            const label = isPriceEditActive ? "Сохранить применённые цены" : "Включить режим редактирования цен";
            ui.priceModeMobileFloatBtn.classList.toggle("is-active", state.priceMode);
            ui.priceModeMobileFloatBtn.classList.toggle("is-pencil", !isPriceEditActive);
            ui.priceModeMobileFloatBtn.textContent = isPriceEditActive ? "✓" : "✎";
            ui.priceModeMobileFloatBtn.setAttribute("aria-label", label);
            ui.priceModeMobileFloatBtn.setAttribute("title", label);
        }

        syncFloatingToggleButton();
        updateFloatingControlsVisibility();
        updateStickyTotalViewportOffset();
    }

    function updateQuantity(itemId, delta) {
        if (!itemIndex.has(itemId)) return;
        const next = clamp((state.quantities.get(itemId) || 0) + delta, 0, 99);
        state.quantities.set(itemId, next);
        saveSession();
        render();
    }

    function setPrice(itemId, nextPriceRaw) {
        if (!itemIndex.has(itemId)) return;
        const next = clamp(Number(nextPriceRaw), 0, 100000);
        state.prices.set(itemId, next);
        saveSession();
        render();
    }

    function updateCustomQty(delta) {
        if (!ui.customProductQty) return;
        const current = clamp(Number(ui.customProductQty.textContent || 1), 1, 99);
        const next = clamp(current + delta, 1, 99);
        ui.customProductQty.textContent = String(next);
    }

    function setAllCategoriesOpen(isOpen) {
        let hadOpenCategory = false;
        categoryContainer.querySelectorAll(".pb-category").forEach((details) => {
            if (!isOpen && details.open) hadOpenCategory = true;
            details.open = isOpen;
        });
        syncFloatingToggleButton();
        if (!isOpen && hadOpenCategory) {
            scheduleCollapsedCatalogPreview();
        }
    }

    function decodeDataKey(encodedKey) {
        const raw = String(encodedKey || "");
        if (!raw) return "";
        try {
            return decodeURIComponent(raw);
        } catch (error) {
            return raw;
        }
    }

    function setSelectedItemQty(removeType, removeKey, nextQtyRaw) {
        const key = String(removeKey || "");
        if (!key) return;

        const nextQty = clamp(Number(nextQtyRaw), 1, 99);

        if (removeType === "custom") {
            const existing = state.customItems.get(key);
            if (!existing) return;

            existing.qty = nextQty;
            state.customItems.set(key, existing);
        } else {
            if (!itemIndex.has(key)) return;
            state.quantities.set(key, nextQty);
        }

        saveSession();
        render();
    }

    function adjustSelectedItemQty(removeType, removeKey, delta) {
        if (!Number.isFinite(delta) || delta === 0) return;
        const key = String(removeKey || "");
        if (!key) return;

        const currentQty =
            removeType === "custom"
                ? state.customItems.get(key)?.qty || 0
                : state.quantities.get(key) || 0;
        setSelectedItemQty(removeType, key, currentQty + delta);
    }

    function removeSelectedItem(removeType, removeKey) {
        const key = String(removeKey || "");
        if (!key) return;

        if (removeType === "custom") {
            if (!state.customItems.has(key)) return;
            state.customItems.delete(key);
        } else {
            if (!itemIndex.has(key)) return;
            state.quantities.set(key, 0);
        }

        saveSession();
        render();
        showToast("Товар удалён из состава");
    }

    function addCustomProduct() {
        const name = ui.customProductName?.value.trim() || "";
        const rawPrice = ui.customProductPrice?.value;
        const rawQty = ui.customProductQty?.textContent;
        const categoryId = ui.customProductCategory?.value || "extra";
        const normalizedName = normalizeItemName(name);

        if (!normalizedName) {
            alert("Введите название товара");
            return;
        }
        if (rawPrice === undefined || rawPrice === null || rawPrice === "") {
            alert("Введите цену товара");
            return;
        }

        const price = clamp(Number(rawPrice), 0, 100000);
        const qty = clamp(Number(rawQty || 1), 1, 99);
        const categoryName = getCategoryById(categoryId)?.name || "Дополнительно";

        // If the same item already exists in the base list, use it instead of duplicating.
        for (const [itemId, item] of itemIndex.entries()) {
            if (normalizeItemName(item.name) !== normalizedName) continue;
            state.quantities.set(itemId, clamp((state.quantities.get(itemId) || 0) + qty, 0, 99));
            state.prices.set(itemId, price);
            saveSession();
            render();
            showToast("Товар уже есть в списке и добавлен в корзину");
            if (ui.customProductName) ui.customProductName.value = "";
            if (ui.customProductQty) ui.customProductQty.textContent = "1";
            ui.customProductName?.focus();
            return;
        }

        const customKey = `${categoryId}::${normalizedName}`;
        if (state.customItems.has(customKey)) {
            const existing = state.customItems.get(customKey);
            existing.qty = clamp((existing.qty || 0) + qty, 0, 99);
            existing.price = price;
            existing.categoryName = categoryName;
            state.customItems.set(customKey, existing);
        } else {
            state.customItems.set(customKey, {
                id: `custom-${slugifyName(name)}-${Date.now()}`,
                name,
                categoryId,
                categoryName,
                price,
                qty
            });
        }

        saveSession();
        render();
        showToast("Свой товар добавлен");
        if (ui.customProductName) ui.customProductName.value = "";
        if (ui.customProductPrice) ui.customProductPrice.value = "";
        if (ui.customProductQty) ui.customProductQty.textContent = "1";
        ui.customProductName?.focus();
    }

    function clearAllSelection() {
        state.quantities.forEach((_, itemId) => {
            state.quantities.set(itemId, 0);
        });
        state.customItems.clear();
        saveSession();
        render();
        showToast("Состав очищен");
    }

    function resetPrices() {
        defaultPrices.forEach((price, itemId) => {
            state.prices.set(itemId, price);
        });
        saveSession();
        render();
        showToast("Цены сброшены к базовым");
    }

    function openWhatsApp() {
        const summary = collectSummary();
        if (summary.groups.length === 0) {
            alert("Добавьте хотя бы один товар в корзину");
            return;
        }

        const message = buildShareText(summary, { includeItemPrices: true });
        const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    }

    async function copySummary(options = {}) {
        const includeItemPrices = Boolean(options.includeItemPrices);
        const summary = collectSummary();
        if (summary.groups.length === 0) {
            alert("Добавьте хотя бы один товар в корзину");
            return;
        }

        const message = buildShareText(summary, {
            includeItemPrices,
            includeCommissionLine: includeItemPrices
        });
        try {
            await navigator.clipboard.writeText(message);
            showToast(includeItemPrices ? "Состав скопирован с ценами" : "Состав скопирован");
        } catch (error) {
            const helper = document.createElement("textarea");
            helper.value = message;
            helper.style.position = "fixed";
            helper.style.left = "-9999px";
            document.body.appendChild(helper);
            helper.select();
            document.execCommand("copy");
            helper.remove();
            showToast(includeItemPrices ? "Состав скопирован с ценами" : "Состав скопирован");
        }
    }

    function setSheetOpen(isOpen) {
        const sheet = ui.mobileCartSheet;
        const backdrop = ui.sheetBackdrop;
        if (!sheet || !backdrop) return;

        sheet.classList.toggle("is-open", isOpen);
        sheet.setAttribute("aria-hidden", String(!isOpen));
        if (ui.floatingCartBtn) ui.floatingCartBtn.setAttribute("aria-expanded", String(isOpen));

        if (isOpen) {
            backdrop.hidden = false;
            return;
        }

        window.setTimeout(() => {
            if (!sheet.classList.contains("is-open")) {
                backdrop.hidden = true;
            }
        }, 220);
    }

    function bindEvents() {
        categoryContainer.addEventListener("click", (event) => {
            const button = event.target.closest(".pb-qty-btn");
            if (!button) return;

            const row = button.closest(".pb-item");
            const itemId = row?.dataset.itemId;
            if (!itemId) return;

            const action = button.dataset.action;
            if (action === "inc") updateQuantity(itemId, 1);
            if (action === "dec") updateQuantity(itemId, -1);
        });

        categoryContainer.addEventListener("input", (event) => {
            const input = event.target.closest('[data-role="price-input"]');
            if (!input) return;

            const row = input.closest(".pb-item");
            const itemId = row?.dataset.itemId;
            if (!itemId) return;

            if (input.value === "") return;
            setPrice(itemId, input.value);
        });

        categoryContainer.addEventListener(
            "toggle",
            (event) => {
                if (!event.target?.classList?.contains("pb-category")) return;
                syncFloatingToggleButton();
            },
            true
        );

        ui.customProductForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            addCustomProduct();
        });

        ui.customProductQtyDec?.addEventListener("click", () => {
            updateCustomQty(-1);
        });

        ui.customProductQtyInc?.addEventListener("click", () => {
            updateCustomQty(1);
        });

        editModeButtons.forEach((button) => {
            button?.addEventListener("click", () => {
                state.summaryEditMode = !state.summaryEditMode;
                render();
            });
        });

        [ui.bottomSummaryList, ui.cornerCartList, ui.mobileCartList].forEach((listNode) => {
            listNode?.addEventListener("click", (event) => {
                const actionBtn = event.target.closest("[data-action]");
                if (!actionBtn) return;

                const action = actionBtn.dataset.action;
                if (!action) return;

                const removeType = actionBtn.dataset.removeType || "base";
                const removeKey = decodeDataKey(actionBtn.dataset.removeKey || "");

                if (action === "remove-selected-item") {
                    removeSelectedItem(removeType, removeKey);
                    return;
                }

                if (action === "selected-qty-step") {
                    const delta = Number(actionBtn.dataset.delta || 0);
                    adjustSelectedItemQty(removeType, removeKey, delta);
                }
            });

            listNode?.addEventListener("change", (event) => {
                const input = event.target.closest('[data-action="selected-qty-input"]');
                if (!input) return;

                const removeType = input.dataset.removeType || "base";
                const removeKey = decodeDataKey(input.dataset.removeKey || "");
                setSelectedItemQty(removeType, removeKey, input.value);
            });
        });

        ui.commissionUnlockBtn?.addEventListener("click", unlockCommission);

        ui.commissionPassword?.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            unlockCommission();
        });

        ui.commissionPercent?.addEventListener("input", (event) => {
            setCommissionPercent(event.target.value);
        });

        ui.commissionResetBtn?.addEventListener("click", () => {
            state.commissionPercent = 0;
            render();
            showToast("Наценка сброшена");
        });

        ui.collapseAllBtn?.addEventListener("click", () => {
            setAllCategoriesOpen(false);
        });

        ui.expandAllBtn?.addEventListener("click", () => {
            setAllCategoriesOpen(true);
        });

        ui.toggleAllFloatBtn?.addEventListener("click", () => {
            const openCount = getOpenCategoriesCount();
            setAllCategoriesOpen(openCount < 2);
        });

        ui.toggleAllMobileFloatBtn?.addEventListener("click", () => {
            const openCount = getOpenCategoriesCount();
            setAllCategoriesOpen(openCount === 0);
        });

        [ui.priceModeBtn, ui.priceModeFloatBtn, ui.priceModeMobileFloatBtn].forEach((button) => {
            button?.addEventListener("click", () => {
                state.priceMode = !state.priceMode;
                render();
            });
        });

        [ui.resetPricesBtn, ui.resetPricesMobileFloatBtn].forEach((button) => {
            button?.addEventListener("click", resetPrices);
        });

        [ui.clearBottomBtn, ui.clearCornerBtn, ui.clearMobileBtn].forEach((btn) => {
            btn?.addEventListener("click", clearAllSelection);
        });

        [ui.sendBottomBtn, ui.sendCornerBtn, ui.sendMobileBtn, ui.sendStickyBtn].forEach((btn) => {
            btn?.addEventListener("click", openWhatsApp);
        });

        [ui.copyBottomBtn, ui.copyCornerBtn, ui.copyMobileBtn].forEach((btn) => {
            btn?.addEventListener("click", () => {
                closeCopyMenus();
                copySummary({ includeItemPrices: false });
            });
        });

        [ui.copyBottomWithPricesBtn, ui.copyCornerWithPricesBtn, ui.copyMobileWithPricesBtn].forEach((btn) => {
            btn?.addEventListener("click", () => {
                closeCopyMenus();
                copySummary({ includeItemPrices: true });
            });
        });

        copyMenus.forEach(({ toggleBtn, menu }) => {
            toggleBtn?.addEventListener("click", (event) => {
                event.stopPropagation();
                if (!menu) return;
                const isOpen = !menu.hidden;
                closeCopyMenus();
                if (isOpen) return;
                menu.hidden = false;
                toggleBtn.setAttribute("aria-expanded", "true");
            });

            menu?.addEventListener("click", (event) => {
                event.stopPropagation();
            });
        });

        ui.floatingCartBtn?.addEventListener("click", () => {
            const isOpen = ui.mobileCartSheet?.classList.contains("is-open");
            setSheetOpen(!isOpen);
        });

        ui.closeMobileSheetBtn?.addEventListener("click", () => {
            setSheetOpen(false);
        });

        ui.sheetBackdrop?.addEventListener("click", () => {
            setSheetOpen(false);
        });

        document.addEventListener("click", (event) => {
            if (event.target.closest(".pb-copy-dropdown")) return;
            closeCopyMenus();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            setSheetOpen(false);
            closeCopyMenus();
        });

        window.addEventListener("scroll", updateFloatingControlsVisibility, { passive: true });
        window.addEventListener("resize", () => {
            updateFloatingControlsVisibility();
            updateStickyTotalViewportOffset();
        });
        window.visualViewport?.addEventListener("resize", updateStickyTotalViewportOffset);
        window.visualViewport?.addEventListener("scroll", updateStickyTotalViewportOffset);
        updateFloatingControlsVisibility();
        updateStickyTotalViewportOffset();
        preventRapidTapZoom();
    }
})();
