// ----- Dados dos produtos (exemplo) -----
const PRODUCTS = [
  { id: 1,  name: "Teclado Mecânico RGB",  price: 250,  image: "imagens/teclado.jpg",  cat: "perifericos" },
  { id: 2,  name: "Mouse Gamer 12K DPI",  price: 150,  image: "imagens/mouse.png",  cat: "perifericos" },
  { id: 3,  name: "Headset Surround",     price: 200,  image: "imagens/headset.jpg",  cat: "audio" },
  { id: 4,  name: "Monitor 27\" 144Hz",    price: 1200, image: "imagens/monitor.jpg",  cat: "video" },
  { id: 5,  name: "Cadeira Gamer Pro",     price: 900,  image: "imagens/cadeira.jpg",  cat: "acessorios" },
  { id: 6,  name: "Controle NextGen",      price: 350,  image: "imagens/controle.jpg",  cat: "consoles" },
  { id: 7,  name: "Placa de Vídeo X",      price: 2500, image: "imagens/placa.jpg",  cat: "video" },
  { id: 8,  name: "Microfone USB Studio",  price: 400,  image: "imagens/microfone.jpg",  cat: "audio" },
  { id: 9,  name: "Mousepad XL RGB",       price: 120,  image: "imagens/mousepad.jpg",  cat: "perifericos" },
  { id: 10, name: "Webcam Full HD 60fps",  price: 300,  image: "imagens/webcam.jpg", cat: "acessorios" },
];

// ----- Estado -----
const CART_KEY = "pixelStoreCart";
let cart = loadCart(); // [{id, qty}]

// ----- Util -----
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const byId = (id) => document.getElementById(id);

// ----- Render de produtos -----
const productsGrid = byId("productsGrid");
const searchInput = byId("searchInput");
const categorySelect = byId("categorySelect");

function renderProducts() {
  const term = (searchInput.value || "").toLowerCase();
  const cat = categorySelect.value;

  const filtered = PRODUCTS.filter(p => {
    const matchText = p.name.toLowerCase().includes(term);
    const matchCat  = (cat === "todas") ? true : p.cat === cat;
    return matchText && matchCat;
  });

  productsGrid.innerHTML = filtered.map(p => `
    <article class="card" data-id="${p.id}">
      <img class="card-img" src="${p.image}" alt="${p.name}">
      <div class="card-body">
        <h3>${p.name}</h3>
        <div class="row">
          <span class="price">${brl(p.price)}</span>
          <button class="btn add" data-id="${p.id}">Adicionar</button>
        </div>
      </div>
    </article>
  `).join("");

  // bind adds
  productsGrid.querySelectorAll(".btn.add").forEach(btn => {
    btn.addEventListener("click", () => addToCart(parseInt(btn.dataset.id,10)));
  });
}

// ----- Carrinho: persistência -----
function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

// ----- Carrinho: operações -----
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  updateCartUI();
  openCart();
}
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); updateCartUI(); }
}
function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

// ----- Carrinho: UI -----
const cartDrawer = byId("cartDrawer");
const backdrop   = byId("backdrop");
const cartItems  = byId("cartItems");
const cartTotal  = byId("cartTotal");
const cartCount  = byId("cartCount");
const cartButton = byId("cartButton");
const closeCartBtn = byId("closeCart");
const checkoutBtn = byId("checkoutBtn");
const clearCartBtn = byId("clearCartBtn");

function updateCartUI() {
  // contador
  const count = cart.reduce((acc, i) => acc + i.qty, 0);
  cartCount.textContent = count;

  // itens
  if (cart.length === 0) {
    cartItems.innerHTML = `<p style="color:#bdbdbd; padding: 16px;">Seu carrinho está vazio.</p>`;
    cartTotal.textContent = brl(0);
    return;
  }

  const rows = cart.map(({id, qty}) => {
    const p = PRODUCTS.find(x => x.id === id);
    const subtotal = p.price * qty;
    return `
      <div class="cart-item" data-id="${id}">
        <img src="${p.image}" alt="${p.name}">
        <div>
          <h4>${p.name}</h4>
          <div class="qty">
            <button aria-label="Diminuir" data-action="dec">−</button>
            <span>${qty}</span>
            <button aria-label="Aumentar" data-action="inc">+</button>
          </div>
          <button class="remove" data-action="remove">Remover</button>
        </div>
        <strong>${brl(subtotal)}</strong>
      </div>
    `;
  }).join("");

  cartItems.innerHTML = rows;

  // bind qty/remove
  cartItems.querySelectorAll(".cart-item").forEach(row => {
    const id = parseInt(row.dataset.id,10);
    row.querySelector('[data-action="dec"]').addEventListener("click", () => changeQty(id, -1));
    row.querySelector('[data-action="inc"]').addEventListener("click", () => changeQty(id, +1));
    row.querySelector('[data-action="remove"]').addEventListener("click", () => removeFromCart(id));
  });

  // total
  const total = cart.reduce((acc, i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return acc + p.price * i.qty;
  }, 0);
  cartTotal.textContent = brl(total);
}

function openCart() {
  cartDrawer.classList.add("open");
  backdrop.classList.add("show");
  cartDrawer.setAttribute("aria-hidden", "false");
  backdrop.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  backdrop.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden", "true");
  backdrop.setAttribute("aria-hidden", "true");
}

// ----- Eventos -----
searchInput.addEventListener("input", renderProducts);
categorySelect.addEventListener("change", renderProducts);
cartButton.addEventListener("click", () => openCart());
closeCartBtn.addEventListener("click", () => closeCart());
backdrop.addEventListener("click", () => closeCart());
checkoutBtn.addEventListener("click", () => {
  if (!cart.length) return alert("Seu carrinho está vazio.");
  alert("Checkout de demonstração 😊\nIntegre Pix/Cartão depois.");
});
clearCartBtn.addEventListener("click", clearCart);

// ----- Init -----
renderProducts();
updateCartUI();
