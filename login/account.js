/* =========================================
📦 RESTAURANT MANAGER SUMMARY DASHBOARD
========================================= */

// Global ordersData for sync functions
let ordersData = [];

document.addEventListener('DOMContentLoaded', () => {
    // 🔒 Auth Guard
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

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

    // Update UI with store name
    document.title = `${currentStoreName} Summary`;
    const pageSub = document.querySelector('.page-sub');
    if (pageSub) {
        pageSub.innerHTML = `Manager Control Panel<br>View analytics for <strong>${currentStoreName}</strong>.`;
    }

    // 📥 Load & Filter Orders by Restaurant
    // Read from BOTH possible storage keys
    const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || 
                      JSON.parse(localStorage.getItem('orders')) || [];
    
    console.log('📊 All orders:', allOrders);
    
    // Filter orders by the logged-in restaurant
    ordersData = allOrders.filter(order => {
        const orderRestaurant = order.restaurant || order.stall || '';
        return loggedInStore === 'all' || orderRestaurant === currentStoreName;
    });

    console.log(`📊 ${currentStoreName} Dashboard initialized. Loaded ${ordersData.length} orders.`);
    console.log('📦 Filtered orders:', ordersData);
    
    updateDashboard();
    setupStorageSync();
});

/* =========================================
🔄 Storage Sync (Real-time Updates)
========================================= */
function setupStorageSync() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'foodcourt_orders' || e.key === 'orders') {
            console.log('🔄 Storage event detected, syncing...');
            syncOrders();
        }
    });

    // Fallback polling for same-tab updates
    let lastHash = JSON.stringify(ordersData);
    const storeNames = {
        xiaoyun: 'Small Cloud', goldenbowl: 'The Golden Bowl', wokroll: 'Wok & Roll',
        boba: 'The Boba Shop', greenbowl: 'Green Bowl Co.', all: 'All Stalls'
    };
    
    setInterval(() => {
        const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || 
                         JSON.parse(localStorage.getItem('orders')) || [];
        const loggedInStore = localStorage.getItem('loggedInStore') || 'all';
        const currentStoreName = storeNames[loggedInStore] || 'All Stalls';
        
        const filtered = allOrders.filter(order => {
            const orderRestaurant = order.restaurant || order.stall || '';
            return loggedInStore === 'all' || orderRestaurant === currentStoreName;
        });
            
        if (JSON.stringify(filtered) !== lastHash) {
            console.log('🔄 Polling detected changes, syncing...');
            ordersData = filtered;
            updateDashboard();
            lastHash = JSON.stringify(filtered);
        }
    }, 5000);
}

function syncOrders() {
    const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || 
                      JSON.parse(localStorage.getItem('orders')) || [];
    const loggedInStore = localStorage.getItem('loggedInStore') || 'all';
    const storeNames = {
        xiaoyun: 'Small Cloud', goldenbowl: 'The Golden Bowl', wokroll: 'Wok & Roll',
        boba: 'The Boba Shop', greenbowl: 'Green Bowl Co.', all: 'All Stalls'
    };
    const currentStoreName = storeNames[loggedInStore] || 'All Stalls';
    
    const filtered = allOrders.filter(order => {
        const orderRestaurant = order.restaurant || order.stall || '';
        return loggedInStore === 'all' || orderRestaurant === currentStoreName;
    });

    if (filtered.length !== ordersData.length) {
        console.log(`✨ ${filtered.length - ordersData.length} new orders detected!`);
        ordersData = filtered;
        updateDashboard();
        showNotification('🆕 New orders received!');
    }
}

/* =========================================
📈 Dashboard Update Functions
========================================= */
function updateDashboard() {
    updateStats();
    renderTable();
}

function updateStats() {
    const totalOrders = ordersData.length;
    const activeStatus = ordersData.filter(order => 
        ['new', 'preparing', 'ordered', 'pending'].includes(order.status)
    ).length;
    
    const totalProfit = ordersData.reduce((sum, order) => {
        return sum + (order.total || order.price || 0);
    }, 0);

    animateNumber('total-orders', totalOrders);
    animateNumber('active-status', activeStatus);
    animateProfit('total-profit', totalProfit);
}

