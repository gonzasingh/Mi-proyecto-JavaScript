/* =========================
   DATA (productos demo)
========================= */
const PRODUCTS = [
  {
    id: "p1",
    name: "Phone Holder Sakti",
    price: 29.90,
    category: "Phone",
    tag: "Other",
    rating: 5.0,
    reviews: "1.2k Reviews",
    emoji: "📱",
    flags: ["best"]
  },
  {
    id: "p2",
    name: "Headsound",
    price: 12.00,
    category: "Music",
    tag: "Music",
    rating: 5.0,
    reviews: "1.2k Reviews",
    emoji: "🎧",
    flags: ["new"]
  },
  {
    id: "p3",
    name: "Adudu Cleaner",
    price: 29.90,
    category: "Home",
    tag: "Other",
    rating: 4.4,
    reviews: "1k Reviews",
    emoji: "🧼",
    flags: ["off"]
  },
  {
    id: "p4",
    name: "CCTV Maling",
    price: 50.00,
    category: "Home",
    tag: "Home",
    rating: 4.8,
    reviews: "120 Reviews",
    emoji: "📷",
    flags: ["best"]
  },
  {
    id: "p5",
    name: "Stuffsus Peker 32",
    price: 9.90,
    category: "Storage",
    tag: "Other",
    rating: 5.0,
    reviews: "1.2k Reviews",
    emoji: "🫙",
    flags: ["new"]
  },
  {
    id: "p6",
    name: "Stuffsus R175",
    price: 34.10,
    category: "Music",
    tag: "Music",
    rating: 4.8,
    reviews: "2.4k Reviews",
    emoji: "🎶",
    flags: ["best", "off"]
  },
  // Extras para que la paginación tenga sentido
  { id:"p7", name:"TWS Bujug", price:29.90, category:"Music", tag:"Other", rating:5.0, reviews:"1.2k Reviews", emoji:"🎧", flags:["new"] },
  { id:"p8", name:"Headsound Baptis", price:12.00, category:"Music", tag:"Music", rating:5.0, reviews:"1.2k Reviews", emoji:"🎧", flags:["best"] },
  { id:"p9", name:"Mini Vacuum", price:18.50, category:"Home", tag:"Other", rating:4.6, reviews:"540 Reviews", emoji:"🌀", flags:[] },
  { id:"p10", name:"Phone Case Ultra", price:14.25, category:"Phone", tag:"Other", rating:4.7, reviews:"880 Reviews", emoji:"📱", flags:["off"] },
  { id:"p11", name:"SSD Pocket 1TB", price:79.00, category:"Storage", tag:"Other", rating:4.9, reviews:"2.1k Reviews", emoji:"💾", flags:["best"] },
  { id:"p12", name:"Cable Organizer", price:6.50, category:"Home", tag:"Home", rating:4.5, reviews:"300 Reviews", emoji:"🧷", flags:[] }
];

/* =========================
   STATE (filtros / paginación)
========================= */
const state = {
  cat: "All",
  filter: null, // new | best | off | null
  q: "",
  sort: "featured",
  page: 1,
  perPage: 6,
  recIndex: 0
};

/* =========================
   CART (con localStorage)
========================= */
const CART_KEY = "stuffsus_cart_v1";
let cart = loadCart(); // { [id]: qty }

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* Helpers */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function money(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function getProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

/* =========================
   FILTER + SORT + PAGINATE
========================= */
function applyFilters() {
  let items = [...PRODUCTS];

  // categoría
  if (state.cat !== "All") {
    items = items.filter(p => p.category === state.cat);
  }

  // flags (new/best/off)
  if (state.filter) {
    items = items.filter(p => p.flags.includes(state.filter));
  }

  // búsqueda
  if (state.q.trim()) {
    const q = state.q.trim().toLowerCase();
    items = items.filter(p =>
      (p.name.toLowerCase().includes(q)) ||
      (p.category.toLowerCase().includes(q)) ||
      (p.tag.toLowerCase().includes(q))
    );
  }

  // sort
  switch (state.sort) {
    case "price-asc":
      items.sort((a,b) => a.price - b.price);
      break;
    case "price-desc":
      items.sort((a,b) => b.price - a.price);
      break;
    case "rating-desc":
      items.sort((a,b) => b.rating - a.rating);
      break;
    default:
      // featured: best primero, luego new, luego normal
      items.sort((a,b) => scoreFeatured(b) - scoreFeatured(a));
  }

  return items;
}

function scoreFeatured(p) {
  let s = 0;
  if (p.flags.includes("best")) s += 3;
  if (p.flags.includes("new")) s += 2;
  if (p.flags.includes("off")) s += 1;
  s += p.rating / 5;
  return s;
}

function paginate(items) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / state.perPage));
  state.page = Math.min(state.page, pages);

  const start = (state.page - 1) * state.perPage;
  const end = start + state.perPage;
  return {
    pageItems: items.slice(start, end),
    total,
    pages
  };
}

