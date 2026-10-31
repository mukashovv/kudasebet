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
        script.async = true;
        script.src = url.toString();
        script.onerror = () => finish(reject, new Error(`Unable to load Google Sheets tab: ${sheetName}`));
        document.head.append(script);
    });

    window.KudaSebetSheetCatalog = { loadRows };
})();