function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const duration = 600;
    const start = parseInt(element.textContent) || 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        element.textContent = Math.floor(start + (targetNumber - start) * easeOutQuart);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function animateProfit(elementId, targetAmount) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const duration = 800;
    const start = parseFloat(element.textContent.replace('RM ', '')) || 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        element.textContent = `RM ${(start + (targetAmount - start) * easeOutQuart).toFixed(2)}`;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function renderTable() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) {
        console.error('❌ orders-table-body not found!');
        return;
    }

    // Sort orders by timestamp (newest first)
    const sortedOrders = [...ordersData].sort((a, b) => 
        new Date(b.timestamp || b.orderDate || b.date || 0) - new Date(a.timestamp || a.orderDate || a.date || 0)
    );

    if (sortedOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <p>No orders yet. Waiting for new orders...</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Render table rows
    tbody.innerHTML = sortedOrders.map(order => {
        const time = new Date(order.timestamp || order.orderDate || order.date || Date.now()).toLocaleTimeString('en-MY', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Fix: Get food items display
        let foodDisplay = '-';
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            foodDisplay = order.items.map(item => `${item.name || item.title} x${item.quantity || 1}`).join(', ');
        } else if (order.food) {
            foodDisplay = order.food;
        } else if (order.items && typeof order.items === 'string') {
            foodDisplay = order.items;
        }

        // Fix: Ensure priceValue is a number
        const priceValue = parseFloat(order.total) || parseFloat(order.price) || 0;

        // Get status
        const status = order.status || 'new';
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

        return `
        <tr>
            <td class="order-id">${order.id || 'N/A'}</td>
            <td>${order.customer?.phone || order.phone || '-'}</td>
            <td>${foodDisplay}</td>
            <td class="price-cell">RM ${priceValue.toFixed(2)}</td>
            <td><span class="status-badge status-${status}">${statusLabel}</span></td>
            <td style="text-align: center;">
                <button class="view-btn" onclick="openOrderModal('${order.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

/* =========================================
🔁 Manual Refresh & Notifications
========================================= */
function refreshData() {
    const btn = document.querySelector('.refresh-btn');
    if (!btn) return;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    btn.disabled = true;

    setTimeout(() => {
        const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || 
                         JSON.parse(localStorage.getItem('orders')) || [];
        const loggedInStore = localStorage.getItem('loggedInStore') || 'all';
        const storeNames = { xiaoyun: 'Small Cloud', goldenbowl: 'The Golden Bowl', wokroll: 'Wok & Roll', boba: 'The Boba Shop', greenbowl: 'Green Bowl Co.', all: 'All Stalls' };
        const currentStoreName = storeNames[loggedInStore] || 'All Stalls';
        
        ordersData = allOrders.filter(order => {
            const orderRestaurant = order.restaurant || order.stall || '';
            return loggedInStore === 'all' || orderRestaurant === currentStoreName;
        });
            
        updateDashboard();
        btn.innerHTML = originalContent;
        btn.disabled = false;
        showNotification('✅ Data refreshed!');
    }, 600);
}

function showNotification(message) {
    const old = document.querySelector('.dashboard-notification');
    if (old) old.remove();
    
    const notification = document.createElement('div');
    notification.className = 'dashboard-notification';
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: var(--success, #2a9d8f); color: white;
        padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000; font-weight: 500; animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 0.5rem;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Inject animation styles if missing
if (!document.getElementById('notif-styles')) {
    const style = document.createElement('style');
    style.id = 'notif-styles';
    style.textContent = `@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }`;
    document.head.appendChild(style);
}

// Expose refresh globally
window.refreshData = refreshData;

/* =========================================
👁️ ORDER MODAL & RECEIPT FUNCTIONS
========================================= */

window.openOrderModal = function(orderId) {
    // Find the order in our local data
    const order = ordersData.find(o => o.id === orderId);
    if (!order) return;

    // Helper to safely format money
    const formatMoney = (val) => Number(val || 0).toFixed(2);

    // Populate Modal Content
    document.getElementById('modal-order-id').textContent = order.id;
    
    const statusBadge = document.getElementById('modal-status');
    statusBadge.textContent = order.status.toUpperCase();
    statusBadge.className = `status-badge status-${order.status}`;
    
    // Customer Info
    const cust = order.customer || {};
    document.getElementById('modal-cust-name').textContent = cust.fullName || cust.name || '—';
    document.getElementById('modal-cust-email').textContent = cust.email || '—';
    document.getElementById('modal-cust-phone').textContent = cust.phone || '—';
    document.getElementById('modal-cust-address').textContent = cust.address || '—';

    // Order Items
    const itemsList = document.getElementById('modal-items-list');
    itemsList.innerHTML = '';
    
    if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'receipt-item';
            // Ensure price calculation is a number
            const itemTotal = Number(item.price || 0) * (item.quantity || 1);
            div.innerHTML = `
                <span>${item.name || item.title} x ${item.quantity}</span>
                <span>RM ${formatMoney(itemTotal)}</span>
            `;
            itemsList.appendChild(div);
        });
    } else if (typeof order.items === 'string') {
        itemsList.innerHTML = `<div class="receipt-item"><span>${order.items}</span></div>`;
    }

    // Totals - USE formatMoney() HERE TO FIX THE ERROR
    document.getElementById('modal-subtotal').textContent = `RM ${formatMoney(order.subtotal)}`;
    document.getElementById('modal-discount').textContent = formatMoney(order.discount) > 0 ? `-RM ${formatMoney(order.discount)}` : 'RM 0.00';
    document.getElementById('modal-delivery').textContent = `RM ${formatMoney(order.delivery)}`;
    document.getElementById('modal-tax').textContent = `RM ${formatMoney(order.serviceTax)}`;
    document.getElementById('modal-total').textContent = `RM ${formatMoney(order.total)}`;

    // Show Modal
    document.getElementById('order-modal-overlay').style.display = 'flex';
};

window.closeOrderModal = function() {
    document.getElementById('order-modal-overlay').style.display = 'none';
};

window.downloadReceipt = function() {
    // Re-find order from currently open modal ID
    const orderId = document.getElementById('modal-order-id').textContent;
    const order = ordersData.find(o => o.id === orderId);
    if (!order) return;

    const cust = order.customer || {};
    let receiptText = `
==================================
           NUTRIBITES
           OFFICIAL RECEIPT
==================================
Order ID: ${order.id}
Date:     ${order.date || new Date().toLocaleDateString()}
Status:   ${order.status.toUpperCase()}
==================================
CUSTOMER DETAILS
Name:    ${cust.fullName || cust.name || 'N/A'}
Email:   ${cust.email || 'N/A'}
Phone:   ${cust.phone || 'N/A'}
Address: ${cust.address || 'N/A'}
==================================
ITEMS
`;

    if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
            receiptText += `${item.name || item.title} x${item.quantity}  @ RM${item.price}  = RM${((item.price || 0) * item.quantity).toFixed(2)}\n`;
        });
    }

    receiptText += `
----------------------------------
Subtotal:       RM ${(order.subtotal || 0).toFixed(2)}
Discount:       RM ${(order.discount || 0).toFixed(2)}
Delivery:       RM ${(order.delivery || 0).toFixed(2)}
Service Tax:    RM ${(order.serviceTax || 0).toFixed(2)}
----------------------------------
TOTAL PAID:     RM ${(order.total || 0).toFixed(2)}
==================================
    Thank you for your order!
==================================
    `;

    // Create Blob and Download
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Close modal when clicking outside
document.getElementById('order-modal-overlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeOrderModal();
});