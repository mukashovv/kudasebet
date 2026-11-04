(() => {
    const SPREADSHEET_ID = "1_MtkToKftXgZsrl6SAvC5LJBujP4PvGmnq9lVH5MI-g";
    const ENDPOINT = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq`;
    let requestSequence = 0;

    const rowsFromResponse = (response) => {
        if (!response || response.status !== "ok" || !response.table) {
            throw new Error("Google Sheets returned an empty catalog response.");
        }

        const columnCount = Array.isArray(response.table.cols) ? response.table.cols.length : 0;
        return (response.table.rows || []).map((row) =>
            Array.from({ length: columnCount }, (_, index) => {
                const cell = row.c && row.c[index];
                // Keep raw numeric values (especially prices); formatted cells may
                // include thousands separators that would be parsed as decimals.
                return cell ? (cell.v ?? cell.f ?? "") : "";
            })
        );
    };

    const loadRows = (sheetName) => new Promise((resolve, reject) => {
        const callbackName = `__kudaSebetSheetCallback${Date.now()}_${requestSequence++}`;
        const script = document.createElement("script");
        const url = new URL(ENDPOINT);
        let settled = false;

        const cleanup = () => {
            window.clearTimeout(timeoutId);
            script.remove();
            delete window[callbackName];
        };

        const finish = (handler, value) => {
            if (settled) return;
            settled = true;
            cleanup();
            handler(value);
        };

        const timeoutId = window.setTimeout(() => {
            finish(reject, new Error(`Google Sheets request timed out: ${sheetName}`));
        }, 15000);

        window[callbackName] = (response) => {
            try {
                finish(resolve, rowsFromResponse(response));
            } catch (error) {
                finish(reject, error);
            }
        };

        url.searchParams.set("tqx", `out:json;responseHandler:${callbackName}`);
        url.searchParams.set("sheet", sheetName);
        url.searchParams.set("headers", "0");
        script.async = true;
        script.src = url.toString();
        script.onerror = () => finish(reject, new Error(`Unable to load Google Sheets tab: ${sheetName}`));
        document.head.append(script);
    });

    const key = (value) => String(value ?? "").replace(/\s+/g, " ").trim().toLocaleLowerCase("ru");
    const slug = (name) => "sheet-" + key(name).replace(/[^a-zа-яёөүң0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    const isPopular = (category) => key(category) === "часто заказывают";
    const parseRows = (rows) => {
        if (!Array.isArray(rows) || !rows.length) return [];
        const headers = rows[0].map(key);
        const column = (pattern, fallback) => {
            const index = headers.findIndex((header) => pattern.test(header));
            return index < 0 ? fallback : index;
        };
        const ci = column(/катег/, 0), ni = column(/себет|корзин|товар|наимен/, 1), pi = column(/цен|price|стоим/, 2);
        const di = column(/описан|description/, -1), si = column(/состав|composition/, -1);
        const ai = column(/^доступен$|^доступность$|^available$/, -1), ki = column(/^код$|^code$/, -1), fi = column(/^фото$|^photo$/, -1);
        const items = rows.slice(1).flatMap((row) => {
            const category = String(row?.[ci] ?? "").trim(), name = String(row?.[ni] ?? "").trim();
            const raw = String(row?.[pi] ?? "").trim(), number = Number(raw.replace(/\s+/g, "").replace(",", "."));
            const price = raw && Number.isFinite(number) && number >= 0 ? number : null;
            const availability = key(row?.[ai]);
            const available = ai < 0 || (!availability && isPopular(category)) ? null : /^(да|true|1|доступен|в наличии|yes)$/.test(availability);
            return category && name ? [{ category, name, price, available, code: String(row?.[ki] ?? "").trim(), photo: String(row?.[fi] ?? "").trim(), desc: String(row?.[di] ?? "").trim(), composition: String(row?.[si] ?? "").trim() }] : [];
        });
        // Popular rows may contain only a name: inherit data from its catalog row.
        const byName = new Map(items.filter((item) => !isPopular(item.category) && item.price !== null).map((item) => [key(item.name), item]));
        return items.map((item) => {
            const base = isPopular(item.category) ? byName.get(key(item.name)) : null;
            const code = base?.code || item.code || "";
            return { ...item, code, slug: code || slug(item.name), available: base?.available ?? item.available ?? null, photo: item.photo || base?.photo || "", price: item.price ?? base?.price ?? null, desc: item.desc || base?.desc || "", composition: item.composition || base?.composition || "" };
        }).filter((item) => item.price !== null);
    };

    const photoRequests = new Map();
    const DEFAULT_PHOTO = "assets/img/cards/kuda_sebet_s.jpg";
    const defaultPhotos = () => Array(3).fill(DEFAULT_PHOTO);
    const photoNames = (photo) => [...new Set(String(photo || "").split(",").map(name => name.trim()).filter(Boolean))];
    const resolveSinglePhoto = (photo, fallback) => {
        if (!photo) return Promise.resolve(fallback);
        const path = /^(https?:\/\/|\/|\.\/|assets\/)/i.test(photo) ? photo : "assets/img/products/" + photo;
        const candidates = /\.[a-z0-9]+(?:[?#].*)?$/i.test(path) ? [path] : ["jpg", "jpeg", "png", "webp", "avif", "JPG", "JPEG", "PNG", "WEBP", "AVIF"].map(ext => `${path}.${ext}`);
        const cacheKey = JSON.stringify(candidates);
        if (!photoRequests.has(cacheKey)) photoRequests.set(cacheKey, (async () => {
            for (const src of candidates) {
                const loaded = await new Promise(resolve => {
                    const img = new Image();
                    const finish = (value) => { clearTimeout(timer); img.onload = img.onerror = null; resolve(value); };
                    const timer = setTimeout(() => finish(false), 5000);
                    img.onload = () => finish(true);
                    img.onerror = () => finish(false);
                    img.src = src;
                });
                if (loaded) return src;
            }
            return null;
        })());
        return photoRequests.get(cacheKey).then(src => src || fallback);
    };

    const resolvePhoto = async (photo, fallback = DEFAULT_PHOTO) => {
        for (const name of photoNames(photo)) {
            const src = await resolveSinglePhoto(name, null);
            if (src) return src;
        }
        return fallback;
    };
    const resolvePhotos = async (photo, fallback = DEFAULT_PHOTO) => {
        if (!photoNames(photo).length) return defaultPhotos();
        const resolved = await Promise.all(photoNames(photo).map(name => resolveSinglePhoto(name, null)));
        const images = [...new Set(resolved.filter(Boolean))];
        return images.length ? images : [fallback];
    };
    const bindGallery = (element, count, select) => {
        if (count < 2) return;
        let index = 0, start = null;
        const show = (next) => { index = (next + count) % count; select(index); };
        element.tabIndex = 0;
        element.setAttribute("aria-label", "Фотографии себета. Листайте свайпом или стрелками клавиатуры.");
        element.addEventListener("keydown", event => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            show(index + (event.key === "ArrowRight" ? 1 : -1));
        });
        element.addEventListener("touchstart", event => {
            start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
        }, { passive: true });
        element.addEventListener("touchend", event => {
            if (!start || !event.changedTouches.length) return;
            const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
            start = null;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
        }, { passive: true });
        element.addEventListener("touchcancel", () => { start = null; });
        return show;
    };

    window.KudaSebetSheetCatalog = { loadRows, parseRows, key, slug, isPopular, resolvePhoto, resolvePhotos, bindGallery, DEFAULT_PHOTO, defaultPhotos };
})();
