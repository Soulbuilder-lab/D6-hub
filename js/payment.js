document.addEventListener('DOMContentLoaded', () => {
  const orderItemsEl = document.getElementById('orderItems');
  const subtotalEl   = document.getElementById('subtotal');
  const taxEl        = document.getElementById('tax');
  const totalEl      = document.getElementById('total');
  const payTableEl   = document.getElementById('payTable');
  const completeBtn  = document.getElementById('completeBtn');
  
  const cart  = JSON.parse(localStorage.getItem('myCart') || localStorage.getItem('cart')) || [];
  const table = localStorage.getItem('tableNumber') || '--';
  
  if (payTableEl) payTableEl.textContent = table;
  
  if (cart.length === 0) {
    if (orderItemsEl) orderItemsEl.innerHTML = '<p style="color:#a0a0a0;">No items selected. <a href="index.html" style="color:#d4af37;">Go back</a></p>';
    if (completeBtn) { completeBtn.disabled = true; completeBtn.style.opacity = '0.5'; }
    return;
  }

  let subtotal = 0;
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'order-row';
    // ✅ Fixed broken template literal syntax
    row.innerHTML = `<span>${item.name} <small style="color:#a0a0a0;">(x${item.qty || item.quantity}) - ${item.stall}</small></span> <span>$${(item.price * (item.qty || item.quantity)).toFixed(2)}</span>`;
    if (orderItemsEl) orderItemsEl.appendChild(row);
    subtotal += item.price * (item.qty || item.quantity);
  });

  const serviceFee = 2.50;
  const tax   = subtotal * 0.08;
  const total = subtotal + serviceFee + tax;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl)      taxEl.textContent      = `$${tax.toFixed(2)}`;
  if (totalEl)    totalEl.textContent    = `$${total.toFixed(2)}`;

  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      if (!table || table === '--') {
        alert('⚠️ Please scan your table QR code first.');
        window.location.href = 'index.html';
        return;
      }

      // Build order in the structure notification.js and restaurant.js both expect
      const newOrder = {
        id:     String(Math.floor(Math.random() * 9000) + 1000),
        stall:  [...new Set(cart.map(i => i.stall))].join(' & '),
        items:  cart.map(i => `${i.name} x${i.qty || i.quantity}`).join(', '),
        status: 'ordered',
        table:  table,
        time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        total:  total.toFixed(2),
        createdAt: new Date().toISOString()
      };

      // ── localStorage bridge (removed when Node.js is ready) ──
      localStorage.setItem('activeOrder', JSON.stringify(newOrder));
      
      // ✅ SYNC: Push to shared admin store
      const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || [];
      allOrders.push(newOrder);
      localStorage.setItem('foodcourt_orders', JSON.stringify(allOrders));
      // ─────────────────────────────────────────────────────────
      
      alert(`✅ Order placed for Table ${table}!\n💵 Pay $${total.toFixed(2)} cash at the counter.\n🔔 We'll notify you when it's ready.`);

      localStorage.removeItem('myCart');
      localStorage.removeItem('cart');
      window.location.href = 'notification.html';
    });
  }
});