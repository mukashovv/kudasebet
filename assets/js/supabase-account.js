/* On-demand Supabase account integration for Kuda Sebet. */
(function () {
  "use strict";

  const PROJECT_URL = "https://fvepumfkvxggdkwdoexs.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_lYwkxkrJpQpQFv2MzPDMQA__9JW2zXQ";
  const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const RETURN_KEY = "kuda-sebet-account-return-v1";
  const PENDING_FAVORITE_KEY = "kuda-sebet-pending-favorite-v1";
  const LOGIN_PENDING_KEY = "kuda-sebet-login-pending-v1";
  const FAVORITES_CACHE_KEY = "kuda-sebet-account-favorites-v1";
  function cachedFavorites() {
    try {
      const value = JSON.parse(localStorage.getItem(FAVORITES_CACHE_KEY) || "null");
      return Array.isArray(value) ? value.map(normalizedId).filter(Boolean) : [];
    } catch (error) { return []; }
  }
  const state = { ready: false, connecting: false, user: null, favorites: new Set(cachedFavorites()), birthdays: [], error: "" };
  const busyFavorites = new Set();
  let client = null;
  let clientPromise = null;
  let sdkPromise = null;
  let ownedDataPromise = null;
  let ownedDataUserId = null;
  let desktopDrawerPage = "menu";
  const homeTileOriginals = new WeakMap();

  function sessionGet(key) { try { return sessionStorage.getItem(key); } catch (error) { return null; } }
  function sessionSet(key, value) { try { sessionStorage.setItem(key, value); } catch (error) { /* storage may be disabled */ } }
  function sessionDelete(key) { try { sessionStorage.removeItem(key); } catch (error) { /* storage may be disabled */ } }
  function hasStoredAuthSession() { try { return Boolean(localStorage.getItem("kudasebet-web-auth-v1")); } catch (error) { return false; } }
  function normalizedId(value) { return String(value || "").trim().replace(/-popular$/, ""); }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function snapshot() {
    return { ready: state.ready, connecting: state.connecting, user: state.user, favorites: Array.from(state.favorites), birthdays: state.birthdays.slice(), error: state.error };
  }
  function emit() {
    saveFavoritesCache();
    renderHeaderAccount();
    renderHomeTiles();
    paintFavoriteButtons();
    renderProfilePanels();
    window.dispatchEvent(new CustomEvent("kuda-account:updated", { detail: snapshot() }));
    if (window.location.hash === "#auth" && state.ready) {
      const loginPending = sessionGet(LOGIN_PENDING_KEY);
      sessionDelete(LOGIN_PENDING_KEY);
      history.replaceState(null, "", window.location.pathname + window.location.search);
      if (state.user && loginPending) announce("Вы успешно вошли в аккаунт");
    }
    if (window.location.hash === "#profile" && state.ready) {
      if (state.user) setDesktopDrawer(true);
      else { const menu = document.querySelector(".account-menu"); if (menu) menu.open = true; }
    }
  }
  function renderHeaderAccount() {
    document.querySelectorAll(".account-menu").forEach(function (menu) {
      menu.classList.toggle("is-authenticated", !!state.user);
      if (state.user) menu.open = false;
    });
    document.querySelectorAll(".account-menu__login").forEach(function (button) {
      button.textContent = state.user ? "Мой профиль" : "Войти через Google";
      button.setAttribute("aria-label", state.user ? "Открыть профиль" : "Войти через Google");
    });
  }
  function renderHomeTiles() {
    const configurations = {
      profile: { title: "Мой профиль", subtitle: "Ваш аккаунт", view: "menu", icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.6-3.6 3.2-5.4 7.5-5.4s6.9 1.8 7.5 5.4"/></svg>' },
      favorites: { title: "Избранные", subtitle: "Сохранённые себеты", view: "favorites", icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.9c0 5.2-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.9A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.8Z"/></svg>' },
      events: { title: "События", subtitle: "Дни рождения и поводы", view: "dates", icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="15" rx="3"/><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M8 14h.01M12 14h.01M16 14h.01"/></svg>' }
    };
    const homeNav = document.getElementById("homeCategoryTiles");
    if (homeNav) homeNav.setAttribute("aria-label", state.user ? "Разделы профиля" : "Категории подарков");
    document.querySelectorAll("[data-home-tile]").forEach(function (tile) {
      const icon = tile.querySelector(".tile__sym");
      const title = tile.querySelector("strong");
      const subtitle = tile.querySelector("small");
      if (!icon || !title || !subtitle) return;
      if (!homeTileOriginals.has(tile)) homeTileOriginals.set(tile, { href: tile.getAttribute("href"), icon: icon.innerHTML, title: title.textContent, subtitle: subtitle.textContent });
      if (state.user) {
        const config = configurations[tile.getAttribute("data-home-tile")];
        if (!config) return;
        tile.setAttribute("href", "#profile");
        tile.setAttribute("data-profile-view", config.view);
        icon.innerHTML = config.icon;
        title.textContent = config.title;
        subtitle.textContent = config.subtitle;
      } else {
        const original = homeTileOriginals.get(tile);
        tile.setAttribute("href", original.href);
        tile.removeAttribute("data-profile-view");
        icon.innerHTML = original.icon;
        title.textContent = original.title;
        subtitle.textContent = original.subtitle;
      }
    });
  }
  function saveFavoritesCache() {
    try {
      if (state.user) localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(Array.from(state.favorites)));
      else if (state.ready) localStorage.removeItem(FAVORITES_CACHE_KEY);
    } catch (error) { /* local storage may be disabled */ }
  }
  function paintFavoriteButtons() {
    document.querySelectorAll("[data-favorite-id]").forEach(function (button) {
      const active = state.favorites.has(normalizedId(button.getAttribute("data-favorite-id")));
      button.classList.toggle("is-favorite", active);
      button.setAttribute("aria-pressed", String(active));
      const label = active ? "Убрать из избранного" : "Сохранить в избранное";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      if (button.classList.contains("product-favorite")) button.textContent = active ? "♥ В избранном" : "♡ В избранное";
      else button.textContent = active ? "♥" : "♡";
    });
  }
  function catalogChanged() {
    paintFavoriteButtons();
    const profile = document.getElementById("page-profile");
    if (profile && !profile.hidden) renderProfilePanels();
  }
  function catalogProduct(id) {
    const registry = window.KudaSebetProducts || {};
    return registry[normalizedId(id)] || null;
  }
  function favoriteListMarkup() {
    if (!state.user) return '<div class="cloud-muted">Войдите через Google, чтобы хранить избранные себеты в аккаунте.</div>';
    if (!state.favorites.size) return '<div class="cloud-muted">Нажмите на сердечко у себета, чтобы добавить его сюда.</div>';
    const rows = Array.from(state.favorites).map(function (id) {
      const product = catalogProduct(id) || {};
      const name = product.name || id;
      const image = product.image || "./assets/img/cards/kuda_sebet_s.jpg";
      const price = product.priceText || (product.price ? Number(product.price).toLocaleString("ru-RU") + " сом" : "");
      const href = product.href || ("./product.html?item=" + encodeURIComponent(product.slug || id));
      return '<div class="cloud-favorite-row"><a class="cloud-favorite-link" href="' + escapeHtml(href) + '"><img src="' + escapeHtml(image) + '" alt=""><span><strong>' + escapeHtml(name) + '</strong><small>' + escapeHtml(price) + '</small></span></a><button type="button" data-favorite-id="' + escapeHtml(id) + '" aria-label="Убрать из избранного">♥</button></div>';
    });
    return '<div class="cloud-favorite-list">' + rows.join("") + '</div>';
  }
  function importantDateListMarkup() {
    if (!state.user) return '<div class="cloud-muted">Войдите через Google, чтобы сохранять дни рождения и важные даты.</div>';
    if (!state.birthdays.length) return '<div class="cloud-muted">Добавьте важный день, чтобы увидеть напоминание здесь.</div>';
    const reminderOptions = [
      { value: 7, label: "За неделю" },
      { value: 3, label: "За 3 дня" },
      { value: 1, label: "За 1 день" },
      { value: 0, label: "В день события" }
    ];
    const celebrationEmojis = ["🎁", "🎂", "🎈", "🎉", "💐", "🍰", "🎊", "🧁", "💝", "✨"];
    return '<div class="cloud-date-list">' + state.birthdays.map(function (item) {
      const days = dueDays(item.birthday);
      const when = days === null ? "" : reminderLabel(days);
      const seed = String(item.id || item.name + item.birthday);
      let hash = 0;
      for (let i = 0; i < seed.length; i += 1) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
      const emoji = celebrationEmojis[(hash >>> 0) % celebrationEmojis.length];
      const id = escapeHtml(item.id);
      const selectedReminder = Number(item.reminder_days_before || 0);
      const options = reminderOptions.map(function (option) {
        return '<option value="' + option.value + '"' + (option.value === selectedReminder ? ' selected' : '') + '>' + option.label + '</option>';
      }).join("");
      return '<div class="cloud-date-row"><span class="cloud-date-icon" aria-hidden="true">' + emoji + '</span><span class="cloud-date-copy"><strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(formattedDate(item.birthday)) + (when ? ' · ' + escapeHtml(when) : '') + ' · напомнить за ' + selectedReminder + ' дн.</small></span><span class="cloud-date-actions"><button type="button" data-birthday-edit="' + id + '" aria-label="Изменить напоминание ' + escapeHtml(item.name) + '" aria-expanded="false" title="Изменить">✎</button><button type="button" data-birthday-delete="' + id + '" aria-label="Удалить дату">×</button></span><form class="cloud-date-edit-form" data-birthday-edit-form="' + id + '" hidden><label>Имя или повод<input name="name" type="text" maxlength="80" value="' + escapeHtml(item.name) + '" required></label><div class="cloud-date-fields"><label>Дата<input name="birthday" type="date" value="' + escapeHtml(String(item.birthday || "").slice(0, 10)) + '" required></label><label>Напомнить<select name="reminderDays">' + options + '</select></label></div><div class="cloud-date-edit-actions"><button class="btn btn--primary" type="submit">Сохранить</button><button class="btn" type="button" data-birthday-cancel>Отмена</button></div></form></div>';
    }).join("") + '</div>';
  }
  function ensureProfilePanels() {
    const profile = document.getElementById("page-profile");
    if (!profile) return null;
    let wrapper = document.getElementById("cloudProfileFeatures");
    if (wrapper) return wrapper;
    wrapper = document.createElement("div");
    wrapper.id = "cloudProfileFeatures";
    const card = profile.querySelector(".profile-card");
    if (card && card.parentNode) card.parentNode.insertBefore(wrapper, card.nextSibling);
    else profile.insertBefore(wrapper, profile.firstChild);
    return wrapper;
  }
  function renderDesktopDrawerContent() {
    const content = document.getElementById("desktopProfileContent");
    if (!content) return;
    const title = document.getElementById("desktopProfileTitle");
    const back = document.getElementById("desktopProfileBack");
    const titles = { menu: "Профиль", favorites: "Избранные", dates: "Дни рождения и события", birthdays: "Дни рождения и события", events: "Дни рождения и события" };
    if (title) title.textContent = titles[desktopDrawerPage] || "Профиль";
    if (back) back.hidden = desktopDrawerPage === "menu";
    if (!state.user) {
      desktopDrawerPage = "menu";
      content.innerHTML = '<p class="cloud-muted">Войдите через Google, чтобы открыть профиль.</p><button type="button" class="account-menu__login" data-account-google>Войти через Google</button>';
      return;
    }
    if (desktopDrawerPage === "menu") {
      content.innerHTML = '<div class="desktop-profile-user"><span class="desktop-profile-user__avatar">' + escapeHtml(profileName(state.user).slice(0, 1).toUpperCase()) + '</span><span><strong>' + escapeHtml(profileName(state.user)) + '</strong><small>' + escapeHtml(state.user.email || "Аккаунт Google") + '</small></span></div>' +
        '<nav class="desktop-profile-links" aria-label="Разделы профиля"><button type="button" data-profile-view="favorites"><span class="desktop-profile-links__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.9c0 5.2-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.9A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.8Z"/></svg></span><span>Избранные</span><b>›</b></button><button type="button" data-profile-view="dates"><span class="desktop-profile-links__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="15" rx="3"/><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M8 14h.01M12 14h.01M16 14h.01"/></svg></span><span>Дни рождения и события</span><b>›</b></button></nav>' +
        '<button type="button" class="cloud-secondary desktop-profile-signout" data-account-signout>Выйти из аккаунта</button>';
    } else if (desktopDrawerPage === "favorites") {
      content.innerHTML = '<section class="desktop-profile-page">' + favoriteListMarkup() + '</section>';
    } else {
      content.innerHTML = '<section class="desktop-profile-page"><p class="cloud-muted">Сохраните день рождения или другой важный повод — напоминание останется в вашем аккаунте.</p><form class="cloud-date-form" id="importantDateForm"><label>Имя или повод<input name="name" type="text" maxlength="80" placeholder="Например, день рождения Айжан" required></label><div class="cloud-date-fields"><label>Дата<input name="birthday" type="date" required></label><label>Напомнить<select name="reminderDays"><option value="3">За 3 дня</option><option value="1">За 1 день</option><option value="0">В день события</option><option value="7">За неделю</option></select></label></div><button class="btn btn--block" type="submit">Добавить напоминание</button><button class="cloud-reminder-permission" type="button" data-reminder-permission>Включить уведомления браузера</button></form><h3 class="desktop-profile-subtitle">Сохранённые даты</h3>' + importantDateListMarkup() + '</section>';
    }
    if (state.error) content.insertAdjacentHTML("afterbegin", '<p class="cloud-error" role="status">' + escapeHtml(state.error) + '</p>');
  }
  function ensureDesktopDrawerShell() {
    if (document.getElementById("desktopProfileDrawer")) return;
    const backdrop = document.createElement("div");
    backdrop.className = "desktop-profile-backdrop";
    backdrop.id = "desktopProfileBackdrop";
    backdrop.hidden = true;
    const drawer = document.createElement("aside");
    drawer.className = "desktop-profile-drawer";
    drawer.id = "desktopProfileDrawer";
    drawer.setAttribute("aria-label", "Профиль");
    drawer.setAttribute("aria-hidden", "true");
    drawer.inert = true;
    drawer.innerHTML = '<div class="desktop-profile-drawer__head"><button class="desktop-profile-drawer__back" type="button" id="desktopProfileBack" aria-label="Назад к профилю" hidden>‹</button><h2 id="desktopProfileTitle">Профиль</h2><button class="desktop-profile-drawer__close" type="button" id="desktopProfileClose" aria-label="Закрыть профиль">×</button></div><div class="desktop-profile-drawer__body" id="desktopProfileContent"></div><div class="desktop-profile-drawer__support"><strong>Поддержка</strong><a href="tel:+996509130090">Позвонить: +996 509 130 090</a><a href="https://wa.me/996509130090" target="_blank" rel="noopener">Написать в WhatsApp</a><a href="https://instagram.com/kudasebet" target="_blank" rel="noopener">Instagram: @kudasebet</a></div>';
    document.body.append(backdrop, drawer);
  }
  function renderProfilePanels() {
    renderDesktopDrawerContent();
    const wrapper = ensureProfilePanels();
    if (!wrapper) return;
    let accountBody;
    if (state.user) {
      accountBody = '<div class="cloud-user"><span><strong>' + escapeHtml(profileName(state.user)) + '</strong><small>' + escapeHtml(state.user.email || state.user.phone || "Аккаунт Куда Себет") + '</small></span><button type="button" class="cloud-secondary" data-account-signout>Выйти</button></div>';
    } else {
      const label = state.connecting ? "Подключаем Google…" : "Войти или создать профиль";
      accountBody = '<p class="cloud-muted">Войдите через Google, чтобы избранное и важные даты были доступны на сайте и в приложении.</p><button type="button" class="btn btn--block cloud-google" data-account-google' + (state.connecting ? ' disabled' : '') + '><span aria-hidden="true">G</span> ' + label + '</button>';
    }
    if (state.error) accountBody += '<p class="cloud-error" role="status">' + escapeHtml(state.error) + '</p>';
    const datesBody = state.user
      ? '<form class="cloud-date-form" id="importantDateForm"><label>Кого или что поздравить<input name="name" type="text" maxlength="80" placeholder="Имя или повод" required></label><div class="cloud-date-fields"><label>Дата<input name="birthday" type="date" required></label><label>Напомнить<select name="reminderDays"><option value="3">За 3 дня</option><option value="1">За 1 день</option><option value="0">В день</option><option value="7">За неделю</option></select></label></div><button class="btn btn--block" type="submit">Добавить напоминание</button><button class="cloud-reminder-permission" type="button" data-reminder-permission>Включить уведомления браузера</button><p class="cloud-muted">Веб-версия проверяет дату при открытии профиля. В Android-приложении работают локальные напоминания.</p></form>' + importantDateListMarkup()
      : importantDateListMarkup();
    wrapper.innerHTML = '<nav class="cloud-profile-nav" aria-label="Разделы профиля"><a href="#profile-favorites">Избранные</a><a href="#profile-dates">Дни рождения</a><a href="#profile-date-form">События</a></nav>' +
      '<div class="cloud-profile-content">' +
      '<section class="cloud-profile-section" id="profile-account"><h2>Аккаунт</h2><div class="cloud-panel">' + accountBody + '</div></section>' +
      '<section class="cloud-profile-section" id="profile-favorites"><h2>Избранные себеты</h2><div class="cloud-panel">' + favoriteListMarkup() + '</div></section>' +
      '<section class="cloud-profile-section" id="profile-dates"><h2>Дни рождения и события</h2><div class="cloud-panel" id="profile-date-form">' + datesBody + '</div></section>' +
      '</div>';
  }
  function announce(message) {
    let toast = document.getElementById("cloudToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "cloudToast";
      toast.className = "cloud-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(announce.timer);
    announce.timer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2600);
  }
  function profileUrl() {
    const isDesktopSite = window.matchMedia("(min-width: 900px)").matches && !window.location.pathname.endsWith("/app.html");
    const url = new URL(isDesktopSite ? "./index.html" : window.location.href, window.location.href);
    url.hash = "profile";
    return url.href;
  }
  function authReturnUrl() {
    const url = new URL("./index.html", window.location.href);
    url.hash = "auth";
    return url.href;
  }
  function requestLogin(productId) {
    if (productId) sessionSet(PENDING_FAVORITE_KEY, normalizedId(productId));
    const isDesktopSite = window.matchMedia("(min-width: 900px)").matches && !window.location.pathname.endsWith("/app.html");
    if (isDesktopSite) { window.location.href = profileUrl(); return; }
    sessionDelete(RETURN_KEY);
    if (window.location.pathname.endsWith("/app.html")) { window.location.hash = "profile"; connectSupabase(); return; }
    const menu = document.querySelector(".account-menu");
    if (menu) menu.open = true;
  }
  function profileName(user) {
    const metadata = user && user.user_metadata ? user.user_metadata : {};
    return metadata.full_name || metadata.name || (user && user.email ? user.email.split("@")[0] : "") || "Покупатель";
  }
  function dueDays(birthday) {
    const parts = String(birthday || "").slice(0, 10).split("-").map(Number);
    if (parts.length !== 3 || !parts[1] || !parts[2]) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let next = new Date(today.getFullYear(), parts[1] - 1, parts[2]);
    if (next < today) next = new Date(today.getFullYear() + 1, parts[1] - 1, parts[2]);
    return Math.round((next - today) / 86400000);
  }
  function formattedDate(value) {
    const parts = String(value || "").slice(0, 10).split("-").map(Number);
    if (parts.length !== 3 || !parts[1] || !parts[2]) return "";
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  }
  function reminderLabel(days) {
    if (days === 0) return "сегодня";
    if (days === 1) return "завтра";
    return "через " + days + " дн.";
  }
  function emitDueReminders() {
    if (!state.user || !("Notification" in window) || Notification.permission !== "granted") return;
    const currentYear = new Date().getFullYear();
    state.birthdays.filter(function (item) {
      const days = dueDays(item.birthday);
      return item.enabled !== false && days !== null && days <= Number(item.reminder_days_before || 0);
    }).forEach(function (item) {
      const days = dueDays(item.birthday);
      const marker = "kuda-reminder-shown:" + state.user.id + ":" + item.id + ":" + currentYear;
      try { if (localStorage.getItem(marker)) return; } catch (error) { /* continue without duplicate guard */ }
      const title = days === 0 ? "Сегодня важная дата" : "Скоро важная дата";
      const options = { body: item.name + " · " + reminderLabel(days) + ". Пора выбрать подарок в Куда Себет.", icon: "./assets/icons/app-icon-192.png", tag: marker };
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(function (registration) { return registration.showNotification(title, options); }).catch(function () { try { new Notification(title, options); } catch (error) { /* notifications may be unavailable */ } });
      } else {
        try { new Notification(title, options); } catch (error) { /* notifications may be unavailable */ }
      }
      try { localStorage.setItem(marker, "1"); } catch (error) { /* ignore */ }
    });
  }
  function loadOwnedData() {
    if (!client || !state.user) return;
    const userId = state.user.id;
    if (ownedDataPromise && ownedDataUserId === userId) return ownedDataPromise;
    ownedDataUserId = userId;
    const request = (async function () {
      state.error = "";
      const results = await Promise.all([
        client.from("favorites").select("product_id").eq("user_id", userId),
        client.from("birthdays").select("id,name,birthday,reminder_days_before,enabled").eq("user_id", userId).order("birthday", { ascending: true })
      ]);
      if (!state.user || state.user.id !== userId) return;
      const favoriteResult = results[0], birthdayResult = results[1];
      if (favoriteResult.error || birthdayResult.error) {
        state.error = "Не удалось загрузить данные профиля. Проверьте, что SQL-схема Supabase применена.";
        console.warn("Supabase profile data could not be loaded.", favoriteResult.error || birthdayResult.error);
      }
      state.favorites = new Set((favoriteResult.data || []).map(function (row) { return normalizedId(row.product_id); }));
      state.birthdays = birthdayResult.data || [];
      const profileResult = await client.from("profiles").upsert({
        id: userId,
        full_name: profileName(state.user),
        phone: state.user.phone || null
      }, { onConflict: "id" });
      if (profileResult.error) console.warn("Supabase profile row was not updated.", profileResult.error);
      state.ready = true;
      state.connecting = false;
      emit();
      emitDueReminders();
      await finishPendingFavorite();
    })();
    ownedDataPromise = request;
    return request.finally(function () {
      if (ownedDataPromise === request) {
        ownedDataPromise = null;
        ownedDataUserId = null;
      }
    });
  }
  async function finishPendingFavorite() {
    const userId = state.user && state.user.id;
    if (!userId) return;
    const pendingId = normalizedId(sessionGet(PENDING_FAVORITE_KEY));
    if (pendingId && !state.favorites.has(pendingId)) {
      const saved = await writeFavorite(pendingId, true);
      if (!saved) return;
    }
    if (!state.user || state.user.id !== userId) return;
    const returnTo = sessionGet(RETURN_KEY);
    sessionDelete(PENDING_FAVORITE_KEY);
    sessionDelete(RETURN_KEY);
    if (!returnTo) return;
    try {
      const target = new URL(returnTo, window.location.href);
      if (target.origin === window.location.origin && target.href !== window.location.href) window.setTimeout(function () { window.location.replace(target.href); }, 120);
    } catch (error) { /* ignore an invalid return URL */ }
  }
  async function writeFavorite(productId, add) {
    if (!client || !state.user) return false;
    const id = normalizedId(productId);
    const result = add
      ? await client.from("favorites").upsert({ user_id: state.user.id, product_id: id }, { onConflict: "user_id,product_id", ignoreDuplicates: true })
      : await client.from("favorites").delete().eq("user_id", state.user.id).eq("product_id", id);
    if (result.error) {
      state.error = "Не удалось обновить избранное. Попробуйте ещё раз.";
      console.warn("Supabase favorite update failed.", result.error);
      emit();
      return false;
    }
    if (add) state.favorites.add(id); else state.favorites.delete(id);
    state.error = "";
    emit();
    return true;
  }
  async function toggleFavorite(productId) {
    const id = normalizedId(productId);
    if (!id || busyFavorites.has(id)) return;
    const hadLoadedUser = state.ready && !!state.user;
    const wasMarkedFavorite = state.favorites.has(id);
    const authClient = await connectSupabase();
    if (!authClient) { announce("Не удалось подключить избранное. Проверьте интернет и попробуйте снова."); return; }
    if (!state.user) { requestLogin(id); return; }
    busyFavorites.add(id);
    const shouldAdd = hadLoadedUser ? !state.favorites.has(id) : !(wasMarkedFavorite && state.favorites.has(id));
    const saved = await writeFavorite(id, shouldAdd);
    busyFavorites.delete(id);
    if (saved) announce(shouldAdd ? "Себет сохранён в избранное." : "Себет удалён из избранного.");
  }
  function cleanBirthdayFields(name, birthday, reminderDays) {
    const cleanName = String(name || "").trim();
    const cleanDate = String(birthday || "").slice(0, 10);
    const days = Number(reminderDays);
    const dateParts = cleanDate.split("-").map(Number);
    const date = dateParts.length === 3 ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2]) : null;
    const validDate = date && date.getFullYear() === dateParts[0] && date.getMonth() === dateParts[1] - 1 && date.getDate() === dateParts[2];
    if (!cleanName || cleanName.length > 80 || !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate) || !validDate || !Number.isInteger(days) || days < 0 || days > 30) {
      announce("Проверьте имя, дату и срок напоминания.");
      return null;
    }
    return { name: cleanName, birthday: cleanDate, reminder_days_before: days };
  }
  async function saveBirthday(name, birthday, reminderDays) {
    if (!client || !state.user) { requestLogin(); return false; }
    const fields = cleanBirthdayFields(name, birthday, reminderDays);
    if (!fields) return false;
    const { data, error } = await client.from("birthdays").insert({ user_id: state.user.id, name: fields.name, birthday: fields.birthday, reminder_days_before: fields.reminder_days_before, enabled: true }).select("id,name,birthday,reminder_days_before,enabled").single();
    if (error) {
      state.error = "Не удалось сохранить дату. Попробуйте ещё раз.";
      console.warn("Supabase important date save failed.", error);
      emit();
      return false;
    }
    state.birthdays = state.birthdays.concat([data]).sort(function (a, b) { return String(a.birthday).localeCompare(String(b.birthday)); });
    state.error = "";
    emit();
    emitDueReminders();
    return true;
  }
  async function updateBirthday(id, name, birthday, reminderDays) {
    if (!client || !state.user) { requestLogin(); return false; }
    const fields = cleanBirthdayFields(name, birthday, reminderDays);
    if (!fields) return false;
    const { data, error } = await client.from("birthdays").update(fields).eq("user_id", state.user.id).eq("id", String(id)).select("id,name,birthday,reminder_days_before,enabled").single();
    if (error) {
      state.error = "Не удалось обновить напоминание. Попробуйте ещё раз.";
      console.warn("Supabase important date update failed.", error);
      emit();
      return false;
    }
    state.birthdays = state.birthdays.map(function (item) { return String(item.id) === String(id) ? data : item; }).sort(function (a, b) { return String(a.birthday).localeCompare(String(b.birthday)); });
    state.error = "";
    emit();
    emitDueReminders();
    announce("Напоминание обновлено.");
    return true;
  }
  async function deleteBirthday(id) {
    if (!client || !state.user) return false;
    const { error } = await client.from("birthdays").delete().eq("user_id", state.user.id).eq("id", String(id));
    if (error) {
      state.error = "Не удалось удалить дату.";
      console.warn("Supabase important date delete failed.", error);
      emit();
      return false;
    }
    state.birthdays = state.birthdays.filter(function (item) { return String(item.id) !== String(id); });
    emit();
    return true;
  }
  async function loadSupabaseSdk() {
    if (window.supabase && typeof window.supabase.createClient === "function") return;
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.onload = resolve;
      script.onerror = function () { reject(new Error("Supabase SDK could not be loaded.")); };
      document.head.appendChild(script);
    });
    return sdkPromise;
  }
  function connectSupabase() {
    if (clientPromise) return clientPromise;
    if (client) return Promise.resolve(client);
    state.connecting = true;
    state.error = "";
    renderProfilePanels();
    clientPromise = loadSupabaseSdk().then(async function () {
      if (!window.supabase || typeof window.supabase.createClient !== "function") throw new Error("Supabase SDK is unavailable.");
      client = window.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce", storageKey: "kudasebet-web-auth-v1" }
      });
      client.auth.onAuthStateChange(function (event, session) {
        if (event === "INITIAL_SESSION") return;
        state.user = session && session.user ? session.user : null;
        if (!state.user) {
          state.ready = true;
          state.connecting = false;
          state.favorites.clear();
          state.birthdays = [];
          emit();
        } else if (event === "TOKEN_REFRESHED") {
          state.ready = true;
          state.connecting = false;
          emit();
        } else {
          state.ready = false;
          state.connecting = true;
          emit();
          if (event !== "TOKEN_REFRESHED") window.setTimeout(loadOwnedData, 0);
        }
      });
      const result = await client.auth.getSession();
      if (result.error) throw result.error;
      state.user = result.data && result.data.session ? result.data.session.user : null;
      if (state.user) await loadOwnedData();
      else { state.ready = true; state.connecting = false; emit(); }
      return client;
    }).catch(function (error) {
      state.ready = true;
      state.connecting = false;
      state.error = "Supabase недоступен. Проверьте подключение к интернету.";
      console.warn("Supabase could not be initialized.", error);
      client = null;
      clientPromise = null;
      sdkPromise = null;
      emit();
      return null;
    });
    return clientPromise;
  }
  async function signInWithGoogle() {
    const authClient = await connectSupabase();
    if (!authClient) return;
    if (state.user) { announce("Вы уже вошли в профиль."); return; }
    sessionSet(LOGIN_PENDING_KEY, "1");
    const { error } = await authClient.auth.signInWithOAuth({ provider: "google", options: { redirectTo: authReturnUrl() } });
    if (error) {
      sessionDelete(LOGIN_PENDING_KEY);
      state.error = "Вход Google не выполнен. Проверьте OAuth и адрес возврата в Supabase.";
      emit();
      console.warn("Supabase Google sign-in failed.", error);
    }
  }
  async function signOut() {
    if (!client) return;
    if (window.location.hash === "#profile") history.replaceState(null, "", window.location.pathname + window.location.search);
    const accountMenu = document.querySelector(".account-menu");
    if (accountMenu) accountMenu.open = false;
    const { error } = await client.auth.signOut();
    if (error) {
      state.error = "Не удалось выйти из аккаунта.";
      emit();
      return;
    }
    state.user = null;
    state.favorites.clear();
    state.birthdays = [];
    state.ready = true;
    setDesktopDrawer(false);
    emit();
    if (!/\/(?:index\.html)?$/.test(window.location.pathname)) {
      sessionSet("kuda-account-flash-v1", "Вы вышли из аккаунта");
      window.location.assign(new URL("./index.html", window.location.href).href);
      return;
    }
    announce("Вы вышли из аккаунта");
  }
  async function requestNotificationPermission() {
    if (!("Notification" in window)) { announce("Уведомления не поддерживаются в этом браузере."); return; }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      emitDueReminders();
      announce("Уведомления браузера включены. Даты проверяются при открытии профиля.");
    } else announce("Разрешите уведомления в настройках браузера.");
  }

  window.KudaSebetAccount = {
    snapshot: snapshot,
    subscribe: function (callback) { window.addEventListener("kuda-account:updated", callback); return function () { window.removeEventListener("kuda-account:updated", callback); }; },
    normalizeProductId: normalizedId,
    isFavorite: function (id) { return state.favorites.has(normalizedId(id)); },
    toggleFavorite: toggleFavorite,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    saveBirthday: saveBirthday,
    updateBirthday: updateBirthday,
    deleteBirthday: deleteBirthday,
    requestNotificationPermission: requestNotificationPermission,
    catalogChanged: catalogChanged,
    refresh: loadOwnedData
  };

  ensureDesktopDrawerShell();
  if (!window.KS) {
    const menuButton = document.getElementById("menuBtn");
    const compactMenu = document.getElementById("compactMenu");
    if (menuButton && compactMenu) menuButton.addEventListener("click", function (event) {
      event.stopPropagation();
      compactMenu.hidden = !compactMenu.hidden;
      menuButton.setAttribute("aria-expanded", String(!compactMenu.hidden));
    });
    document.addEventListener("click", function (event) {
      if (compactMenu && !compactMenu.hidden && !compactMenu.contains(event.target) && !menuButton.contains(event.target)) {
        compactMenu.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
      }
      const accountMenu = document.querySelector(".account-menu[open]");
      if (accountMenu && !accountMenu.contains(event.target)) accountMenu.open = false;
    });
  }

  function setDesktopDrawer(open) {
    const drawer = document.getElementById("desktopProfileDrawer");
    const backdrop = document.getElementById("desktopProfileBackdrop");
    if (!drawer || !backdrop) return;
    if (open) {
      renderProfilePanels();
      const accountMenu = document.querySelector(".account-menu");
      if (accountMenu) accountMenu.open = false;
      drawer.inert = false;
      drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("profile-drawer-open");
      backdrop.hidden = false;
      requestAnimationFrame(function () { drawer.classList.add("is-open"); backdrop.classList.add("is-open"); });
      connectSupabase();
    } else {
      drawer.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      drawer.inert = true;
      drawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("profile-drawer-open");
      window.setTimeout(function () { if (!drawer.classList.contains("is-open")) backdrop.hidden = true; }, 280);
      if (window.location.hash === "#profile") history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  document.addEventListener("click", function (event) {
    const profileSummary = event.target.closest(".account-menu__trigger");
    if (profileSummary && state.user && window.matchMedia("(min-width: 900px)").matches) {
      event.preventDefault();
      event.stopPropagation();
      const menu = profileSummary.closest(".account-menu");
      if (menu) menu.open = false;
      desktopDrawerPage = "menu";
      setDesktopDrawer(true);
      return;
    }
    if (profileSummary && !state.ready && window.matchMedia("(min-width: 900px)").matches) {
      connectSupabase().then(function () {
        if (state.user) {
          const menu = profileSummary.closest(".account-menu");
          if (menu) menu.open = false;
          desktopDrawerPage = "menu";
          setDesktopDrawer(true);
        }
      });
    }
    if (event.target.closest("#desktopProfileClose, #desktopProfileBackdrop")) { setDesktopDrawer(false); return; }
    if (event.target.closest("#desktopProfileBack")) { desktopDrawerPage = "menu"; renderDesktopDrawerContent(); return; }
    const profileView = event.target.closest("[data-profile-view]");
    if (profileView) { event.preventDefault(); desktopDrawerPage = profileView.getAttribute("data-profile-view"); setDesktopDrawer(true); return; }
    const editBirthday = event.target.closest("[data-birthday-edit]");
    if (editBirthday) {
      const row = editBirthday.closest(".cloud-date-row");
      const form = row && row.querySelector("[data-birthday-edit-form]");
      if (form) {
        const shouldOpen = form.hidden;
        document.querySelectorAll("[data-birthday-edit-form]").forEach(function (otherForm) {
          otherForm.hidden = true;
          const button = otherForm.closest(".cloud-date-row") && otherForm.closest(".cloud-date-row").querySelector("[data-birthday-edit]");
          if (button) button.setAttribute("aria-expanded", "false");
        });
        form.hidden = !shouldOpen;
        editBirthday.setAttribute("aria-expanded", String(shouldOpen));
        if (shouldOpen) window.requestAnimationFrame(function () { form.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
      }
      return;
    }
    const cancelBirthdayEdit = event.target.closest("[data-birthday-cancel]");
    if (cancelBirthdayEdit) {
      const form = cancelBirthdayEdit.closest("[data-birthday-edit-form]");
      if (form) form.hidden = true;
      const editButton = form && form.closest(".cloud-date-row").querySelector("[data-birthday-edit]");
      if (editButton) editButton.setAttribute("aria-expanded", "false");
      return;
    }
    const favorite = event.target.closest("[data-favorite-id]");
    if (favorite) {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(favorite.getAttribute("data-favorite-id"));
      return;
    }
    if (event.target.closest('[data-go="profile"]')) {
      renderProfilePanels();
      connectSupabase();
    }
    if (event.target.closest("[data-account-google]")) {
      if (state.user) {
        const menu = event.target.closest(".account-menu");
        if (menu) menu.open = false;
        desktopDrawerPage = "menu";
        setDesktopDrawer(true);
      }
      else signInWithGoogle();
      return;
    }
    if (event.target.closest("[data-account-signout]")) { signOut(); return; }
    if (event.target.closest("[data-reminder-permission]")) { requestNotificationPermission(); return; }
    const removeDate = event.target.closest("[data-birthday-delete]");
    if (removeDate) deleteBirthday(removeDate.getAttribute("data-birthday-delete"));
  });
  window.addEventListener("hashchange", function () {
    if (window.location.hash === "#profile") {
      renderProfilePanels();
      connectSupabase().then(function () {
        if (state.user) { desktopDrawerPage = "menu"; setDesktopDrawer(true); }
        else if (state.ready) { const menu = document.querySelector(".account-menu"); if (menu) menu.open = true; }
      });
    }
  });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") setDesktopDrawer(false); });
  document.addEventListener("submit", function (event) {
    if (!event.target) return;
    const form = event.target;
    const isBirthdayEdit = form.matches("[data-birthday-edit-form]");
    if (!isBirthdayEdit && form.id !== "importantDateForm") return;
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (button) { button.disabled = true; button.textContent = "Сохраняем…"; }
    if (isBirthdayEdit) {
      updateBirthday(form.getAttribute("data-birthday-edit-form"), form.elements.name.value, form.elements.birthday.value, form.elements.reminderDays.value).then(function () {
        if (button && button.isConnected) { button.disabled = false; button.textContent = "Сохранить"; }
      });
      return;
    }
    saveBirthday(form.elements.name.value, form.elements.birthday.value, form.elements.reminderDays.value).then(function (saved) {
      if (saved) form.reset();
      if (button && button.isConnected) { button.disabled = false; button.textContent = "Добавить напоминание"; }
    });
  });

  ensureProfilePanels();
  renderProfilePanels();
  renderHeaderAccount();
  renderHomeTiles();
  paintFavoriteButtons();
  const accountFlash = sessionGet("kuda-account-flash-v1");
  if (accountFlash) {
    sessionDelete("kuda-account-flash-v1");
    window.setTimeout(function () { announce(accountFlash); }, 120);
  }
  if (window.location.hash === "#profile" || window.location.hash === "#auth" || hasStoredAuthSession()) connectSupabase();
})();
