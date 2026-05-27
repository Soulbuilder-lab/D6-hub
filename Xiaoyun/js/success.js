document.addEventListener('DOMContentLoaded', function() {
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    if (!lastOrder) {
        alert('No order found!');
        window.location.href = 'smallcloud.html';
        return;
    }

    // 生成随机订单号
    const orderNum = 'ORD-' + Date.now().toString().slice(-6);
    document.getElementById('orderNumber').textContent = '#' + orderNum;
    document.getElementById('orderDate').textContent = lastOrder.orderDate || new Date().toLocaleString();
    document.getElementById('customerName').textContent = lastOrder.customer?.name || 'Guest';
    document.getElementById('paymentMethod').textContent = lastOrder.payment || 'Cash on Delivery';

    // 渲染商品列表
    const itemsList = document.getElementById('orderItemsList');
    itemsList.innerHTML = '';
    if (lastOrder.items) {
        lastOrder.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'order-item';
            div.innerHTML = `
                <div>
                    <span class="order-item-name">${item.name}</span>
                    <span class="order-item-qty">x ${item.quantity}</span>
                </div>
                <span class="order-item-price">RM ${(item.price * item.quantity).toFixed(2)}</span>
            `;
            itemsList.appendChild(div);
        });
    }

    // 计算总额（已去除配送费）
    const sub = parseFloat(lastOrder.subtotal) || 0;
    const tax = parseFloat(lastOrder.tax) || 0;
    const total = sub + tax;

    document.getElementById('orderSubtotal').textContent = `RM ${sub.toFixed(2)}`;
    document.getElementById('orderTax').textContent = `RM ${tax.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `RM ${total.toFixed(2)}`;
});

function downloadReceipt() {
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    const orderNum = document.getElementById('orderNumber').textContent;
    let text = `SMALL CLOUD RESTAURANT\n${orderNum}\n${lastOrder.orderDate}\n\n`;
    text += `Customer: ${lastOrder.customer?.name || 'Guest'}\nPayment: ${lastOrder.payment}\n\nItems:\n`;
    lastOrder.items.forEach(i => text += `- ${i.name} x${i.quantity} : RM ${(i.price*i.quantity).toFixed(2)}\n`);
    const total = (parseFloat(lastOrder.subtotal) + parseFloat(lastOrder.tax)).toFixed(2);
    text += `\nSubtotal: RM ${lastOrder.subtotal}\nTax: RM ${lastOrder.tax}\nTOTAL: RM ${total}`;

    const blob = new Blob([text], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `receipt-${orderNum}.txt`;
    a.click();
}

function handleLogout(e) {
    e.preventDefault();
    if(confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'smallcloud.html';
    }
}