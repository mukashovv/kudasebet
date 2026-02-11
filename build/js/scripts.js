document.addEventListener("DOMContentLoaded", () => {
    const items = Array.from(document.querySelectorAll(".row__item"));
    const contactPanel = document.querySelector(".contact-panel");
    const contactClose = document.querySelector(".contact-panel__close");
    const contactTriggers = Array.from(document.querySelectorAll(".stat--interactive"));
    const hints = Array.from(document.querySelectorAll(".hint"));

    const closeAll = () => {
        items.forEach((item) => item.classList.remove("row__item_show"));
    };

    const updateOpenState = () => {
        const hasOpen = items.some((item) => item.classList.contains("row__item_show"));
        document.body.classList.toggle("card-open", hasOpen);
    };

    items.forEach((item) => {
        const front = item.querySelector(".row__item-overlay_front-side");
        const close = item.querySelector(".row__item-close");

        if (front) {
            front.addEventListener("click", () => {
                closeAll();
                item.classList.add("row__item_show");
                updateOpenState();
            });
        }

        if (close) {
            close.addEventListener("click", (event) => {
                event.stopPropagation();
                item.classList.remove("row__item_show");
                updateOpenState();
            });
        }
    });

    const closeContact = () => {
        if (!contactPanel) return;
        contactPanel.classList.remove("is-open");
    };

    const rowContainer = document.querySelector(".row");

    const positionContactPanel = (trigger) => {
        if (!contactPanel || !trigger) return;
        const triggerRect = trigger.getBoundingClientRect();
        const panelWidth = contactPanel.offsetWidth || 320;
        const panelHeight = contactPanel.offsetHeight || 200;
        const isMobile = window.innerWidth <= 700;
        const gap = 12;
        let left;
        if (isMobile) {
            left = Math.min(window.innerWidth - panelWidth - 16, triggerRect.right + gap);
        } else {
            left = Math.max(16, triggerRect.left - panelWidth - gap);
        }
        const top = Math.max(16, Math.round(triggerRect.bottom - panelHeight));
        contactPanel.style.left = `${left}px`;
        contactPanel.style.top = `${top}px`;
    };

    if (contactPanel && contactTriggers.length) {
        const toggleContact = (trigger) => {
            positionContactPanel(trigger);
            contactPanel.classList.toggle("is-open");
        };

        contactTriggers.forEach((trigger) => {
            trigger.addEventListener("click", (event) => {
                event.stopPropagation();
                toggleContact(trigger);
            });
        });

        if (contactClose) {
            contactClose.addEventListener("click", (event) => {
                event.stopPropagation();
                closeContact();
            });
        }

        document.addEventListener("click", (event) => {
            if (!contactPanel.contains(event.target)) {
                closeContact();
            }
        });
    }

    if (hints.length) {
        const closeHints = (except) => {
            hints.forEach((hint) => {
                if (hint !== except) {
                    hint.classList.remove("is-open");
                }
            });
        };

        hints.forEach((hint) => {
            const trigger = hint.querySelector(".hint__trigger");
            if (!trigger) return;
            trigger.addEventListener("click", (event) => {
                event.stopPropagation();
                const isOpen = hint.classList.contains("is-open");
                closeHints(hint);
                hint.classList.toggle("is-open", !isOpen);
            });
        });

        document.addEventListener("click", (event) => {
            if (!event.target.closest(".hint")) {
                closeHints();
            }
        });
    }

    updateOpenState();
});
