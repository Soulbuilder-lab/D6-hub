document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const stallId = urlParams.get('stall') || '1';
  const stallNameEl = document.getElementById('stallName');
  const menuGrid = document.getElementById('menuGrid');
  const cartBadge = document.getElementById('cartBadge');
  
  const menus = {
    '3': { name: 'Wok & Roll', items: [
      { id: 301, name: 'Kung Pao Chicken', desc: 'Spicy diced chicken with peanuts', price: 16 },
      { id: 302, name: 'Vegetable Spring Rolls', desc: 'Crispy rolls with sweet chili', price: 9 }
    ]},
    '4': { name: 'The Boba Shop', items: [
      { id: 401, name: 'Taro Milk Tea', desc: 'Creamy taro with boba pearls', price: 6 },
      { id: 402, name: 'Matcha Latte', desc: 'Premium matcha with oat milk', price: 7 }
    ]},
    '5': { name: 'Green Bowl Co.', items: [
      { id: 501, name: 'Quinoa Power Bowl', desc: 'Quinoa, avocado, chickpeas', price: 14 },
      { id: 502, name: 'Green Smoothie', desc: 'Spinach, banana, almond milk', price: 8 }
    ]}
  };

  const currentStall = menus[stallId] || menus['1'];
  if (stallNameEl) stallNameEl.textContent = currentStall.name;

  // ✅ SYNC: Unified cart key for Xiaoyun compatibility
  const getCart = () => JSON.parse(localStorage.getItem('myCart') || localStorage.getItem('cart')) || [];
  const saveCart = (c) => {
    localStorage.setItem('myCart', JSON.stringify(c));
    localStorage.setItem('cart', JSON.stringify(c)); // Keep backward compatibility
  };

  const updateBadge = () => {
    const cart = getCart();
    if (cartBadge) cartBadge.textContent = cart.reduce((s, i) => s + (i.qty || i.quantity), 0);
  };

  currentStall.items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-item-card';
    // ✅ Fixed broken template literal syntax from upload
    card.innerHTML = `
      <div class="item-img"><i class="fas fa-utensils"></i></div>
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.desc}</div>
        <div class="item-footer">
          <span class="item-price">$${item.price.toFixed(2)}</span>
          <button class="add-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">+</button>
        </div>
      </div>`;
    menuGrid.appendChild(card);
  });

  updateBadge();

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const name = e.target.dataset.name;
      const price = parseFloat(e.target.dataset.price);
      const cart = getCart();
      const existing = cart.find(i => i.id === id && i.stall === currentStall.name);
      if (existing) existing.quantity++;
      else cart.push({ id, name, price, stall: currentStall.name, quantity: 1 });
      saveCart(cart);
      updateBadge();
      
      const orig = e.target.innerHTML;
      e.target.innerHTML = '<i class="fas fa-check"></i>';
      e.target.style.background = '#2a9d8f';
      setTimeout(() => { e.target.innerHTML = orig; e.target.style.background = ''; }, 800);
    });
  });
});