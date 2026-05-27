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

function getCartData() {
    const data = localStorage.getItem('goldenBowlCart');
    return data ? JSON.parse(data) : [];
}

function saveCartData(data) {
    localStorage.setItem('goldenBowlCart', JSON.stringify(data));
}

const cartListElement = document.getElementById('cart-list');
const subtotalElement = document.getElementById('subtotal-price');
const taxElement = document.getElementById('tax-price');
const totalElement = document.getElementById('total-price');
const headerCartCount = document.getElementById('header-cart-count');

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function getImagePath(itemName) {
    const fileName = itemName.toLowerCase().replace(/\s+/g, ' ') + '.jpg';
    return 'images/' + fileName;
}

function renderCart() {
    cartListElement.innerHTML = ''; 
    let cartData = getCartData();
    
    if (cartData.length === 0) {
        cartListElement.innerHTML = `
            <div style="text-align:center; padding:40px; color:#a7a7a7;">
                <ion-icon name="cart-outline" style="font-size:48px; opacity:0.5;"></ion-icon>
                <p style="margin-top:10px;">Your cart is empty.</p>
            </div>`;
        updateSummary();
        return;
    }

    cartData.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const imagePath = getImagePath(item.name);
        
        const itemHTML = `
            <div class="cart-item-card">
                <div class="item-image">
                    <img src="${imagePath}" alt="${item.name}" onerror="this.src='images/logo.jpg'">
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">RM ${item.price.toFixed(2)}</div>
                </div>
                <div class="item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <ion-icon name="trash-outline" class="remove-btn" onclick="removeItem(${index})"></ion-icon>
                </div>
            </div>
        `;
        cartListElement.innerHTML += itemHTML;
    });

    updateSummary();
}

function updateQuantity(index, change) {
    let cartData = getCartData();
    
    if (index >= 0 && index < cartData.length) {
        const newQuantity = cartData[index].quantity + change;
        
        if (newQuantity > 0) {
            cartData[index].quantity = newQuantity;
        } else {
            if(confirm("Remove this item from cart?")) {
                cartData.splice(index, 1);
            } else {
                cartData[index].quantity = 1;
            }
        }
        
        saveCartData(cartData);

        renderCart();
    }
}

function removeItem(index) {
    let cartData = getCartData();
    
    if (index >= 0 && index < cartData.length) {
        if(confirm("Are you sure you want to remove this item?")) {
            cartData.splice(index, 1);

            saveCartData(cartData);

            renderCart();
        }
    }
}


function updateSummary() {
    let cartData = getCartData();
    let subtotal = 0;
    let totalQty = 0;

    cartData.forEach(item => {
        subtotal += item.price * item.quantity;
        totalQty += item.quantity;
    });

    const tax = subtotal * 0.06;
    const total = subtotal + tax;

    // 更新 DOM
    if (subtotalElement) subtotalElement.textContent = `RM ${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `RM ${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `RM ${total.toFixed(2)}`;
    if (headerCartCount) headerCartCount.textContent = totalQty;
}

function emptyCart() {

        localStorage.removeItem('goldenBowlCart');
        
        renderCart();
        
        console.log("🗑️ Cart emptied");
    }
