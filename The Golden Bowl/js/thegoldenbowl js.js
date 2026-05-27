/* =========================================
   📱 移动端菜单切换
   ========================================= */
const mobile = document.querySelector('.menu-toggle');
const mobileLink = document.querySelector('.sidebar');

if (mobile && mobileLink) {
    mobile.addEventListener("click", function(){
        mobile.classList.toggle("is-active");
        mobileLink.classList.toggle("active");
    });

    mobileLink.addEventListener("click", function(e){
        // 点击菜单链接后自动关闭侧边栏（移动端）
        if (e.target.tagName === 'A' && window.innerWidth <= 768) {
            mobile.classList.remove("is-active");
            mobileLink.classList.remove("active");
        }
    });
}

/* =========================================
   🔄 滚动动画（jQuery）
   ========================================= */
var step = 100;
var stepFilter = 60;

$(".back").bind("click", function(e){
  e.preventDefault();
  $(".highlight-wrapper").animate({ scrollLeft: "-=" + step + "px" }, 300);
});

$(".next").bind("click", function(e){
  e.preventDefault();
  $(".highlight-wrapper").animate({ scrollLeft: "+=" + step + "px" }, 300);
});

$(".back-menus").bind("click", function(e){
  e.preventDefault();
  $(".filter-wrapper").animate({ scrollLeft: "-=" + stepFilter + "px" }, 300);
});

$(".next-menus").bind("click", function(e){
  e.preventDefault();
  $(".filter-wrapper").animate({ scrollLeft: "+=" + stepFilter + "px" }, 300);
});

/* =========================================
   🛒 购物车逻辑（localStorage）
   ========================================= */

// 1. 初始化购物车数据
let cartItems = JSON.parse(localStorage.getItem('goldenBowlCart')) || [];

// 2. 页面加载时更新购物车数量
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    console.log('🛒 购物车初始化完成，当前商品数:', cartItems.length);
});

// 3. 添加到购物车（主函数）
function addToCart(itemName, itemPrice) {
    console.log('🛒 addToCart 被调用:', {itemName, itemPrice});
    
    // 检查是否已存在
    const existingItem = cartItems.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('📦 商品已存在，数量 +1');
    } else {
        cartItems.push({
            name: itemName,
            price: itemPrice,
            quantity: 1
        });
        console.log('✨ 新商品加入购物车');
    }

    // 保存到 localStorage
    localStorage.setItem('goldenBowlCart', JSON.stringify(cartItems));
    
    // 更新右上角数量
    updateCartCount();
    
    // 如果购物车弹窗打开，同步更新
    const cartPopup = document.getElementById('cart-popup');
    if (cartPopup && cartPopup.classList.contains('active')) {
        renderPopupCart();
    }
    
    // ✅ 显示 Toast 提示
    showToast(`🛒 ${itemName} added to cart!`);
}

// 4. 更新购物车数量显示
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    
    let totalCount = 0;
    cartItems.forEach(item => totalCount += item.quantity);
    cartCount.textContent = totalCount;
    
    // 动画效果：数量变化时闪烁
    cartCount.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 200);
}

// 5. 渲染购物车弹窗内容
function renderPopupCart() {
    const cartItemsBody = document.getElementById('cart-items')?.getElementsByTagName('tbody')[0];
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItemsBody || !cartTotal) return;
    
    cartItemsBody.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Cart is empty</td></tr>';
        cartTotal.textContent = '0.00';
        return;
    }

    cartItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const row = cartItemsBody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>RM ${item.price.toFixed(2)}</td>
            <td>RM ${itemTotal.toFixed(2)}</td>
        `;
    });
    
    cartTotal.textContent = total.toFixed(2);
}

// 6. 切换购物车弹窗
function toggleCartPopup() {
    const cartPopup = document.getElementById('cart-popup');
    if (!cartPopup) return;
    
    renderPopupCart();
    cartPopup.classList.toggle('active');
}

// 7. 关闭购物车弹窗
function closeCart() {
    const cartPopup = document.getElementById('cart-popup');
    if (cartPopup) {
        cartPopup.classList.remove('active');
    }
}

/* =========================================
   🔍 分类过滤功能
   ========================================= */
function filterMenu(category, event) {
    console.log('🔍 过滤分类:', category);
    
    const cards = document.querySelectorAll('.detail-card');
    const buttons = document.querySelectorAll('.filter-card');
    
    // 重置所有按钮样式
    buttons.forEach(btn => {
        btn.style.backgroundColor = 'var(--whitecolor)';
        btn.style.color = 'var(--tea14)';
        btn.style.borderColor = 'var(--tea6)';
    });
    
    // 高亮当前点击的按钮
    const clickedButton = Array.from(buttons).find(btn => 
        btn.getAttribute('onclick')?.includes(category)
    );
    
    if (clickedButton) {
        clickedButton.style.backgroundColor = 'var(--tea12)';
        clickedButton.style.color = 'var(--whitecolor)';
        clickedButton.style.borderColor = 'var(--tea12)';
    }
    
    // 过滤卡片
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = ''; 
            // 添加淡入动画
            card.style.animation = 'fadeIn 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

/* =========================================
   🔔 Toast 提示功能
   ========================================= */
function showToast(message) {
    console.log('🔔 showToast:', message);
    
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    
    // 安全检查
    if (!toast) {
        console.error('❌ Toast 元素未找到！请检查 HTML 是否添加了：');
        console.error('<div id="toast-notification" class="toast">...</div>');
        return;
    }
    if (!toastMsg) {
        console.error('❌ Toast 消息元素未找到！请检查 <span id="toast-message">');
        return;
    }
    
    // 更新文字
    toastMsg.textContent = message || 'Successfully added to cart!';
    
    // 显示动画
    toast.classList.add('show');
    
    // 清除之前的定时器
    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
    }
    
    // 2.5秒后自动隐藏
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        console.log('🔕 Toast 已隐藏');
    }, 2000);
}

/* =========================================
   🔗 社交媒体链接增强
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {
    // 社交链接新标签页打开
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const url = this.href;
            window.open(url, '_blank', 'noopener,noreferrer');
        });
    });
    
    // 搜索框功能（可选）
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search input');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            const keyword = searchInput.value.trim();
            if (keyword) {
                console.log('🔍 搜索:', keyword);
                filterBySearch(keyword);
            }
        });
        
        // 支持 Enter 键搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
});

/* =========================================
   🔍 辅助函数：按关键词搜索
   ========================================= */
function filterBySearch(keyword) {
    const cards = document.querySelectorAll('.detail-card');
    const lowerKeyword = keyword.toLowerCase();
    
    let found = 0;
    
    cards.forEach(card => {
        const name = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.detail-sub')?.textContent.toLowerCase() || '';
        
        if (name.includes(lowerKeyword) || desc.includes(lowerKeyword)) {
            card.style.display = '';
            found++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`🔍 搜索结果: 找到 ${found} 个商品`);
    
    // 显示搜索提示
    if (found === 0) {
        showToast(`😕 No results for "${keyword}"`);
    } else {
        showToast(`✅ Found ${found} item(s)`);
    }
}

/* =========================================
   🎨 添加淡入动画关键帧（动态注入）
   ========================================= */
(function addFadeInAnimation() {
    if (document.getElementById('fade-in-style')) return;
    
    const style = document.createElement('style');
    style.id = 'fade-in-style';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
})();