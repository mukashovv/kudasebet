/* Sharing always points to the product page, including from the app. */
(() => {
  const icon = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const icons = {
    share: icon('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>'),
    copy: icon('<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/>'),
    whatsapp: icon('<path d="M20.5 11.5a8.5 8.5 0 0 1-12.8 7.3L3 20l1.2-4.7a8.5 8.5 0 1 1 16.3-3.8Z"/><path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 2c-1 3-4 1-6 0s-6-6-3-9Z"/>'),
    telegram: icon('<path d="m3 10 18-7-4 18-6-6-4 3 1-6 10-6-7 9M3 10l5 2"/>')
  };
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const copyLink = async url => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(url);
      return true;
    } catch (_) {
      const focused = document.activeElement;
      const input = document.createElement('textarea');
      input.value = url;
      input.setAttribute('readonly', '');
      input.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(input);
      input.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { /* Show the failure below. */ }
      input.remove();
      focused?.focus({ preventScroll: true });
      return copied;
    }
  };
  const mount = (container, { slug, name }) => {
    const url = new URL('product.html', location.href);
    url.searchParams.set('item', slug);
    const link = url.href;
    const whatsapp = 'https://wa.me/?text=' + encodeURIComponent(`${name}\n${link}`);
    const telegram = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(name);
    container.innerHTML = `<details class="product-share">
      <summary class="product-share__toggle">${icons.share}<span>Поделиться</span></summary>
      <div class="product-share__menu" aria-label="Поделиться себетом">
        <button type="button" data-copy-link>${icons.copy}<span>Скопировать ссылку</span></button>
        <a href="${escape(whatsapp)}" target="_blank" rel="noopener noreferrer">${icons.whatsapp}<span>WhatsApp</span></a>
        <a href="${escape(telegram)}" target="_blank" rel="noopener noreferrer">${icons.telegram}<span>Telegram</span></a>
        <p class="product-share__status" role="status" aria-live="polite"></p>
      </div></details>`;
    const disclosure = container.querySelector('details');
    container.querySelector('[data-copy-link]').addEventListener('click', async event => {
      const button = event.currentTarget;
      button.disabled = true;
      const copied = await copyLink(link);
      if (!button.isConnected) return;
      button.disabled = false;
      container.querySelector('[role="status"]').textContent = copied ? 'Ссылка скопирована' : 'Не удалось скопировать ссылку. Попробуйте ещё раз.';
    });
    disclosure.addEventListener('toggle', () => {
      if (!disclosure.open) container.querySelector('[role="status"]').textContent = '';
    });
  };
  document.addEventListener('click', event => {
    document.querySelectorAll('.product-share[open]').forEach(details => {
      if (!details.contains(event.target)) details.open = false;
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.product-share[open]').forEach(details => {
      event.stopImmediatePropagation();
      details.open = false;
      details.querySelector('summary').focus();
    });
  });
  window.KudaSebetShare = { mount };
})();
