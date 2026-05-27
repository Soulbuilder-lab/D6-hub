document.addEventListener('DOMContentLoaded', () => {
  const scanBtn    = document.getElementById('scanBtn');
  const heroTable  = document.getElementById('heroTable');
  const tableBadge = document.getElementById('table-badge');

  /* ── Auto-read table from URL param (real QR code flow) ─────────────
     QR codes at each table link to:  index.html?table=57
     When scanned, this sets the session automatically.
  ──────────────────────────────────────────────────────────────────── */
  const urlParams = new URLSearchParams(window.location.search);
  const urlTable  = urlParams.get('table');
  if (urlTable) {
    setTableSession(urlTable);
    // Clean URL without reloading
    window.history.replaceState({}, '', window.location.pathname);
  }

  // Restore existing session
  const savedTable = localStorage.getItem('tableNumber');
  if (savedTable) {
    updateTableUI(savedTable);
  }

  /* ── Table session helpers ──────────────────────────────────────── */
  function setTableSession(tableNum) {
    localStorage.setItem('tableNumber', tableNum);
    // Generate a unique session ID for this sitting
    const sessionId = 'T' + tableNum + '-' + Date.now().toString().slice(-6);
    localStorage.setItem('tableSessionId', sessionId);
    updateTableUI(tableNum);
  }

  function updateTableUI(tableNum) {
    if (heroTable) heroTable.textContent = tableNum;
    if (tableBadge) {
      tableBadge.style.display = 'inline-flex';
      tableBadge.className = 'table-session-badge';
      tableBadge.innerHTML = `
        <i class="fas fa-chair" style="font-size:12px;"></i>
        Table ${tableNum}
        <button class="leave-btn" onclick="leaveTable()" title="Leave table">✕</button>
      `;
    }
    if (scanBtn) {
      scanBtn.innerHTML = `<i class="fas fa-qrcode"></i> Table ${tableNum}`;
      scanBtn.style.background = '#2998C6';
    }
  }

  window.leaveTable = function() {
    if (!confirm('Leave this table? Your session history will be cleared from this device.')) return;

    // Clear table-specific session history (keeps admin orders intact)
    const sessionId = localStorage.getItem('tableSessionId');
    if (sessionId) {
      const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || [];
      // Mark session orders as "archived" so history hides them, but admin keeps them
      const updated = allOrders.map(o => {
        if (o.tableSessionId === sessionId) return { ...o, sessionCleared: true };
        return o;
      });
      localStorage.setItem('foodcourt_orders', JSON.stringify(updated));
    }

    localStorage.removeItem('tableNumber');
    localStorage.removeItem('tableSessionId');
    localStorage.removeItem('smallCloudCart');
    localStorage.removeItem('goldenBowlCart');

    if (heroTable) heroTable.textContent = '--';
    if (tableBadge) tableBadge.style.display = 'none';
    if (scanBtn) {
      scanBtn.innerHTML = `<i class="fas fa-qrcode"></i> Scan Table`;
      scanBtn.style.background = '';
    }

    alert('✅ You have left the table. Thank you for dining with us!');
  };

  /* ── QR Modal ───────────────────────────────────────────────────── */
  let pendingTable = null;
  let qrInstance   = null;

  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      document.getElementById('qr-modal-overlay').classList.add('show');
      const current = localStorage.getItem('tableNumber');
      if (current) {
        document.getElementById('table-input').value = current;
        generateTableQR();
      }
    });
  }

  window.closeQRModal = function() {
    document.getElementById('qr-modal-overlay').classList.remove('show');
    pendingTable = null;
  };

  // Close on backdrop click
  document.getElementById('qr-modal-overlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeQRModal();
  });

  window.generateTableQR = function() {
    const input = document.getElementById('table-input').value.trim();
    if (!input) return;

    pendingTable = input;
    const wrapper = document.getElementById('qr-canvas-wrapper');
    wrapper.innerHTML = '';

    // Build the URL the QR code encodes (what staff would print per table)
    const baseUrl = window.location.origin + window.location.pathname;
    const qrUrl   = `${baseUrl}?table=${encodeURIComponent(input)}`;

    // Generate QR code
    if (qrInstance) { try { qrInstance.clear(); } catch(e) {} }
    const div = document.createElement('div');
    wrapper.appendChild(div);

    qrInstance = new QRCode(div, {
      text: qrUrl,
      width: 160, height: 160,
      colorDark: '#154C63',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });

    const label = document.createElement('p');
    label.style.cssText = 'margin-top:8px; font-size:12px; color:#999;';
    label.textContent = `Table ${input}`;
    wrapper.appendChild(label);

    document.getElementById('confirm-table-btn').disabled = false;
  };

  window.confirmTable = function() {
    if (!pendingTable) return;
    setTableSession(pendingTable);
    closeQRModal();
    alert(`✅ You are now seated at Table ${pendingTable}. Enjoy your meal!`);
  };

  /* ── Category Filter ─────────────────────────────────────────────── */
  const catButtons = document.querySelectorAll('.cat-btn');
  const stallCards = document.querySelectorAll('.stall-card');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      stallCards.forEach(card => {
        card.classList.toggle('hidden', category !== 'all' && card.dataset.category !== category);
      });
    });
  });

  /* ── Cart helpers ────────────────────────────────────────────────── */
  const getCart   = () => JSON.parse(localStorage.getItem('myCart') || localStorage.getItem('cart')) || [];
  const saveCart  = (c) => {
    localStorage.setItem('myCart', JSON.stringify(c));
    localStorage.setItem('cart',   JSON.stringify(c));
  };
  const cartBadge = document.getElementById('cartBadge');
  const updateBadge = () => {
    const count = getCart().reduce((s, i) => s + (i.qty || i.quantity), 0);
    if (cartBadge) cartBadge.textContent = count;
  };

  const addToCart = (name, price, stall) => {
    const cart = getCart();
    const existing = cart.find(i => i.name === name && i.stall === stall);
    if (existing) existing.quantity++;
    else cart.push({ id: Date.now(), name, price: parseFloat(price), stall, quantity: 1 });
    saveCart(cart);
    updateBadge();
    alert(`🛒 Added: ${name} (RM${price})`);
  };

  document.querySelectorAll('.reorder-chip').forEach(chip => {
    chip.addEventListener('click', () => addToCart(chip.dataset.item, chip.dataset.price, 'Quick Reorder'));
  });

  updateBadge();

  /* ── Hero Slideshow ──────────────────────────────────────────────── */
  let slideIndex = 0;
  let slideInterval;
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.dot');

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
  }
  function nextSlide() {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlide(slideIndex);
  }
  window.currentSlide = (n) => {
    slideIndex = n - 1;
    showSlide(slideIndex);
    resetInterval();
  };
  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }
  if (slides.length > 0) {
    resetInterval();
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => clearInterval(slideInterval));
      hero.addEventListener('mouseleave', resetInterval);
    }
  }
});