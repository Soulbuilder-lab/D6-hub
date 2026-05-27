document.addEventListener('DOMContentLoaded', () => {
  const historyList = document.getElementById('historyList');

  // Get current table session
  const currentTable = sessionStorage.getItem('tableNumber') || localStorage.getItem('tableNumber');

  /* =============================================
     RECEIPT MODAL INJECTION
  ============================================= */
  document.body.insertAdjacentHTML('beforeend', `
    <div id="receipt-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:9999; align-items:center; justify-content:center;">
      <div id="receipt-modal" style="
        background:#fff; border-radius:16px; width:90%; max-width:440px;
        max-height:90vh; overflow-y:auto;
        box-shadow:0 20px 60px rgba(0,0,0,0.3);
        font-family:'Open Sans',sans-serif;
        position:relative; animation: slideUp 0.25s ease;
      ">
        <button onclick="closeReceipt()" style="
          position:absolute; top:14px; right:14px;
          background:none; border:none; font-size:22px;
          cursor:pointer; color:#888; line-height:1;
        ">✕</button>
        <div id="receipt-content" style="padding:32px 28px;"></div>
        <div style="padding:0 28px 24px; display:flex; gap:10px;">
          <button onclick="printReceipt()" style="
            flex:1; padding:11px; background:#154C63; color:#fff;
            border:none; border-radius:8px; font-size:14px;
            font-weight:600; cursor:pointer; display:flex;
            align-items:center; justify-content:center; gap:6px;
          ">🖨️ Print</button>
          <button onclick="downloadReceipt()" style="
            flex:1; padding:11px; background:#f0f9ff; color:#154C63;
            border:2px solid #99D2EA; border-radius:8px; font-size:14px;
            font-weight:600; cursor:pointer; display:flex;
            align-items:center; justify-content:center; gap:6px;
          ">⬇️ Download</button>
        </div>
      </div>
    </div>

    <style>
      @keyframes slideUp {
        from { transform: translateY(30px); opacity:0; }
        to   { transform: translateY(0);    opacity:1; }
      }
      #receipt-overlay.show { display:flex !important; }
      .receipt-divider { border:none; border-top:1px dashed #ddd; margin:14px 0; }
      .receipt-row { display:flex; justify-content:space-between; font-size:13.5px; padding:4px 0; color:#333; }
      .receipt-row.bold { font-weight:700; font-size:15px; color:#154C63; }
      .receipt-item-row { display:flex; justify-content:space-between; font-size:13px; padding:5px 0; border-bottom:1px solid #f0f0f0; color:#444; }
      .receipt-item-row:last-child { border-bottom:none; }
      .view-receipt-btn {
        margin-top:12px; padding:8px 16px;
        background:#f0f9ff; color:#154C63;
        border:1.5px solid #99D2EA; border-radius:8px;
        font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s;
      }
      .view-receipt-btn:hover { background:#154C63; color:#fff; border-color:#154C63; }
    </style>
  `);

  let currentReceiptOrder = null;

  window.openReceipt = function(orderId) {
    const orders = JSON.parse(localStorage.getItem('foodcourt_orders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    currentReceiptOrder = order;

    const itemsArr = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = itemsArr.map(i => `
      <div class="receipt-item-row">
        <span>${i.name} <span style="color:#aaa;">x ${i.quantity}</span></span>
        <span>RM ${(i.price * i.quantity).toFixed(2)}</span>
      </div>`).join('');

    const statusColor = order.status === 'completed' ? '#2a9d8f' : '#f4a261';

    document.getElementById('receipt-content').innerHTML = `
      <div style="text-align:center; margin-bottom:20px;">
        <div style="font-size:28px; margin-bottom:6px;">🧾</div>
        <h3 style="margin:0; font-size:18px; color:#154C63;">Official Receipt</h3>
        <p style="margin:4px 0 0; font-size:12px; color:#aaa;">${order.restaurant || order.stall || 'FoodCourt Hub'}</p>
      </div>
      <div style="background:#f8fbfd; border-radius:10px; padding:14px; margin-bottom:14px;">
        <div class="receipt-row"><span style="color:#888;">Order ID</span><span style="font-weight:600;">${order.id}</span></div>
        <div class="receipt-row"><span style="color:#888;">Date</span><span>${order.orderDate || '—'}</span></div>
        <div class="receipt-row"><span style="color:#888;">Table</span><span>${order.table || 'Kiosk'}</span></div>
        <div class="receipt-row"><span style="color:#888;">Status</span><span style="color:${statusColor}; font-weight:600; text-transform:capitalize;">${order.status || 'Placed'}</span></div>
      </div>
      <div style="background:#f8fbfd; border-radius:10px; padding:14px; margin-bottom:14px;">
        <p style="font-size:12px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px;">Customer</p>
        <div class="receipt-row"><span style="color:#888;">Name</span><span>${order.customer?.name || '—'}</span></div>
        <div class="receipt-row"><span style="color:#888;">Phone</span><span>${order.customer?.phone || '—'}</span></div>
        <div class="receipt-row"><span style="color:#888;">Email</span><span style="font-size:12px;">${order.customer?.email || '—'}</span></div>
      </div>
      <div style="margin-bottom:14px;">
        <p style="font-size:12px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px;">Items Ordered</p>
        ${itemsHtml || '<p style="color:#aaa; font-size:13px;">No items</p>'}
      </div>
      <hr class="receipt-divider">
      <div class="receipt-row"><span style="color:#888;">Subtotal</span><span>RM ${order.subtotal}</span></div>
      <div class="receipt-row"><span style="color:#888;">Tax (6%)</span><span>RM ${order.tax}</span></div>
      <div class="receipt-row"><span style="color:#888;">Payment</span><span>${order.payment || 'Cash'}</span></div>
      <hr class="receipt-divider">
      <div class="receipt-row bold"><span>Total</span><span>RM ${order.total}</span></div>
      <div style="text-align:center; margin-top:20px; font-size:11px; color:#bbb;">Thank you for dining with us! 🍽️</div>
    `;

    document.getElementById('receipt-overlay').classList.add('show');
  };

  window.closeReceipt = function() {
    document.getElementById('receipt-overlay').classList.remove('show');
    currentReceiptOrder = null;
  };

  document.getElementById('receipt-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeReceipt();
  });

  window.printReceipt = function() {
    const content = document.getElementById('receipt-content').innerHTML;
    const win = window.open('', '_blank', 'width=480,height=700');
    win.document.write(`<html><head><title>Receipt</title>
      <style>
        body { font-family:'Open Sans',sans-serif; padding:24px; font-size:13px; }
        .receipt-row { display:flex; justify-content:space-between; padding:4px 0; }
        .receipt-row.bold { font-weight:700; font-size:15px; }
        .receipt-item-row { display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #eee; }
        hr,.receipt-divider { border:none; border-top:1px dashed #ddd; margin:10px 0; }
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  window.downloadReceipt = function() {
    if (!currentReceiptOrder) return;
    const o = currentReceiptOrder;
    const itemLines = Array.isArray(o.items)
      ? o.items.map(i => `  - ${i.name} x${i.quantity}  RM ${(i.price * i.quantity).toFixed(2)}`).join('\n')
      : '';
    const text = [
      '=============================',
      '       OFFICIAL RECEIPT',
      '=============================',
      o.restaurant || 'FoodCourt Hub',
      `Order ID : ${o.id}`,
      `Date     : ${o.orderDate || ''}`,
      `Table    : ${o.table || 'Kiosk'}`,
      `Status   : ${o.status || 'Placed'}`,
      '',
      '-----------------------------',
      'CUSTOMER',
      `Name  : ${o.customer?.name || '—'}`,
      `Phone : ${o.customer?.phone || '—'}`,
      `Email : ${o.customer?.email || '—'}`,
      '',
      '-----------------------------',
      'ITEMS',
      itemLines,
      '',
      '-----------------------------',
      `Subtotal : RM ${o.subtotal}`,
      `Tax (6%) : RM ${o.tax}`,
      `Payment  : ${o.payment || 'Cash'}`,
      '-----------------------------',
      `TOTAL    : RM ${o.total}`,
      '=============================',
      'Thank you for dining with us!'
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `receipt-${o.id}.txt`;
    a.click();
  };

  /* =============================================
     RENDER HISTORY — filtered by current table
  ============================================= */
  const renderHistory = () => {
    const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || [];

    // No table session — prompt user to scan
    if (!currentTable) {
      historyList.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:#888;">
          <div style="font-size:40px; margin-bottom:12px;">🪑</div>
          <h3 style="margin:0 0 8px; color:#555;">No Active Table Session</h3>
          <p style="font-size:14px;">Please scan your table QR code on the home page to view your order history.</p>
          <a href="index.html" style="display:inline-block; margin-top:16px; padding:10px 24px;
            background:#154C63; color:#fff; border-radius:8px; text-decoration:none;
            font-weight:600; font-size:14px;">Go Scan Table</a>
        </div>`;
      return;
    }

    // Filter to this table only
    const tableOrders = allOrders.filter(o => o.table === currentTable);

    historyList.innerHTML = `
      <div style="background:#e0f7ff; border:1.5px solid #99D2EA; border-radius:10px;
        padding:10px 16px; margin-bottom:20px; font-size:13px; color:#154C63;
        display:flex; align-items:center; gap:8px;">
        <i class="fas fa-chair"></i>
        Showing orders for <strong style="margin-left:4px;">Table ${currentTable}</strong>
      </div>`;

    if (tableOrders.length === 0) {
      historyList.insertAdjacentHTML('beforeend',
        '<p style="color:#8c8c8c; text-align:center; padding:30px;">No orders found for this table yet.</p>');
      return;
    }

    [...tableOrders].reverse().forEach(order => {
      const card = document.createElement('div');
      card.className = 'history-card';

      const itemsArr = Array.isArray(order.items)
        ? order.items.map(i => `${i.name} x ${i.quantity}`)
        : [order.items];
      const itemsHtml = itemsArr.map(item =>
        `<li style="margin-bottom:4px; color:#555;">• ${item}</li>`).join('');

      const statusColor = order.status === 'completed' ? '#2a9d8f' : '#f4a261';
      const statusBg    = order.status === 'completed' ? '#e0f2f1' : '#fff3e0';

      card.innerHTML = `
        <div class="history-header">
          <div>
            <h4 style="margin:0; color:#2d2d2d;">Order #${order.id || 'N/A'}</h4>
            <p style="color:#8c8c8c; font-size:0.85rem; margin-top:4px;">
              ${order.orderDate || ''} • ${order.restaurant || order.stall || 'Unknown'}
            </p>
          </div>
          <div style="text-align:right;">
            <span style="background:${statusBg}; color:${statusColor}; padding:4px 10px;
              border-radius:12px; font-size:0.8rem; font-weight:600;">
              ${order.status || 'Placed'}
            </span>
          </div>
        </div>
        <div style="margin:15px 0; padding:10px; background:#fdfbf7; border-radius:8px;">
          <ul style="list-style:none; padding:0; margin:0; font-size:0.9rem;">${itemsHtml}</ul>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;
          border-top:1px solid #eee; padding-top:10px;">
          <span style="color:#8c8c8c; font-size:0.9rem;">Payment: ${order.payment || 'Cash'}</span>
          <span style="font-weight:700; color:#f4a261; font-size:1.1rem;">Total: RM ${order.total}</span>
        </div>
        <button class="view-receipt-btn" onclick="openReceipt('${order.id}')">
          🧾 View Receipt
        </button>`;
      historyList.appendChild(card);
    });
  };

  renderHistory();

  window.addEventListener('storage', e => {
    if (e.key === 'foodcourt_orders') renderHistory();
  });
});