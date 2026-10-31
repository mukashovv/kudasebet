(() => {
  const IMAGE = "./assets/img/cards/kuda_sebet_s-removebg-preview_square.png";
  const WHATSAPP = "996509130090";
  const CART_KEY = "kudasebet-app-cart-v1";
  const BUILDER_KEY = "kudasebet-app-builder-v1";
  const products = [
    {id:"sebet-s",name:"Куда Себет S",size:"S",price:4790,category:"classic",caption:"Сладости и сочные фрукты",description:"Маленький мир сладостей и фруктов, подобранных с любовью. Нежный знак внимания для самых близких.",composition:"Merci, Toblerone mini, сок Yan, виноград «Дамские пальчики», драконий фрукт, гранат и манго."},
    {id:"sebet-m",name:"Куда Себет M",size:"M",price:6990,category:"classic",image:"./assets/img/stories/story-kyrgyz.webp",caption:"Фрукты, сладости и сок Yan",description:"Подарочная корзина с сочными фруктами, сладостями и натуральным соком. Самый тёплый способ сказать «я о тебе подумал». ",composition:"Драконий фрукт, гранат, манго, ананас, маракуйя, виноград, печенье и сок Yan."},
    {id:"sebet-vip",name:"Куда Себет VIP",size:"VIP",price:13790,category:"classic",image:"./assets/img/stories/story-combo.webp",caption:"Для большого впечатления",description:"Премиальный себет для особых случаев — яркий, щедрый и собранный вручную.",composition:"Экзотические фрукты, Raffaello, Ferrero Rocher, Merci, Toblerone и сок Yan."},
    {id:"sebet-combo",name:"Комбо 3 в 1",size:"XL",price:25570,category:"celebration",image:"./assets/img/stories/story-combo.webp",caption:"Праздник для всей семьи",description:"Большая праздничная корзина с богатым составом для семейных торжеств и важных событий.",composition:"Расширенный набор свежих фруктов, сладостей, напитков и фирменная корзина большого объёма."},
    {id:"kyrgyz-box",name:"Кыргыз Box",size:"K",price:8390,category:"celebration",image:"./assets/img/stories/story-kyrgyz.webp",caption:"Тёплый подарок с местным характером",description:"Подарочный набор с фруктами, сладостями и небольшими акцентами, которые напоминают о доме.",composition:"Фрукты, шоколад, любимые сладости, сок и декоративная корзина."},
    {id:"holiday-box",name:"Майрам Box",size:"GIFT",price:13990,category:"celebration",image:"./assets/img/stories/story-mar8.webp",caption:"Готов к вашему празднику",description:"Праздничная корзина с ярким наполнением для юбилеев, встреч и важных моментов.",composition:"Фрукты, шоколад, конфеты, напитки и праздничный декор."}
  ];
  const sizeOptions = [
    {id:"S",name:"Небольшой",price:500,min:7},
    {id:"M",name:"Побольше",price:750,min:9},
    {id:"VIP",name:"Большой",price:850,min:12}
  ];
  const builderCategories = [
    {id:"candies",name:"Конфеты",icon:"🍬",items:[{id:"raffaello",name:"Raffaello",price:680,emoji:"🤍"},{id:"ferrero",name:"Ferrero Rocher (8 шт)",price:850,emoji:"🍫"},{id:"merci",name:"Маленький Merci",price:400,emoji:"💝"},{id:"toblerone",name:"Toblerone мини",price:190,emoji:"🍫"},{id:"oreo",name:"Oreo Original",price:210,emoji:"🍪"},{id:"chocopie",name:"Choco Pie (12 шт)",price:280,emoji:"🍪"}]},
    {id:"fruits",name:"Фрукты",icon:"🍊",items:[{id:"grape",name:"Виноград «Дамские пальчики»",price:250,emoji:"🍇"},{id:"dragon",name:"Драконий фрукт",price:250,emoji:"🐉"},{id:"pomegranate",name:"Гранат",price:320,emoji:"🍎"},{id:"mango",name:"Манго",price:450,emoji:"🥭"},{id:"pineapple",name:"Ананас",price:620,emoji:"🍍"},{id:"passion",name:"Маракуйя",price:200,emoji:"🍈"}]},
    {id:"drinks",name:"Напитки",icon:"🧃",items:[{id:"yan-mini",name:"Yan яблоко–груша, 0.25 л",price:135,emoji:"🧃"},{id:"yan-grape",name:"Сок Yan виноград",price:430,emoji:"🍇"},{id:"rich",name:"Rich апельсин, 1 л",price:220,emoji:"🍊"},{id:"j7",name:"J7 яблоко, 1 л",price:210,emoji:"🍏"},{id:"cola",name:"Coca-Cola, 1 л",price:140,emoji:"🥤"},{id:"sprite",name:"Sprite, 1 л",price:140,emoji:"🍋"}]},
    {id:"extras",name:"Декор",icon:"🎀",items:[{id:"basket-net",name:"Сеточка под продукты",price:200,emoji:"🧺"},{id:"decor",name:"Праздничный декор",price:250,emoji:"🎀"},{id:"cookie-jar",name:"Печенье в банке",price:590,emoji:"🍪"},{id:"candle",name:"Открытка с пожеланием",price:100,emoji:"💌"}]}
  ];
  const icons = {
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
    spark:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 13.8 9.2 20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/></svg>',
    bag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/><path d="M9 13h6"/></svg>',
    person:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>',
    search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.3"/><path d="m16.2 16.2 4.3 4.3"/></svg>'
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const format = value => `${Number(value || 0).toLocaleString("ru-RU")} сом`;
  const readStorage = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const state = { page:"home", cart:readStorage(CART_KEY,[]), builder:readStorage(BUILDER_KEY,{}), builderCategory:"candies", builderSize:"S", filter:"all", search:"", toastTimer:0, installPrompt:null, favorites:new Set() };

  document.querySelectorAll("[data-icon]").forEach(node => node.innerHTML = icons[node.dataset.icon] || "");
  function saveCart(){ localStorage.setItem(CART_KEY,JSON.stringify(state.cart)); }
  function saveBuilder(){ localStorage.setItem(BUILDER_KEY,JSON.stringify(state.builder)); }
  function toast(message){ const node=$("#toast"); node.textContent=message; node.classList.add("is-visible"); clearTimeout(state.toastTimer); state.toastTimer=setTimeout(()=>node.classList.remove("is-visible"),2200); }
  function totalCart(){ return state.cart.reduce((sum,line)=>sum+line.price*line.qty,0); }
  function totalUnits(){ return state.cart.reduce((sum,line)=>sum+line.qty,0); }
  function activeSize(){ return sizeOptions.find(option=>option.id===state.builderSize)||sizeOptions[0]; }
  function builderUnits(){ return Object.values(state.builder).reduce((sum,value)=>sum+Number(value||0),0); }
  function builderGoodsTotal(){ return builderCategories.flatMap(category=>category.items).reduce((sum,item)=>sum+item.price*(state.builder[item.id]||0),0); }
  function builderTotal(){ return activeSize().price+builderGoodsTotal(); }
  function go(page){
    const target=$(`[data-page="${page}"]`); if(!target)return;
    state.page=page;
    $$(".page").forEach(view=>{const visible=view===target;view.hidden=!visible;view.classList.toggle("is-active",visible);});
    $$(".nav-item").forEach(button=>button.classList.toggle("is-active",button.dataset.go===page));
    window.scrollTo({top:0,behavior:"smooth"});
    if(page==="cart")renderCart(); if(page==="builder")renderBuilder();
  }
  function renderProducts(){
    const grid=$("#productGrid"); if(!grid)return;
    const query=state.search.trim().toLocaleLowerCase("ru");
    const visible=products.filter(product=> (state.filter==="all"||product.category===state.filter) && (!query||`${product.name} ${product.caption}`.toLocaleLowerCase("ru").includes(query)));
    grid.innerHTML=visible.map(product=>`<article class="product-card" data-product="${product.id}">
      <button class="product-card__visual${product.image?" is-photo":""}" type="button" data-details="${product.id}" aria-label="Подробнее: ${product.name}"><img src="${product.image||IMAGE}" alt="${product.name}" loading="lazy"><span class="product-size">${product.size}</span><span class="favorite-button${state.favorites.has(product.id)?" is-favorite":""}" data-favorite="${product.id}" aria-label="В избранное">${state.favorites.has(product.id)?"♥":"♡"}</span></button>
      <div class="product-card__info"><button class="product-card__name" type="button" data-details="${product.id}">${product.name}</button><p class="product-card__caption">${product.caption}</p><div class="product-card__bottom"><span class="product-card__price">${format(product.price)}</span><button class="add-button" type="button" data-add-product="${product.id}" aria-label="Добавить ${product.name}">+</button></div></div>
    </article>`).join("");
    $("#emptySearch").hidden=visible.length>0;
  }
  function renderSizeOptions(){
    $("#sizeSelector").innerHTML=sizeOptions.map(option=>`<button class="size-option${option.id===state.builderSize?" is-selected":""}" type="button" data-size="${option.id}"><strong>${option.id}</strong><small>${option.name}</small><b>${format(option.price)}</b></button>`).join("");
  }
  function renderBuilderCategories(){
    $("#builderCategories").innerHTML=builderCategories.map(category=>`<button class="builder-tab${category.id===state.builderCategory?" is-selected":""}" type="button" role="tab" aria-selected="${category.id===state.builderCategory}" data-builder-tab="${category.id}"><span>${category.icon}</span>${category.name}</button>`).join("");
  }
  function renderBuilderList(){
    const category=builderCategories.find(item=>item.id===state.builderCategory)||builderCategories[0];
    $("#builderList").innerHTML=category.items.map(item=>{const count=Number(state.builder[item.id]||0);return `<article class="builder-item"><span class="builder-item__emoji" aria-hidden="true">${item.emoji}</span><div><h3 class="builder-item__name">${item.name}</h3><span class="builder-item__price">${format(item.price)}</span></div><div class="qty-control"><button type="button" data-builder-qty="${item.id}" data-delta="-1" aria-label="Убрать ${item.name}"${count===0?" disabled":""}>−</button><span>${count}</span><button type="button" data-builder-qty="${item.id}" data-delta="1" aria-label="Добавить ${item.name}">+</button></div></article>`;}).join("");
  }
  function renderBuilder(){
    renderSizeOptions(); renderBuilderCategories(); renderBuilderList();
    const units=builderUnits(), size=activeSize(), percent=Math.min(100,Math.round(units/size.min*100));
    $("#builderItemCount").textContent=`${units} ${units===1?"позиция":units>1&&units<5?"позиции":"позиций"}`;
    $("#builderGoalText").textContent=units>=size.min?"Корзина готова к празднику":`Ещё ${size.min-units} до рекомендуемого состава`;
    $("#builderProgress").style.width=`${percent}%`;
    $("#builderTotal").textContent=format(builderTotal());
    $("#builderDockHint").textContent=`Основа ${format(size.price)} · товары ${format(builderGoodsTotal())}`;
  }
  function addProduct(productId){
    const product=products.find(item=>item.id===productId); if(!product)return;
    const existing=state.cart.find(item=>item.id===product.id);
    if(existing)existing.qty+=1;else state.cart.push({id:product.id,name:product.name,price:product.price,qty:1,image:product.image||IMAGE,details:product.caption});
    saveCart();renderCart();toast(`${product.name} добавлен в корзину`);
  }
  function addCustomBasket(){
    const units=builderUnits(); if(units===0){toast("Добавьте хотя бы один товар в корзину");return;}
    const size=activeSize(), label=`Себет ${size.id} · конструктор`;
    const composition=builderCategories.flatMap(category=>category.items.filter(item=>state.builder[item.id]).map(item=>`${item.name}${state.builder[item.id]>1?` × ${state.builder[item.id]}`:""}`)).join(", ");
    const id=`custom-${size.id.toLowerCase()}`; const existing=state.cart.find(item=>item.id===id&&item.details===composition);
    if(existing)existing.qty+=1;else state.cart.push({id:`${id}-${Date.now()}`,name:label,price:builderTotal(),qty:1,image:IMAGE,details:composition});
    state.builder={};saveBuilder();saveCart();renderCart();renderBuilder();toast("Ваш себет добавлен в корзину");go("cart");
  }
  function renderCart(){
    const target=$("#cartContents"), empty=state.cart.length===0;
    $("#cartEmpty").hidden=!empty; $("#cartCheckout").hidden=empty; $("#cartContents").hidden=empty; $(".cart-continue").hidden=empty;
    $("#cartPageCount").textContent=String(totalUnits());
    if(empty){target.innerHTML="";}else{
      target.innerHTML=`<div class="cart-list">${state.cart.map(item=>`<article class="cart-line"><div class="cart-line__image">${item.image?`<img class="${item.image===IMAGE?"":"is-photo"}" src="${item.image}" alt="" loading="lazy">`:`<span class="cart-line__emoji">🎁</span>`}</div><div><h3 class="cart-line__name">${item.name}</h3>${item.details?`<span class="cart-line__details">${item.details}</span>`:""}<span class="cart-line__price">${format(item.price*item.qty)}</span></div><div class="cart-line__actions"><button class="cart-line__remove" type="button" data-remove="${item.id}" aria-label="Удалить ${item.name}">×</button><div class="cart-line__qty"><button type="button" data-cart-qty="${item.id}" data-delta="-1" aria-label="Уменьшить количество">−</button><span>${item.qty}</span><button type="button" data-cart-qty="${item.id}" data-delta="1" aria-label="Увеличить количество">+</button></div></div></article>`).join("")}</div>`;
    }
    $("#cartSubtotal").textContent=format(totalCart()); $("#cartTotal").textContent=format(totalCart());
    const count=totalUnits(); $("#headerCartCount").textContent=count>99?"99+":String(count); $("#headerCartCount").hidden=count===0;
    $("#navCartCount").textContent=count>99?"99+":String(count); $("#navCartCount").hidden=count===0;
  }
  function openProduct(productId){
    const product=products.find(item=>item.id===productId); if(!product)return;
    $("#productDialogBody").innerHTML=`<div class="dialog-visual${product.image?" is-photo":""}"><img src="${product.image||IMAGE}" alt="${product.name}"></div><div class="dialog-copy"><p class="eyebrow">КУДА СЕБЕТ · ${product.size}</p><h2>${product.name}</h2><p>${product.description}</p><div class="composition-box"><strong>Что внутри</strong><p>${product.composition}</p></div><div class="dialog-buy"><span class="dialog-price">${format(product.price)}</span><button class="primary-button" type="button" data-add-dialog="${product.id}">В корзину <span class="button-arrow">+</span></button></div></div>`;
    $("#productDialog").showModal();
  }
  function checkout(){
    if(!state.cart.length){toast("Сначала добавьте подарок в корзину");return;}
    const lines=state.cart.map(item=>`• ${item.name} × ${item.qty} — ${format(item.price*item.qty)}${item.details?`\n  Состав: ${item.details}`:""}`);
    const message=["Здравствуйте! Хочу оформить заказ в Куда Себет:","",...lines,"",`Итого: ${format(totalCart())}`,"Подскажите, пожалуйста, по доставке в Бишкеке."].join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
  }
  function installApp(){
    if(state.installPrompt){state.installPrompt.prompt();state.installPrompt.userChoice.finally(()=>{state.installPrompt=null;});return;}
    toast(/Android/i.test(navigator.userAgent)?"Откройте меню браузера и выберите «Установить приложение»":"Добавьте страницу на главный экран из меню браузера");
  }
  function setBuilderCategory(categoryId){
    if(!builderCategories.some(category=>category.id===categoryId))return;
    state.builderCategory=categoryId;go("builder");renderBuilder();
  }

  $("#productGrid").addEventListener("click",event=>{
    const add=event.target.closest("[data-add-product]");if(add){addProduct(add.dataset.addProduct);return;}
    const favorite=event.target.closest("[data-favorite]");if(favorite){const id=favorite.dataset.favorite;state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);renderProducts();return;}
    const details=event.target.closest("[data-details]");if(details)openProduct(details.dataset.details);
  });
  $("#productFilters").addEventListener("click",event=>{const button=event.target.closest("[data-filter]");if(!button)return;state.filter=button.dataset.filter;$$('[data-filter]').forEach(item=>item.classList.toggle("is-selected",item===button));renderProducts();});
  $("#productSearch").addEventListener("input",event=>{state.search=event.target.value;renderProducts();});
  $("#builderCategories").addEventListener("click",event=>{const button=event.target.closest("[data-builder-tab]");if(!button)return;state.builderCategory=button.dataset.builderTab;renderBuilder();});
  $("#builderList").addEventListener("click",event=>{const button=event.target.closest("[data-builder-qty]");if(!button)return;const id=button.dataset.builderQty;state.builder[id]=Math.max(0,Number(state.builder[id]||0)+Number(button.dataset.delta));if(!state.builder[id])delete state.builder[id];saveBuilder();renderBuilder();});
  $("#sizeSelector").addEventListener("click",event=>{const button=event.target.closest("[data-size]");if(!button)return;state.builderSize=button.dataset.size;renderBuilder();});
  $("#cartContents").addEventListener("click",event=>{
    const remove=event.target.closest("[data-remove]");if(remove){state.cart=state.cart.filter(item=>item.id!==remove.dataset.remove);saveCart();renderCart();return;}
    const quantity=event.target.closest("[data-cart-qty]");if(quantity){const item=state.cart.find(row=>row.id===quantity.dataset.cartQty);if(item){item.qty=Math.max(0,item.qty+Number(quantity.dataset.delta));if(!item.qty)state.cart=state.cart.filter(row=>row.id!==item.id);saveCart();renderCart();}}
  });
  document.addEventListener("click",event=>{
    const goButton=event.target.closest("[data-go]");if(goButton){go(goButton.dataset.go);return;}
    const pageLink=event.target.closest("[data-page-link]");if(pageLink){if(pageLink.dataset.pageLink==="home-products"){$("#home-products").scrollIntoView({behavior:"smooth"});}else go(pageLink.dataset.pageLink);return;}
    const builder=event.target.closest("[data-builder-category]");if(builder){setBuilderCategory(builder.dataset.builderCategory);return;}
    if(event.target.closest("#cartShortcut")){go("cart");return;}
    if(event.target.closest("#heroBuilderButton")){go("builder");return;}
    if(event.target.closest("#seeAllProducts")){state.filter="all";$$('[data-filter]').forEach(button=>button.classList.toggle("is-selected",button.dataset.filter==="all"));renderProducts();$("#home-products").scrollIntoView({behavior:"smooth"});return;}
    if(event.target.closest("#deliveryInfo")){toast("Доставляем по Бишкеку · вт–вс, 10:00–20:00");return;}
    if(event.target.closest("#addCustomBasket")){addCustomBasket();return;}
    if(event.target.closest("#checkoutButton")){checkout();return;}
    if(event.target.closest("#installButton")){installApp();return;}
    const dialogAdd=event.target.closest("[data-add-dialog]");if(dialogAdd){addProduct(dialogAdd.dataset.addDialog);$("#productDialog").close();}
  });
  $("#closeProductDialog").addEventListener("click",()=>$("#productDialog").close());
  $("#productDialog").addEventListener("click",event=>{if(event.target===$("#productDialog"))$("#productDialog").close();});
  window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();state.installPrompt=event;});
  window.addEventListener("appinstalled",()=>{state.installPrompt=null;toast("Куда Себет добавлен на главный экран");});
  renderProducts();renderCart();renderBuilder();
  if("serviceWorker" in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
})();
