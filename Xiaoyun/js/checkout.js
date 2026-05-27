const mobile = document.querySelector('.menu-toggle');
const mobileLink = document.querySelector('.sidebar');

mobile.addEventListener("click", function(){
    mobile.classList.toggle("is-active");
    mobileLink.classList.toggle("active");
})

mobileLink.addEventListener("click", function(){
    const menuBars = document.querySelector(".is-active");
    if(window.innerWidth<=768 && menuBars) {
       mobile.classList.toggle("is-active");
       mobileLink.classList.toggle("active");
    }
})

const profile = JSON.parse(localStorage.getItem('customerProfile')) || {};
if(profile.name) document.getElementById('name').value = profile.name;
if(profile.phone) document.getElementById('phone').value = profile.phone;

document.addEventListener('DOMContentLoaded', () => {
    const cartData = JSON.parse(localStorage.getItem('smallCloudCart')) || [];
    const itemsContainer = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    const form = document.getElementById('checkout-form');
    const cartCount = document.getElementById('cart-count');

    // 检查购物车是否为空
if (cartData.length === 0) {
    alert("Your cart is empty! Please add items first.");
    window.location.href = 'cart.html';
    return;
}

// 计算并显示购物车数量
let subtotal = 0;
const totalQty = cartData.reduce((sum, item) => sum + item.quantity, 0);
if (cartCount) cartCount.textContent = totalQty;

// 渲染订单项
cartData.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const div = document.createElement('div');
    div.className = 'checkout-item';
    div.innerHTML = `
         <span>${item.name} × ${item.quantity}</span>
         <span>RM ${itemTotal.toFixed(2)}</span>
    `;
    itemsContainer.appendChild(div);
});

// 计算税费和总计
const tax = subtotal * 0.06;
const total = subtotal + tax;

// 更新显示
if (subtotalEl) subtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
if (taxEl) taxEl.textContent = `RM ${tax.toFixed(2)}`;
if (totalEl) totalEl.textContent = `RM ${total.toFixed(2)}`;

// ✅ 修复：表单提交处理
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 获取表单值
    const name = document.getElementById('name')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const address = document.getElementById('address')?.value.trim();
    const payment = document.querySelector('input[name="payment"]:checked')?.value;

    // 验证必填字段
    if (!name || !phone || !email) {
        alert("Please fill in all required fields.");
        return;
    }

    // ✅ 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address (e.g. user@example.com)");
        document.getElementById('email')?.focus();
        return;
    }

    // ✅ 保存订单信息 (Added required admin fields)
    const orderData = {
        id: 'ORD-' + Date.now().toString().slice(-6), // 🔑 Required ID
        restaurant: 'Small Cloud',                    // 🔑 Matches login filter
        table: localStorage.getItem('tableNumber') || 'Kiosk', // 🔑 Table/Kiosk
        status: 'new',                                // 🔑 CRITICAL for admin panel
        customer: { name, phone, email },
        items: cartData,
        payment: payment === 'cash' ? 'Cash on Delivery' : 'Card',
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        orderDate: new Date().toLocaleString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    //SYNC BRIDGE: Push to shared store for Admin & Notifications
    const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || [];
    allOrders.push(orderData);
    localStorage.setItem('foodcourt_orders', JSON.stringify(allOrders));
     
    // 清空购物车
    localStorage.removeItem('smallCloudCart');
    
    // 跳转回首页
    window.location.href = 'success.html';
});
});