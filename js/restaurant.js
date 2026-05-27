// restaurant.js
const STORAGE_KEY = 'foodcourt_orders';
const COMPLETED_KEY = 'foodcourt_completed';

// ✅ AUTH GUARD
if (localStorage.getItem('adminLoggedIn') !== 'true') {
  window.location.href = 'admin-login.html';
}

// ✅ Read logged-in store (set by admin-login.js)
const loggedInStore = localStorage.getItem('loggedInStore') || 'all';
const storeNames = {
  xiaoyun: 'Small Cloud',
  goldenbowl: 'The Golden Bowl',
  wokroll: 'Wok & Roll',
  boba: 'The Boba Shop',
  greenbowl: 'Green Bowl Co.',
  all: 'All Stalls'
};
const currentStoreName = storeNames[loggedInStore] || 'All Stalls';

// Dynamic UI updates
document.title = `${currentStoreName} Control Panel`;
const pageTitle = document.querySelector('.page-title');
if (pageTitle) pageTitle.textContent = `${currentStoreName} Live Orders`;
const pageSub = document.querySelector('.page-sub');
if (pageSub) pageSub.innerHTML = `Restaurant Control Panel<br>Manage incoming orders for <strong>${currentStoreName}</strong> in real time.`;

let orders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let completedCount = parseInt(localStorage.getItem(COMPLETED_KEY)) || 0;

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  localStorage.setItem(COMPLETED_KEY, completedCount.toString());
}

function normalizeOrder(order) {
  const statusMap = { ordered: 'new', pending: 'new', confirmed: 'preparing' };
  let status = statusMap[order.status] || order.status || 'new';
  let itemsText = order.items;
  if (Array.isArray(order.items)) {
    itemsText = order.items.map(i => `${i.quantity || 1}x ${i.name}`).join(', ');
  }
  return {
    id: order.id || 'ORD-' + Date.now().toString().slice(-6),
    table: order.table || 'Kiosk',
    items: itemsText,
    time: order.time || order.orderDate || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    status: status,
    customer: order.customer || {},
    restaurant: order.restaurant || order.stall || ''
  };
}

function renderOrders() {
  const normalized = orders.map(normalizeOrder);

  ['new', 'preparing', 'ready'].forEach(status => {
    const container = document.getElementById(`col-${status}`);
    if(!container) return;
    container.innerHTML = '';
    
    // ✅ FILTER by status AND store
    const filtered = normalized.filter(o => {
      const matchesStatus = o.status === status;
      const matchesStore = loggedInStore === 'all' || 
                           o.restaurant === currentStoreName || 
                           o.stall === currentStoreName;
      return matchesStatus && matchesStore;
    });
    
    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-col"><i class="fas fa-clipboard-list"></i>No orders in this stage</div>`;
    } else {
      filtered.forEach(order => { container.innerHTML += createOrderCard(order); });
    }
    updateCounts();
  });
}

function createOrderCard(order) {
  let actions = '';
  if (order.status === 'new') {
    actions = `<button class="btn btn-primary" onclick="updateStatus('${order.id}', 'preparing')">Start Preparing</button>`;
  } else if (order.status === 'preparing') {
    actions = `<button class="btn btn-secondary" onclick="updateStatus('${order.id}', 'ready')">Mark Ready</button>`;
  } else if (order.status === 'ready') {
    actions = `<button class="btn btn-done" onclick="updateStatus('${order.id}', 'completed')">Complete</button>`;
  }

  return `
    <div class="order-card">
      <div class="order-card-top">
        <span class="order-id">${order.id}</span>
        <span class="order-table">${order.table}</span>
      </div>
      <div class="order-items"><strong>${order.items}</strong></div>
      <div class="order-time">Placed: ${order.time}</div>
      <div class="card-actions">${actions}</div>
    </div>
  `;
}

function updateStatus(orderId, newStatus) {
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return;
  
  orders[idx].status = newStatus;
  if (newStatus === 'completed') {
    completedCount++;
    orders.splice(idx, 1);
    const el = document.getElementById('count-completed');
    if(el) el.textContent = completedCount;
  }
  
  saveToStorage();
  renderOrders();
  showToast(`Order ${orderId} → ${newStatus.toUpperCase()}`);
}

function updateCounts() {
  const normalized = orders.map(normalizeOrder);
  const storeFiltered = normalized.filter(o => 
    loggedInStore === 'all' || o.restaurant === currentStoreName || o.stall === currentStoreName
  );

  const counts = {
    new: storeFiltered.filter(o => o.status === 'new').length,
    preparing: storeFiltered.filter(o => o.status === 'preparing').length,
    ready: storeFiltered.filter(o => o.status === 'ready').length
  };

  Object.keys(counts).forEach(s => {
    const c = document.getElementById(`count-${s}`);
    const b = document.getElementById(`badge-${s}`);
    if(c) c.textContent = counts[s];
    if(b) b.textContent = counts[s];
  });
  const comp = document.getElementById('count-completed');
  if(comp) comp.textContent = completedCount;
}

function showToast(message) {
  const t = document.getElementById('toast');
  if(t) {
    t.textContent = message;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
}

// 🔔 Auto-sync across tabs
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    orders = JSON.parse(e.newValue) || [];
    renderOrders();
  }
  if (e.key === COMPLETED_KEY) {
    completedCount = parseInt(e.newValue) || 0;
    const el = document.getElementById('count-completed');
    if(el) el.textContent = completedCount;
  }
});

// 🚪 Logout
window.logout = () => {
  if(confirm("Logout?")) {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('loggedInStore');
    window.location.href = 'admin-login.html';
  }
};

renderOrders();