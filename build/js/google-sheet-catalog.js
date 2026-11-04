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
        const items = rows.slice(1).flatMap((row) => {
            const category = String(row?.[ci] ?? "").trim(), name = String(row?.[ni] ?? "").trim();
            const raw = String(row?.[pi] ?? "").trim(), number = Number(raw.replace(/\s+/g, "").replace(",", "."));
            const price = raw && Number.isFinite(number) && number >= 0 ? number : null;
            return category && name ? [{ category, name, price, desc: String(row?.[di] ?? "").trim(), composition: String(row?.[si] ?? "").trim() }] : [];
        });
        // Popular rows may contain only a name: inherit data from its catalog row.
        const byName = new Map(items.filter((item) => !isPopular(item.category) && item.price !== null).map((item) => [key(item.name), item]));
        return items.map((item) => {
            const base = isPopular(item.category) ? byName.get(key(item.name)) : null;
            return { ...item, price: item.price ?? base?.price ?? null, desc: item.desc || base?.desc || "", composition: item.composition || base?.composition || "" };
        }).filter((item) => item.price !== null);
    };

    window.KudaSebetSheetCatalog = { loadRows, parseRows, key, slug, isPopular };
})();
