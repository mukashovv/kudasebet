/* Shared Supabase account, favorites, and annual reminder data for Kuda Sebet. */
(function () {
  "use strict";

  const PROJECT_URL = "https://fvepumfkvxggdkwdoexs.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_lYwkxkrJpQpQFv2MzPDMQA__9JW2zXQ";
  const RETURN_KEY = "kuda-sebet-account-return-v1";
  const PENDING_FAVORITE_KEY = "kuda-sebet-pending-favorite-v1";
  const state = { ready: false, user: null, favorites: new Set(), birthdays: [], error: "" };
  const busyFavorites = new Set();
  let client = null;

  function sessionGet(key) { try { return sessionStorage.getItem(key); } catch (error) { return null; } }
  function sessionSet(key, value) { try { sessionStorage.setItem(key, value); } catch (error) { /* storage may be disabled */ } }
  function sessionDelete(key) { try { sessionStorage.removeItem(key); } catch (error) { /* storage may be disabled */ } }
  function normalizedId(value) { return String(value || "").trim().replace(/-popular$/, ""); }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function snapshot() {
    return { ready: state.ready, user: state.user, favorites: Array.from(state.favorites), birthdays: state.birthdays.slice(), error: state.error };
  }
  function emit() {
    paintFavoriteButtons();
    renderProfilePanels();
    updateFavoriteCounts();
    window.dispatchEvent(new CustomEvent("kuda-account:updated", { detail: snapshot() }));
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
  function updateFavoriteCounts() {
    document.querySelectorAll("[data-favorite-count]").forEach(function (node) {
      node.textContent = String(state.favorites.size);
      node.hidden = state.favorites.size === 0;
    });
  }
  function productIdForCard(card) {
    const opener = card.querySelector("[data-open]");
    if (opener) return normalizedId(opener.getAttribute("data-open"));
    const link = card.querySelector('a[href*="product.html?item="]');
    if (link) {
      try { return normalizedId(new URL(link.href, window.location.href).searchParams.get("item")); } catch (error) { return ""; }
    }
    return "";
  }
  function decorateCards() {
    document.querySelectorAll(".card, .pcard").forEach(function (card) {
      if (card.classList.contains("card--note")) return;
      const id = productIdForCard(card);
      if (!id) return;
      let button = card.querySelector("[data-favorite-id]");
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = card.classList.contains("pcard") ? "pcard__favorite" : "card-favorite";
        button.setAttribute("data-favorite-id", id);
        button.setAttribute("aria-pressed", "false");
        button.textContent = "♡";
        card.appendChild(button);
      } else button.setAttribute("data-favorite-id", id);
    });
  }
  function decorateProductDetail() {
    const addButton = document.getElementById("addBtn");
    const actions = addButton && addButton.closest(".details__actions");
    if (!actions) return;
    const id = normalizedId(new URLSearchParams(window.location.search).get("item"));
    if (!id) return;
    let button = document.getElementById("favoriteProductButton");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.id = "favoriteProductButton";
      button.className = "btn btn--lg product-favorite";
      button.textContent = "♡ В избранное";
      actions.insertBefore(button, actions.firstChild);
    }
    button.setAttribute("data-favorite-id", id);
  }
  function decorateHeaderLinks() {
    document.querySelectorAll(".site-header .header-actions").forEach(function (actions) {
      if (!actions.querySelector(".account-link")) {
        const link = document.createElement("a");
        link.className = "btn desktop-only account-link";
        link.href = "./app.html#profile";
        link.setAttribute("aria-label", "Профиль и избранное");
        link.innerHTML = '♡ Профиль <span class="account-count" data-favorite-count hidden>0</span>';
        const cart = actions.querySelector("[data-open-cart]");
        actions.insertBefore(link, cart || actions.firstChild);
      }
    });
    document.querySelectorAll(".compact-menu__actions").forEach(function (actions) {
      if (!actions.querySelector(".account-link-mobile")) {
        const link = document.createElement("a");
        link.className = "btn account-link-mobile";
        link.href = "./app.html#profile";
        link.textContent = "Войти · избранное · даты";
        actions.appendChild(link);
      }
    });
  }
  function importantDateListMarkup() {
    if (!state.user) return '<div class="cloud-muted">Войдите через Google, чтобы сохранять дни рождения и важные даты.</div>';
    if (!state.birthdays.length) return '<div class="cloud-muted">Добавьте важный день, чтобы увидеть напоминание здесь.</div>';
    return '<div class="cloud-date-list">' + state.birthdays.map(function (item) {
      const days = dueDays(item.birthday);
      const when = days === null ? "" : reminderLabel(days);
      return '<div class="cloud-date-row"><span class="cloud-date-icon">🎁</span><span class="cloud-date-copy"><strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(formattedDate(item.birthday)) + (when ? ' · ' + escapeHtml(when) : '') + ' · напомнить за ' + Number(item.reminder_days_before || 0) + ' дн.</small></span><button type="button" data-birthday-delete="' + escapeHtml(item.id) + '" aria-label="Удалить дату">×</button></div>';
    }).join("") + '</div>';
  }
  function favoriteListMarkup() {
    if (!state.user) return '<div class="cloud-muted">Войдите через Google, чтобы хранить избранные себеты в аккаунте.</div>';
    if (!state.favorites.size) return '<div class="cloud-muted">Нажмите на сердечко у себета, чтобы добавить его сюда.</div>';
    const cards = Array.from(document.querySelectorAll("#grid .pcard, #popular .card, #catalog .card"));
    const found = new Map();
    cards.forEach(function (card) {
      const id = productIdForCard(card);
      if (!id || !state.favorites.has(id) || found.has(id)) return;
      const nameNode = card.querySelector(".pcard__name, h3");
      const priceNode = card.querySelector(".pcard__price, .price");
      const image = card.querySelector("img");
      found.set(id, {
        id: id,
        name: nameNode ? nameNode.textContent.trim() : id,
        price: priceNode ? priceNode.textContent.trim() : "",
        image: image ? image.getAttribute("src") : "./assets/img/cards/kuda_sebet_s.jpg"
      });
    });
    if (!found.size) return '<div class="cloud-muted">Себеты из избранного появятся здесь, когда каталог загрузится.</div>';
    return '<div class="cloud-favorite-list">' + Array.from(found.values()).map(function (item) {
      return '<div class="cloud-favorite-row"><img src="' + escapeHtml(item.image) + '" alt=""><span><strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(item.price) + '</small></span><button type="button" data-favorite-id="' + escapeHtml(item.id) + '" aria-label="Убрать из избранного">♥</button></div>';
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
  function renderProfilePanels() {
    const wrapper = ensureProfilePanels();
    if (!wrapper) return;
    const user = state.user;
    let accountBody = "";
    if (!state.ready) accountBody = '<div class="cloud-muted">Подключаем профиль…</div>';
    else if (user) accountBody = '<div class="cloud-user"><span><strong>' + escapeHtml(profileName(user)) + '</strong><small>' + escapeHtml(user.email || user.phone || "Аккаунт Куда Себет") + '</small></span><button type="button" class="cloud-secondary" data-account-signout>Выйти</button></div>';
    else accountBody = '<p class="cloud-muted">Войдите, чтобы избранное и важные даты были доступны на сайте и в приложении.</p><button type="button" class="btn btn--block cloud-google" data-account-google><span aria-hidden="true">G</span> Продолжить с Google</button>';
    if (state.error) accountBody += '<p class="cloud-error" role="status">' + escapeHtml(state.error) + '</p>';
    const datesBody = user
      ? '<form class="cloud-date-form" id="importantDateForm"><label>Кого или что поздравить<input name="name" type="text" maxlength="80" placeholder="Имя или повод" required></label><div class="cloud-date-fields"><label>Дата<input name="birthday" type="date" required></label><label>Напомнить<select name="reminderDays"><option value="3">За 3 дня</option><option value="1">За 1 день</option><option value="0">В день</option><option value="7">За неделю</option></select></label></div><button class="btn btn--block" type="submit">Добавить напоминание</button><button class="cloud-reminder-permission" type="button" data-reminder-permission>Включить уведомления браузера</button><p class="cloud-muted">Веб-версия проверяет дату при открытии сайта. В Android-приложении работают локальные напоминания.</p></form>' + importantDateListMarkup()
      : importantDateListMarkup();
    wrapper.innerHTML = '<section class="cloud-profile-section"><h2>Аккаунт</h2><div class="cloud-panel">' + accountBody + '</div></section>' +
      '<section class="cloud-profile-section"><h2>Избранные себеты</h2><div class="cloud-panel">' + favoriteListMarkup() + '</div></section>' +
      '<section class="cloud-profile-section"><h2>Дни рождения и важные даты</h2><div class="cloud-panel">' + datesBody + '</div></section>';
  }
  function decorateDocument() {
    decorateHeaderLinks();
    decorateCards();
    decorateProductDetail();
    ensureProfilePanels();
    paintFavoriteButtons();
    updateFavoriteCounts();
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
    const url = new URL("./app.html", window.location.href);
    url.hash = "profile";
    return url.href;
  }
  function goToProfile() {
    const target = profileUrl();
    if (window.location.pathname.endsWith("/app.html")) {
      window.location.hash = "profile";
    } else {
      window.location.href = target;
    }
  }
  function requestLogin(productId) {
    if (productId) sessionSet(PENDING_FAVORITE_KEY, normalizedId(productId));
    sessionSet(RETURN_KEY, window.location.href);
    goToProfile();
    announce("Войдите через Google, чтобы сохранить избранное.");
  }
  function profileName(user) {
    const metadata = user && user.user_metadata ? user.user_metadata : {};
    return metadata.full_name || metadata.name || (user && user.email ? user.email.split("@")[0] : "") || "Покупатель";
  }
  function dueDays(birthday) {
    const value = String(birthday || "").slice(0, 10);
    const parts = value.split("-").map(Number);
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
      const year = currentYear + (dueDays(item.birthday) !== null && String(item.birthday).slice(5) < new Date().toISOString().slice(5, 10) ? 1 : 0);
      const marker = "kuda-reminder-shown:" + state.user.id + ":" + item.id + ":" + year;
      try { if (localStorage.getItem(marker)) return; } catch (error) { /* continue without duplicate guard */ }
      const days = dueDays(item.birthday);
      const title = days === 0 ? "Сегодня важная дата" : "Скоро важная дата";
      const options = { body: item.name + " · " + reminderLabel(days) + ". Пора выбрать подарок в Куда Себет.", icon: "./assets/icons/app-icon-192.png", tag: marker };
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(function (registration) { return registration.showNotification(title, options); }).catch(function () {
          try { new Notification(title, options); } catch (error) { /* notifications may be unavailable */ }
        });
      } else {
        try { new Notification(title, options); } catch (error) { /* notifications may be unavailable */ }
      }
      try { localStorage.setItem(marker, "1"); } catch (error) { /* ignore */ }
    });
  }
  async function loadOwnedData() {
    if (!client || !state.user) return;
    const userId = state.user.id;
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
    const email = state.user.email || null;
    const phone = state.user.phone || null;
    client.from("profiles").upsert({ id: userId, full_name: profileName(state.user), phone: phone }, { onConflict: "id" }).then(function (result) {
      if (result.error) console.warn("Supabase profile row was not updated.", result.error);
    });
    state.ready = true;
    emit();
    emitDueReminders();
    await finishPendingFavorite();
  }
  async function finishPendingFavorite() {
    const userId = state.user && state.user.id;
    if (!userId) return;
    const pendingId = normalizedId(sessionGet(PENDING_FAVORITE_KEY));
    if (pendingId && !state.favorites.has(pendingId)) await writeFavorite(pendingId, true);
    if (!state.user || state.user.id !== userId) return;
    const returnTo = sessionGet(RETURN_KEY);
    sessionDelete(PENDING_FAVORITE_KEY);
    sessionDelete(RETURN_KEY);
    if (!returnTo) return;
    try {
      const target = new URL(returnTo, window.location.href);
      if (target.origin === window.location.origin && target.href !== window.location.href) {
        window.setTimeout(function () { window.location.replace(target.href); }, 120);
      }
    } catch (error) { /* ignore an invalid return URL */ }
  }
  async function writeFavorite(productId, add) {
    if (!client || !state.user) return false;
    const id = normalizedId(productId);
    const result = add
      ? await client.from("favorites").insert({ user_id: state.user.id, product_id: id })
      : await client.from("favorites").delete().eq("user_id", state.user.id).eq("product_id", id);
    if (result.error && !(add && result.error.code === "23505")) {
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
    if (!id) return;
    if (!state.user) { requestLogin(id); return; }
    if (busyFavorites.has(id)) return;
    busyFavorites.add(id);
    const ok = await writeFavorite(id, !state.favorites.has(id));
    busyFavorites.delete(id);
    if (ok) announce(state.favorites.has(id) ? "Себет сохранён в избранное." : "Себет удалён из избранного.");
  }
  async function saveBirthday(name, birthday, reminderDays) {
    if (!client || !state.user) { requestLogin(); return false; }
    const cleanName = String(name || "").trim();
    const cleanDate = String(birthday || "").slice(0, 10);
    const days = Number(reminderDays);
    if (!cleanName || cleanName.length > 80 || !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate) || !Number.isInteger(days) || days < 0 || days > 30) {
      announce("Проверьте имя, дату и срок напоминания.");
      return false;
    }
    const { data, error } = await client.from("birthdays").insert({
      user_id: state.user.id,
      name: cleanName,
      birthday: cleanDate,
      reminder_days_before: days,
      enabled: true
    }).select("id,name,birthday,reminder_days_before,enabled").single();
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
  async function signInWithGoogle() {
    if (!client) { announce("Не удалось загрузить Supabase. Обновите страницу при подключённом интернете."); return; }
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: profileUrl() }
    });
    if (error) {
      state.error = "Вход Google не выполнен. Проверьте OAuth и адрес возврата в Supabase.";
      emit();
      console.warn("Supabase Google sign-in failed.", error);
    }
  }
  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) {
      state.error = "Не удалось выйти из аккаунта.";
      emit();
      return;
    }
    state.user = null;
    state.favorites.clear();
    state.birthdays = [];
    emit();
  }
  async function requestNotificationPermission() {
    if (!("Notification" in window)) { announce("Уведомления не поддерживаются в этом браузере."); return; }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      emitDueReminders();
      announce("Уведомления браузера включены. Даты проверяются при открытии сайта.");
    } else announce("Разрешите уведомления в настройках браузера, чтобы получать напоминания при открытии сайта.");
  }

  const api = {
    snapshot: snapshot,
    subscribe: function (callback) { window.addEventListener("kuda-account:updated", callback); return function () { window.removeEventListener("kuda-account:updated", callback); }; },
    normalizeProductId: normalizedId,
    isFavorite: function (id) { return state.favorites.has(normalizedId(id)); },
    toggleFavorite: toggleFavorite,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    saveBirthday: saveBirthday,
    deleteBirthday: deleteBirthday,
    requestNotificationPermission: requestNotificationPermission,
    daysUntil: dueDays,
    formatDate: formattedDate,
    reminderLabel: reminderLabel,
    paintFavoriteButtons: paintFavoriteButtons,
    refresh: loadOwnedData
  };
  window.KudaSebetAccount = api;

  document.addEventListener("click", function (event) {
    const favorite = event.target.closest("[data-favorite-id]");
    if (favorite) {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(favorite.getAttribute("data-favorite-id"));
      return;
    }
    if (event.target.closest("[data-account-google]")) { signInWithGoogle(); return; }
    if (event.target.closest("[data-account-signout]")) { signOut(); return; }
    if (event.target.closest("[data-reminder-permission]")) { requestNotificationPermission(); return; }
    const removeDate = event.target.closest("[data-birthday-delete]");
    if (removeDate) deleteBirthday(removeDate.getAttribute("data-birthday-delete"));
  });
  document.addEventListener("submit", function (event) {
    if (!event.target || event.target.id !== "importantDateForm") return;
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const name = form.elements.name.value;
    const birthday = form.elements.birthday.value;
    const days = form.elements.reminderDays.value;
    if (button) { button.disabled = true; button.textContent = "Сохраняем…"; }
    saveBirthday(name, birthday, days).then(function (saved) {
      if (saved) form.reset();
      if (button) { button.disabled = false; button.textContent = "Добавить напоминание"; }
    });
  });

  decorateDocument();
  if ("MutationObserver" in window) {
    const uiObserver = new MutationObserver(function (records) {
      let catalogChanged = false;
      records.forEach(function (record) {
        Array.from(record.addedNodes || []).forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(".card, .pcard")) catalogChanged = true;
          if (node.querySelector && node.querySelector(".card, .pcard")) catalogChanged = true;
        });
      });
      decorateDocument();
      if (catalogChanged) renderProfilePanels();
    });
    uiObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    state.ready = true;
    state.error = "Supabase недоступен. Для входа нужно подключение к интернету.";
    emit();
    return;
  }
  client = window.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce", storageKey: "kudasebet-web-auth-v1" }
  });
  client.auth.onAuthStateChange(function (event, session) {
    state.user = session && session.user ? session.user : null;
    if (!state.user) {
      state.ready = true;
      state.favorites.clear();
      state.birthdays = [];
      emit();
      return;
    }
    state.ready = true;
    emit();
    if (event !== "TOKEN_REFRESHED") window.setTimeout(loadOwnedData, 0);
  });
  client.auth.getSession().then(function (result) {
    state.user = result.data && result.data.session ? result.data.session.user : null;
    state.ready = true;
    if (state.user) return loadOwnedData();
    emit();
  }).catch(function (error) {
    state.ready = true;
    state.error = "Не удалось проверить сессию Supabase.";
    console.warn("Supabase session restore failed.", error);
    emit();
  });
})();