/* =========================
   RENDER: PRODUCT GRID
========================= */
function renderGrid() {
  const grid = $("#grid");
  const info = $("#resultsInfo");

  const filtered = applyFilters();
  const { pageItems, total, pages } = paginate(filtered);

  info.textContent = `Mostrando ${pageItems.length} de ${total} productos`;

  grid.innerHTML = pageItems.map(p => `
    <article class="card">
      <div class="card__top">
        <span class="tag">${escapeHtml(p.tag)}</span>
        <span class="muted" title="${escapeHtml(p.category)}">${escapeHtml(p.category)}</span>
      </div>

      <div class="img" aria-label="Imagen producto">${p.emoji}</div>

      <h3 class="card__title">${escapeHtml(p.name)}</h3>

      <div class="card__meta">
        <div class="rating">
          <span class="star">★</span>
          <span>${p.rating.toFixed(1)}</span>
          <span class="muted">(${escapeHtml(p.reviews)})</span>
        </div>
        <div class="price">${money(p.price)}</div>
      </div>

      <div class="card__actions">
        <button class="btn btn--ghost" data-add="${p.id}">Add to Chart</button>
        <button class="btn btn--dark" data-buy="${p.id}">Buy Now</button>
      </div>
    </article>
  `).join("");

  renderPager(pages);
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   PAGER
========================= */
function renderPager(pages) {
  const nums = $("#pagerNums");
  nums.innerHTML = "";

  // mostramos hasta 7 botones, tipo “1 2 3 … 9 10”
  const maxButtons = 7;
  const current = state.page;

  const pushNum = (n) => {
    const btn = document.createElement("button");
    btn.className = "pnum" + (n === current ? " is-active" : "");
    btn.textContent = n;
    btn.addEventListener("click", () => {
      state.page = n;
      renderGrid();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    nums.appendChild(btn);
  };

  if (pages <= maxButtons) {
    for (let i=1; i<=pages; i++) pushNum(i);
    return;
  }

  const showLeft = Math.max(1, current - 2);
  const showRight = Math.min(pages, current + 2);

  pushNum(1);

  if (showLeft > 2) {
    nums.appendChild(ellipsis());
  }

  for (let i = showLeft; i <= showRight; i++) {
    if (i !== 1 && i !== pages) pushNum(i);
  }

  if (showRight < pages - 1) {
    nums.appendChild(ellipsis());
  }

  if (pages !== 1) pushNum(pages);
}

function ellipsis(){
  const span = document.createElement("span");
  span.className = "muted";
  span.textContent = "…";
  span.style.padding = "0 6px";
  return span;
}

/* =========================
   RECOMMENDATIONS (carrusel simple)
========================= */
function renderRecs() {
  const row = $("#recRow");

  // elegimos algunos productos destacados
  const recs = PRODUCTS
    .filter(p => p.flags.includes("best") || p.flags.includes("new"))
    .slice(0, 8);

  // “ventana” de 3
  const start = state.recIndex;
  const view = recs.slice(start, start + 3);

  row.innerHTML = view.map(p => `
    <div class="recitem">
      <div class="card__top">
        <span class="tag">${escapeHtml(p.tag)}</span>
        <span class="muted">${escapeHtml(p.category)}</span>
      </div>
      <div class="img">${p.emoji}</div>
      <h4>${escapeHtml(p.name)}</h4>
      <div class="card__meta">
        <div class="rating"><span class="star">★</span><span>${p.rating.toFixed(1)}</span></div>
        <div class="price">${money(p.price)}</div>
      </div>
      <div class="card__actions" style="margin-top:10px">
        <button class="btn btn--ghost" data-add="${p.id}">Add to Chart</button>
        <button class="btn btn--dark" data-buy="${p.id}">Buy Now</button>
      </div>
    </div>
  `).join("");

  // guardar recs para navegación
  renderRecs._recs = recs;
}

/* =========================
   CART ACTIONS
========================= */
function addToCart(id, qty=1) {
  cart[id] = (cart[id] || 0) + qty;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  updateCartUI();
}

function setQty(id, qty) {
  if (qty <= 0) {
    delete cart[id];
  } else {
    cart[id] = qty;
  }
  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = {};
  saveCart();
  updateCartUI();
}

function cartCount() {
  return Object.values(cart).reduce((a,b) => a + b, 0);
}

function cartSubtotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = getProduct(id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function updateCartUI() {
  $("#cartCount").textContent = cartCount();
  $("#pillAll").textContent = PRODUCTS.length; // contador demo

  const itemsWrap = $("#cartItems");
  const entries = Object.entries(cart);

  $("#cartSubtitle").textContent = `${cartCount()} items`;

  if (entries.length === 0) {
    itemsWrap.innerHTML = `
      <div class="muted" style="padding:10px 2px; line-height:1.5">
        Tu carrito está vacío.<br/>
        Probá tocar <strong>Add to Chart</strong> en cualquier producto.
      </div>
    `;
  } else {
    itemsWrap.innerHTML = entries.map(([id, qty]) => {
      const p = getProduct(id);
      if (!p) return "";
      const line = p.price * qty;

      return `
        <div class="cart__item">
          <div class="cart__thumb">${p.emoji}</div>
          <div>
            <p class="cart__name">${escapeHtml(p.name)}</p>
            <div class="cart__small">${escapeHtml(p.category)} · ${money(p.price)} c/u</div>

            <div class="cart__controls">
              <div class="qty">
                <button data-dec="${p.id}" aria-label="Restar">−</button>
                <span>${qty}</span>
                <button data-inc="${p.id}" aria-label="Sumar">+</button>
              </div>
              <div>
                <strong>${money(line)}</strong>
                <button class="remove" data-rm="${p.id}">Remove</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  const sub = cartSubtotal();
  $("#subtotal").textContent = money(sub);
  $("#total").textContent = money(sub); // envío gratis
}

/* =========================
   OPEN/CLOSE CART
========================= */
function openCart() {
  $("#overlay").hidden = false;
  $("#cart").classList.add("is-open");
}
function closeCart() {
  $("#overlay").hidden = true;
  $("#cart").classList.remove("is-open");
}

/* =========================
   EVENTS
========================= */
function wireEvents() {
  // grid (delegación)
  $("#grid").addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    const buy = e.target.closest("[data-buy]");

    if (add) {
      addToCart(add.dataset.add, 1);
    }
    if (buy) {
      addToCart(buy.dataset.buy, 1);
      openCart();
    }
  });

  // recs (delegación)
  $("#recRow").addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    const buy = e.target.closest("[data-buy]");
    if (add) addToCart(add.dataset.add, 1);
    if (buy) { addToCart(buy.dataset.buy, 1); openCart(); }
  });

  // sidebar categorías
  $$(".sideitem").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".sideitem").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.cat = btn.dataset.cat;
      state.page = 1;
      renderGrid();
    });
  });

  // filtros (new/best/off)
  $$(".filter").forEach(btn => {
    const f = btn.dataset.filter;
    if (!f) return;

    btn.addEventListener("click", () => {
      // toggle
      const active = btn.classList.toggle("is-active");
      $$(".filter").forEach(b => { if (b !== btn) b.classList.remove("is-active"); });
      state.filter = active ? f : null;
      state.page = 1;
      renderGrid();
    });
  });

  $("#clearFilters").addEventListener("click", () => {
    state.filter = null;
    $$(".filter").forEach(b => b.classList.remove("is-active"));
    renderGrid();
  });

  // sort
  $("#sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    state.page = 1;
    renderGrid();
  });

  // búsqueda
  $("#btnDoSearch").addEventListener("click", () => doSearch());
  $("#q").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });
  function doSearch() {
    state.q = $("#q").value;
    state.page = 1;
    renderGrid();
  }

  // paginación
  $("#prevPage").addEventListener("click", () => {
    state.page = Math.max(1, state.page - 1);
    renderGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  $("#nextPage").addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(applyFilters().length / state.perPage));
    state.page = Math.min(totalPages, state.page + 1);
    renderGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // carrito open/close
  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);

  // acciones del carrito (delegación)
  $("#cartItems").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rm  = e.target.closest("[data-rm]");

    if (inc) addToCart(inc.dataset.inc, 1);
    if (dec) addToCart(dec.dataset.dec, -1);
    if (rm)  setQty(rm.dataset.rm, 0);
  });

  $("#clearCart").addEventListener("click", () => clearCart());

  $("#checkout").addEventListener("click", () => {
    const count = cartCount();
    if (!count) return alert("Tu carrito está vacío 🙂");
    alert(`Checkout demo ✅\n\nItems: ${count}\nTotal: ${money(cartSubtotal())}`);
  });

  // recommendations arrows
  $("#recPrev").addEventListener("click", () => {
    const recs = renderRecs._recs || [];
    state.recIndex = Math.max(0, state.recIndex - 1);
    if (state.recIndex > recs.length - 3) state.recIndex = Math.max(0, recs.length - 3);
    renderRecs();
  });
  $("#recNext").addEventListener("click", () => {
    const recs = renderRecs._recs || [];
    state.recIndex = Math.min(Math.max(0, recs.length - 3), state.recIndex + 1);
    renderRecs();
  });

  // newsletter demo
  $("#btnSend").addEventListener("click", () => {
    const email = $("#email").value.trim();
    if (!email) return alert("Ingresá un email 🙂");
    alert(`Gracias! Te suscribiste con: ${email}`);
    $("#email").value = "";
  });

  // menú móvil
  $("#hamb").addEventListener("click", () => {
    const mm = $("#mobilemenu");
    mm.hidden = !mm.hidden;
  });
}

/* =========================
   INIT
========================= */
function init() {
  // contador de “All Product”
  $("#pillAll").textContent = PRODUCTS.length;

  updateCartUI();
  renderGrid();
  renderRecs();
  wireEvents();
}

init();
