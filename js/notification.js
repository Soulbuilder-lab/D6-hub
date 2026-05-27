document.addEventListener('DOMContentLoaded', () => {
const notifList = document.getElementById('notifList');

// ✅ FOOD COURT SYNC: Fetch all active orders from shared store
function getActiveOrders() {
  const all = JSON.parse(localStorage.getItem('foodcourt_orders')) || [];
  return all.filter(o => !['completed', 'collected', 'cancelled'].includes(o.status));
}

let activeOrders = getActiveOrders();
let lastStatuses = {}; // Tracks status per order ID
let notifiedReady = new Set(); // Prevents duplicate ready popups

// Initialize tracking
activeOrders.forEach(o => lastStatuses[o.id] = o.status);

// ── Status display config (UNTOUCHED) ────────────────────────────────────
const statusConfig = {
ordered: { label: 'Order Confirmed', icon: 'fa-clock', color: '#3949ab', bg: '#e8eaf6', progress: 10, message: 'Your order has been received. The restaurant will start preparing soon.' },
preparing: { label: 'Being Prepared', icon: 'fa-fire-burner', color: '#f4a261', bg: '#fff3e8', progress: 55, message: 'The kitchen is preparing your order now. Hang tight!' },
ready: { label: 'Ready for Pickup!', icon: 'fa-check-circle', color: '#2a9d8f', bg: '#e0f4f1', progress: 100, message: 'Your order is ready! Please collect it from the counter.' },
};

// ── Render ALL active orders (UPDATED for multi-order) ───────────────────
function renderAll() {
  if (!notifList) return;
  notifList.innerHTML = '';
  activeOrders = getActiveOrders();

  if (activeOrders.length === 0) {
    notifList.innerHTML = `<p style="color:#8c8c8c; text-align:center; padding:30px;">No active orders. <a href="index.html" style="color:#f4a261;">Start ordering</a></p>`;
    return;
  }

  activeOrders.forEach(order => {
    const cfg = statusConfig[order.status] || statusConfig.ordered;
    const card = document.createElement('div');
    card.className = 'notif-card';
    card.id = `card-${order.id}`;
    card.style.borderLeft = `4px solid ${cfg.color}`;

    // Handle both array items (Xiaoyun) and string items (other stalls)
    const itemsText = Array.isArray(order.items)
      ? order.items.map(i => `${i.quantity || 1}x ${i.name}`).join(', ')
      : order.items || order.itemDetails || '-';

    card.innerHTML = `
      <div style="flex:1;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="margin:0; font-size:1.1rem; color:#2d2d2d;">
            <i class="fas ${cfg.icon}" style="margin-right:8px; color:${cfg.color};"></i>
            Order #${order.id}
          </h4>
          <span style="font-size:0.8rem; color:#8c8c8c;">Table: ${order.table || 'Kiosk'}</span>
        </div>
        <p style="color:#2d2d2d; font-weight:500; margin-bottom:4px;">${order.restaurant || order.stall || 'Food Court'}</p>
        <p style="color:#8c8c8c; font-size:0.9rem; margin-bottom:12px;">${itemsText}</p>
        <div style="background:#f0f0f0; height:6px; border-radius:3px; overflow:hidden;">
          <div style="width:${cfg.progress}%; background:${cfg.color}; height:100%; transition:width 0.8s ease;"></div>
        </div>
        <p style="font-size:0.8rem; color:#8c8c8c; margin-top:4px; text-align:right;">${cfg.progress}% Complete</p>
        <div style="margin-top:10px; padding:10px 12px; background:${cfg.bg}; border-radius:8px; font-size:0.85rem; color:${cfg.color};">${cfg.message}</div>
      </div>
      <div style="text-align:right; min-width:90px; margin-left:16px;">
        <span style="display:block; font-weight:700; color:${cfg.color}; font-size:0.95rem;">${cfg.label}</span>
        ${order.status === 'ready' ? `<button onclick="collectOrder('${order.id}')" style="margin-top:10px; padding:6px 12px; background:#2a9d8f; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:600;">Pick Up</button>` : ''}
      </div>`;
    notifList.appendChild(card);
  });
}

// ── Ready popup (UNTOUCHED) ──────────────────────────────────────────────
function showReadyPopup(order) {
  const existing = document.getElementById('readyPopup');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'readyPopup';
  overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:1000; animation:fadeIn 0.3s ease;';
  overlay.innerHTML = `
    <div style="background:white; border-radius:16px; padding:32px 28px; max-width:340px; width:90%; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.15); animation:slideUp 0.3s ease;">
      <div style="width:64px; height:64px; background:#e0f4f1; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;"><i class="fas fa-bag-shopping" style="font-size:1.8rem; color:#2a9d8f;"></i></div>
      <h3 style="margin:0 0 8px; font-size:1.2rem; color:#2d2d2d;">Order Ready!</h3>
      <p style="color:#8c8c8c; font-size:0.9rem; margin-bottom:6px;">Order <strong style="color:#2d2d2d;">#${order.id}</strong> from <strong style="color:#2d2d2d;">${order.restaurant || order.stall || 'Restaurant'}</strong></p>
      <p style="color:#8c8c8c; font-size:0.85rem; margin-bottom:20px;">Please proceed to the counter to collect your order.</p>
      <button onclick="collectOrder('${order.id}')" style="width:100%; padding:12px; background:#2a9d8f; color:white; border:none; border-radius:8px; font-size:0.95rem; font-weight:600; cursor:pointer; margin-bottom:10px;"><i class="fas fa-check" style="margin-right:6px;"></i> Got it, picking up!</button>
      <button onclick="document.getElementById('readyPopup').remove()" style="width:100%; padding:10px; background:transparent; color:#8c8c8c; border:1px solid #e0e0e0; border-radius:8px; font-size:0.85rem; cursor:pointer;">Dismiss</button>
    </div>
    <style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}</style>`;
  document.body.appendChild(overlay);
  setTimeout(() => { document.getElementById('readyPopup')?.remove(); }, 30000);
}

// ── Poll localStorage every 3 seconds for status changes ─────
setInterval(() => {
  const freshOrders = getActiveOrders();
  const freshIds = new Set(freshOrders.map(o => o.id));
  const oldIds = new Set(activeOrders.map(o => o.id));

  // Detect new/removed orders
  if (freshIds.size !== oldIds.size || ![...oldIds].every(id => freshIds.has(id))) {
    renderAll();
    // Update tracking
    freshOrders.forEach(o => {
      lastStatuses[o.id] = o.status;
      if (o.status === 'ready' && !notifiedReady.has(o.id)) {
        notifiedReady.add(o.id);
        showReadyPopup(o);
      }
    });
    return;
  }

  // Detect status changes on existing orders
  let statusChanged = false;
  freshOrders.forEach(fresh => {
    const prev = lastStatuses[fresh.id] || fresh.status;
    if (fresh.status !== prev) {
      lastStatuses[fresh.id] = fresh.status;
      statusChanged = true;
      if (fresh.status === 'ready' && !notifiedReady.has(fresh.id)) {
        notifiedReady.add(fresh.id);
        showReadyPopup(fresh);
      }
    }
  });
  if (statusChanged) renderAll();
  activeOrders = freshOrders;
}, 3000);

renderAll();

// ── Collect order (UPDATED for multi-order) ──────────────────────────────
window.collectOrder = (id) => {
  document.getElementById('readyPopup')?.remove();
  
  // Mark only this order as completed in shared store
  const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || [];
  const idx = allOrders.findIndex(o => o.id == id);
  if (idx > -1) {
    allOrders[idx].status = 'completed';
    localStorage.setItem('foodcourt_orders', JSON.stringify(allOrders));
  }
  
  lastStatuses[id] = 'completed';
  notifiedReady.delete(id);
  renderAll(); // Auto-removes completed order from UI
};
});