// André da Empada - Frontend Application Logic
// Baseado nas skills: ui-ux-pro-max, brazilian-payments-pix, whatsapp-conversion-funnel

(function () {
  'use strict';

  // State
  const state = {
    products: window.ANDRE_PRODUCTS || [],
    groups: window.ANDRE_GROUPS || {},
    cart: JSON.parse(localStorage.getItem('andre_cart') || '[]'),
    activeCategory: 'all',
    activeFilter: 'all',
    searchQuery: '',
    currentModalProduct: null,
    modalQuantity: 1,
    modalSelectedOptions: {},
    modalNotes: '',
    deliveryType: 'delivery', // 'delivery' or 'retirada'
    neighborhood: 'Brigadeiro Faria Lima',
    neighborhoodFees: {
      'Brigadeiro Faria Lima': 5.0,
      'Centro': 7.0,
      'Morada do Sol': 6.0,
      'Cecap': 6.0,
      'Itaici': 10.0,
      'Parque Ecológico': 8.0,
      'Jardim Morumbi': 6.0,
      'Outro Bairro (Indaiatuba)': 7.5
    },
    couponCode: '',
    discountAmount: 0,
    paymentMethod: 'pix',
    pixTimer: 900, // 15 minutes
    pixTimerInterval: null
  };

  // Helper: Format BRL currency
  function formatMoney(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Helper: Parse Brazilian price string ("R$ 8,50", "A partir de R$ 13,00")
  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const clean = priceStr
      .replace(/A partir de/gi, '')
      .replace(/R\$/gi, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  }

  // Toast Notification
  function showToast(message, icon = '✓') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<span style="background:var(--color-primary-yellow); color:var(--color-primary-burgundy); border-radius:50%; width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // Save Cart to LocalStorage
  function persistCart() {
    localStorage.setItem('andre_cart', JSON.stringify(state.cart));
    updateCartUI();
  }

  // Check Open/Closed Hours (Indaiatuba: Ter-Dom 18:00 - 23:30)
  function updateBusinessHours() {
    const now = new Date();
    // Brazil Timezone UTC-3
    const utcHours = now.getUTCHours();
    const brHours = (utcHours - 3 + 24) % 24;
    const brMinutes = now.getUTCMinutes();
    const brDay = now.getUTCDay(); // 0 is Sunday, 1 is Monday

    const pill = document.getElementById('status-pill');
    if (!pill) return;

    // Monday is closed (Day 1)
    const isMonday = brDay === 1;
    const totalMinutes = brHours * 60 + brMinutes;
    const openMinutes = 18 * 60; // 18:00
    const closeMinutes = 23 * 60 + 30; // 23:30

    const isOpen = !isMonday && (totalMinutes >= openMinutes && totalMinutes <= closeMinutes);

    if (isOpen) {
      pill.innerHTML = `<span class="status-dot"></span> <span>Aberto Agora • Entrega até 23h30</span>`;
      pill.style.background = 'rgba(37, 211, 102, 0.2)';
    } else {
      pill.innerHTML = `<span class="status-dot" style="background:#F59E0B; box-shadow:0 0 8px #F59E0B;"></span> <span>Abre às 18h • Aceitando Pré-Pedidos</span>`;
      pill.style.background = 'rgba(245, 158, 11, 0.2)';
    }
  }

  // Render Category Navigation Tabs
  function renderCategoryTabs() {
    const tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) return;

    let totalAllProducts = state.products.reduce((acc, cat) => acc + cat.products.length, 0);

    let html = `
      <button class="category-tab-btn ${state.activeCategory === 'all' ? 'active' : ''}" data-cat="all">
        Todos <span class="category-badge-count">${totalAllProducts}</span>
      </button>
    `;

    state.products.forEach(cat => {
      const isSelected = state.activeCategory === cat.name;
      html += `
        <button class="category-tab-btn ${isSelected ? 'active' : ''}" data-cat="${cat.name}">
          ${cat.name} <span class="category-badge-count">${cat.products.length}</span>
        </button>
      `;
    });

    tabsContainer.innerHTML = html;

    // Event listeners
    tabsContainer.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.getAttribute('data-cat');
        renderCategoryTabs();
        renderProductsCatalog();

        // Scroll into view if specific category
        if (state.activeCategory !== 'all') {
          const el = document.getElementById(`cat-${slugify(state.activeCategory)}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function slugify(text) {
    return text.toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
  }

  // Render Products Catalog
  function renderProductsCatalog() {
    const catalogContainer = document.getElementById('catalog-content');
    if (!catalogContainer) return;

    const query = state.searchQuery.toLowerCase().trim();

    let filteredCategories = state.products.map(cat => {
      // If a specific category tab is selected and not 'all'
      if (state.activeCategory !== 'all' && state.activeCategory !== cat.name) {
        return null;
      }

      let prods = cat.products.filter(p => {
        // Search filter
        if (query) {
          const matchName = p.name.toLowerCase().includes(query);
          const matchDesc = p.description && p.description.toLowerCase().includes(query);
          const matchCat = cat.name.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Tag filter
        if (state.activeFilter === 'veg') {
          return p.name.toLowerCase().includes('vegetariana') || p.name.toLowerCase().includes('palmito') || p.name.toLowerCase().includes('queijo');
        }
        if (state.activeFilter === 'bestseller') {
          return p.name.includes('Camarão') || p.name.includes('Costela') || p.name.includes('Frango com Catupiry') || p.name.includes('X-Tudo') || p.name.includes('Quarteto');
        }
        if (state.activeFilter === 'combos') {
          return cat.name.includes('Combos');
        }
        if (state.activeFilter === 'empadoes') {
          return cat.name.includes('Empadão');
        }

        return true;
      });

      return prods.length > 0 ? { name: cat.name, products: prods } : null;
    }).filter(Boolean);

    if (filteredCategories.length === 0) {
      catalogContainer.innerHTML = `
        <div style="text-align:center; padding: 60px 20px; background:#FFF; border-radius:var(--radius-lg); border:2px dashed var(--color-border); max-width:600px; margin:0 auto;">
          <div style="font-size:3rem; margin-bottom:12px;">🥧🔍</div>
          <h3 style="font-size:1.5rem; margin-bottom:8px;">Nenhum produto encontrado</h3>
          <p style="color:var(--color-text-muted); margin-bottom:16px;">Não encontramos nenhum item correspondente a "<strong>${state.searchQuery}</strong>".</p>
          <button class="btn-primary" id="btn-reset-search" style="padding:10px 20px; font-size:0.9rem;">Limpar Busca e Filtros</button>
        </div>
      `;
      const resetBtn = document.getElementById('btn-reset-search');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.searchQuery = '';
          state.activeCategory = 'all';
          state.activeFilter = 'all';
          const input = document.getElementById('search-input');
          if (input) input.value = '';
          renderCategoryTabs();
          renderProductsCatalog();
        });
      }
      return;
    }

    let html = '';
    filteredCategories.forEach(cat => {
      const catSlug = slugify(cat.name);
      html += `
        <div class="category-block" id="cat-${catSlug}">
          <div class="category-header">
            <h2 class="category-title">
              <span>${getCategoryIcon(cat.name)}</span> ${cat.name}
            </h2>
            <span class="category-item-count">${cat.products.length} itens</span>
          </div>
          <div class="products-grid">
            ${cat.products.map(p => renderProductCard(p, cat.name)).join('')}
          </div>
        </div>
      `;
    });

    catalogContainer.innerHTML = html;

    // Attach click events to card buttons
    catalogContainer.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prodName = btn.getAttribute('data-name');
        const catName = btn.getAttribute('data-cat');
        const prod = findProduct(catName, prodName);
        if (prod) openProductModal(prod, catName);
      });
    });
  }

  function getCategoryIcon(catName) {
    if (catName.includes('Empadas Salgadas')) return '🥧';
    if (catName.includes('Empadas Doces')) return '🍯';
    if (catName.includes('Empadão')) return '🥘';
    if (catName.includes('Assados')) return '🥐';
    if (catName.includes('Fritos')) return '🍗';
    if (catName.includes('Caldos')) return '🥣';
    if (catName.includes('PASTÉIS')) return '🥟';
    if (catName.includes('Macarrão')) return '🍝';
    if (catName.includes('Lanches')) return '🍔';
    if (catName.includes('Porções')) return '🍟';
    if (catName.includes('Combos')) return '⭐';
    if (catName.includes('Bolo')) return '🍰';
    if (catName.includes('Bebidas')) return '🥤';
    if (catName.includes('Doces')) return '🍬';
    if (catName.includes('Molhos')) return '🥫';
    return '🍽️';
  }

  function renderProductCard(p, catName) {
    const isEsgotado = p.status.toLowerCase().includes('esgotado') || p.status.toLowerCase().includes('falta');
    const isCatupiry = p.name.includes('Catupiry') || (p.description && p.description.includes('Catupiry'));
    const isVeg = p.name.toLowerCase().includes('vegetariana');
    const isCombo = catName.includes('Combos');
    const isEmpadao = catName.includes('Empadão');

    let badgeHtml = '';
    if (isEsgotado) {
      badgeHtml += `<span class="pill-badge badge-esgotado">Esgotado</span>`;
    }
    if (isCatupiry) {
      badgeHtml += `<span class="pill-badge badge-catupiry">100% Catupiry Original</span>`;
    }
    if (isVeg) {
      badgeHtml += `<span class="pill-badge badge-veg">🌱 Vegetariano</span>`;
    }
    if (isEmpadao) {
      badgeHtml += `<span class="pill-badge" style="background:#FEF3C7; color:#92400E;">Serve 2 a 3 pessoas</span>`;
    }

    return `
      <div class="product-card" id="card-${slugify(p.name)}">
        <div class="product-badges-row">${badgeHtml}</div>
        <div class="product-header">
          <h3 class="product-title">${p.name}</h3>
        </div>
        ${p.description ? `<p class="product-desc">${p.description}</p>` : `<p class="product-desc" style="color:var(--color-text-light); font-style:italic;">Receita caseira exclusiva com ingredientes nobres.</p>`}
        <div class="product-footer">
          <span class="product-price">${p.price}</span>
          <button class="btn-add-item" data-name="${escapeHtml(p.name)}" data-cat="${escapeHtml(catName)}" ${isEsgotado ? 'disabled' : ''}>
            ${isEsgotado ? 'Esgotado' : (p.groups ? 'Personalizar' : 'Adicionar')} +
          </button>
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function findProduct(catName, prodName) {
    const cat = state.products.find(c => c.name === catName);
    if (!cat) return null;
    return cat.products.find(p => p.name === prodName);
  }

  // Open Customization Modal
  function openProductModal(product, categoryName) {
    state.currentModalProduct = { ...product, categoryName };
    state.modalQuantity = 1;
    state.modalSelectedOptions = {};
    state.modalNotes = '';

    const modal = document.getElementById('product-modal');
    if (!modal) return;

    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-desc').textContent = product.description || 'Receita artesanal feita com todo o carinho e ingredientes de alta qualidade.';
    document.getElementById('modal-base-price').textContent = product.price;

    const optionsContainer = document.getElementById('modal-options-container');
    optionsContainer.innerHTML = '';

    // Parse group IDs (e.g. "G01", "G03, G01, G04")
    const groupIds = (product.groups || '')
      .split(',')
      .map(g => g.trim())
      .filter(g => g && state.groups[g]);

    // Deduplicate group IDs while preserving order
    const uniqueGroups = [...new Set(groupIds)];

    if (uniqueGroups.length > 0) {
      uniqueGroups.forEach(gid => {
        const group = state.groups[gid];
        const groupEl = document.createElement('div');
        groupEl.className = 'options-group-box';

        const isRequired = group.rule && group.rule.toLowerCase().includes('obrigatório');
        const isSingleChoice = group.rule && (group.rule.includes('Escolha 1') || group.options.length === 2 && group.options[0].name === 'Sim');

        groupEl.innerHTML = `
          <div class="group-title">${group.title} ${isRequired ? '<span style="color:var(--color-primary-burgundy); font-size:0.75rem;">(Obrigatório)</span>' : ''}</div>
          <div class="group-rule">${group.rule || 'Escolha suas opções:'}</div>
          <div class="options-list">
            ${group.options.map((opt, idx) => {
              const isDefaultSim = gid === 'G01' && opt.name === 'Sim';
              const inputType = isSingleChoice ? 'radio' : 'checkbox';
              const inputName = `group_${gid}`;
              const optId = `opt_${gid}_${idx}`;
              return `
                <div class="option-item-row">
                  <label for="${optId}">
                    <input type="${inputType}" id="${optId}" name="${inputName}" value="${opt.name}" data-group="${gid}" data-price="${opt.price || ''}" ${isDefaultSim ? 'checked' : ''}>
                    <span>${opt.name}</span>
                  </label>
                  <span style="font-weight:700; font-size:0.85rem; color:var(--color-primary-burgundy);">${opt.price && opt.price !== 'Sem acréscimo exibido' ? opt.price : ''}</span>
                </div>
              `;
            }).join('')}
          </div>
        `;
        optionsContainer.appendChild(groupEl);
      });
    } else {
      optionsContainer.innerHTML = `
        <div style="background:var(--color-bg-cream); padding:14px; border-radius:var(--radius-sm); font-size:0.88rem; color:var(--color-text-muted);">
          Este item não requer personalizações adicionais. Você pode adicionar observações abaixo caso queira!
        </div>
      `;
    }

    // Modal Qty
    document.getElementById('modal-qty').textContent = state.modalQuantity;
    updateModalTotalPrice();

    modal.classList.add('open');
  }

  function updateModalTotalPrice() {
    if (!state.currentModalProduct) return;
    const basePrice = parsePrice(state.currentModalProduct.price);
    let addonsTotal = 0;

    // Sum checked options with price
    const checkedInputs = document.querySelectorAll('#modal-options-container input:checked');
    checkedInputs.forEach(input => {
      const priceStr = input.getAttribute('data-price');
      if (priceStr && priceStr.includes('R$')) {
        addonsTotal += parsePrice(priceStr);
      }
    });

    const total = (basePrice + addonsTotal) * state.modalQuantity;
    document.getElementById('modal-total-btn-price').textContent = formatMoney(total);
  }

  // Add Item From Modal to Cart
  function addModalItemToCart() {
    if (!state.currentModalProduct) return;

    const basePrice = parsePrice(state.currentModalProduct.price);
    let addonsTotal = 0;
    const selectedOptionsList = [];

    const checkedInputs = document.querySelectorAll('#modal-options-container input:checked');
    checkedInputs.forEach(input => {
      const groupGid = input.getAttribute('data-group');
      const optName = input.value;
      const priceStr = input.getAttribute('data-price');
      let extra = 0;
      if (priceStr && priceStr.includes('R$')) {
        extra = parsePrice(priceStr);
        addonsTotal += extra;
      }
      selectedOptionsList.push({
        group: state.groups[groupGid] ? state.groups[groupGid].title : groupGid,
        name: optName,
        extraPrice: extra
      });
    });

    const notes = document.getElementById('modal-notes-input') ? document.getElementById('modal-notes-input').value.trim() : '';

    const cartItem = {
      cartId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: state.currentModalProduct.name,
      category: state.currentModalProduct.categoryName,
      unitPrice: basePrice + addonsTotal,
      quantity: state.modalQuantity,
      options: selectedOptionsList,
      notes: notes
    };

    state.cart.push(cartItem);
    persistCart();
    closeProductModal();
    showToast(`"${cartItem.name}" adicionado ao seu pedido!`, '🥟');
  }

  function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.remove('open');
    state.currentModalProduct = null;
  }

  // Cart Slide-Over UI
  function openCartDrawer() {
    const drawerBackdrop = document.getElementById('cart-drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.classList.add('open');
      renderCartDrawerItems();
    }
  }

  function closeCartDrawer() {
    const drawerBackdrop = document.getElementById('cart-drawer-backdrop');
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
  }

  function updateCartUI() {
    const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = totalCount;

    const navTotal = document.getElementById('cart-nav-total');
    if (navTotal) navTotal.textContent = formatMoney(subtotal);

    renderCartDrawerItems();
  }

  function renderCartDrawerItems() {
    const container = document.getElementById('cart-drawer-items');
    if (!container) return;

    if (state.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:var(--color-text-muted);">
          <div style="font-size:3rem; margin-bottom:12px;">🧺</div>
          <h4 style="font-size:1.2rem; color:var(--color-primary-burgundy); margin-bottom:6px;">Seu carrinho está vazio</h4>
          <p style="font-size:0.88rem; margin-bottom:18px;">Que tal escolher uma empada quentinha ou um pastel artesanal?</p>
          <button class="btn-primary" id="btn-browse-empty" style="padding:10px 20px; font-size:0.9rem;">Ver Cardápio</button>
        </div>
      `;
      const btnBrowse = document.getElementById('btn-browse-empty');
      if (btnBrowse) {
        btnBrowse.addEventListener('click', () => {
          closeCartDrawer();
          const cat = document.getElementById('catalog-section');
          if (cat) cat.scrollIntoView({ behavior: 'smooth' });
        });
      }
      updateCartDrawerTotals(0);
      return;
    }

    let html = '';
    state.cart.forEach((item, index) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      html += `
        <div class="cart-item-card">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            ${item.options && item.options.length > 0 ? `
              <div class="cart-item-meta">
                ${item.options.map(o => `• ${o.name}${o.extraPrice > 0 ? ` (+${formatMoney(o.extraPrice)})` : ''}`).join('<br>')}
              </div>
            ` : ''}
            ${item.notes ? `<div class="cart-item-meta" style="color:var(--color-accent-orange);">Obs: ${item.notes}</div>` : ''}
            <div class="cart-item-price">${formatMoney(itemSubtotal)} <span style="font-size:0.75rem; color:var(--color-text-light);">(${formatMoney(item.unitPrice)} un.)</span></div>
          </div>
          <div class="cart-item-actions">
            <button class="btn-remove-item" data-index="${index}" style="color:var(--color-error); font-size:0.8rem; font-weight:700; padding:4px;">✕ Remover</button>
            <div class="qty-stepper" style="border-width:1px;">
              <button class="qty-btn btn-cart-dec" data-index="${index}" style="padding:4px 8px; font-size:0.9rem;">-</button>
              <span class="qty-display" style="padding:0 8px; font-size:0.85rem;">${item.quantity}</span>
              <button class="qty-btn btn-cart-inc" data-index="${index}" style="padding:4px 8px; font-size:0.9rem;">+</button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach listeners
    container.querySelectorAll('.btn-cart-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        if (state.cart[idx].quantity > 1) {
          state.cart[idx].quantity--;
        } else {
          state.cart.splice(idx, 1);
        }
        persistCart();
      });
    });

    container.querySelectorAll('.btn-cart-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        state.cart[idx].quantity++;
        persistCart();
      });
    });

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        state.cart.splice(idx, 1);
        persistCart();
        showToast('Item removido do pedido', '✕');
      });
    });

    const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    updateCartDrawerTotals(subtotal);
  }

  function updateCartDrawerTotals(subtotal) {
    const deliveryFee = state.deliveryType === 'delivery' ? (state.neighborhoodFees[state.neighborhood] || 6.0) : 0;
    const discount = state.discountAmount;
    const finalTotal = Math.max(0, subtotal + deliveryFee - discount);

    const subEl = document.getElementById('cart-subtotal-val');
    const feeEl = document.getElementById('cart-delivery-val');
    const discEl = document.getElementById('cart-discount-val');
    const totalEl = document.getElementById('cart-total-val');

    if (subEl) subEl.textContent = formatMoney(subtotal);
    if (feeEl) feeEl.textContent = state.deliveryType === 'delivery' ? formatMoney(deliveryFee) : 'Grátis (Retirada)';
    if (discEl) discEl.textContent = discount > 0 ? `- ${formatMoney(discount)}` : 'R$ 0,00';
    if (totalEl) totalEl.textContent = formatMoney(finalTotal);

    const btnCheckout = document.getElementById('btn-go-to-checkout');
    if (btnCheckout) {
      btnCheckout.disabled = state.cart.length === 0;
    }
  }

  // Open Checkout Modal
  function openCheckoutModal() {
    closeCartDrawer();
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    modal.classList.add('open');
    updateCheckoutSummary();
    startPixTimer();
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('open');
    if (state.pixTimerInterval) clearInterval(state.pixTimerInterval);
  }

  function updateCheckoutSummary() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const deliveryFee = state.deliveryType === 'delivery' ? (state.neighborhoodFees[state.neighborhood] || 6.0) : 0;
    const finalTotal = Math.max(0, subtotal + deliveryFee - state.discountAmount);

    const sumVal = document.getElementById('checkout-total-display');
    if (sumVal) sumVal.textContent = formatMoney(finalTotal);

    // Update PIX amount copy-paste string
    const pixPayloadEl = document.getElementById('pix-payload-text');
    if (pixPayloadEl) {
      const pixPayload = `00020126580014br.gov.bcb.pix013646134717000127520400005303986540${finalTotal.toFixed(2)}5802BR5915ANDRE DA EMPADA6010INDAIATUBA62070503***6304`;
      pixPayloadEl.textContent = pixPayload;
    }
  }

  // Pix 15-Minute Expiration Timer (Rule from brazilian-payments-pix skill)
  function startPixTimer() {
    if (state.pixTimerInterval) clearInterval(state.pixTimerInterval);
    state.pixTimer = 900; // 15 mins

    const timerDisplay = document.getElementById('pix-countdown');
    if (!timerDisplay) return;

    state.pixTimerInterval = setInterval(() => {
      state.pixTimer--;
      if (state.pixTimer <= 0) {
        clearInterval(state.pixTimerInterval);
        timerDisplay.textContent = '00:00 (Expirado. Gere novamente)';
        timerDisplay.style.color = '#DC2626';
        return;
      }
      const mins = Math.floor(state.pixTimer / 60);
      const secs = state.pixTimer % 60;
      timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
  }

  // Build WhatsApp Final Message and Send
  function submitWhatsAppOrder() {
    const customerName = document.getElementById('checkout-name') ? document.getElementById('checkout-name').value.trim() : '';
    const customerPhone = document.getElementById('checkout-phone') ? document.getElementById('checkout-phone').value.trim() : '';
    const street = document.getElementById('checkout-street') ? document.getElementById('checkout-street').value.trim() : '';
    const number = document.getElementById('checkout-num') ? document.getElementById('checkout-num').value.trim() : '';
    const complement = document.getElementById('checkout-comp') ? document.getElementById('checkout-comp').value.trim() : '';
    const change = document.getElementById('checkout-change') ? document.getElementById('checkout-change').value.trim() : '';

    if (!customerName) {
      alert('Por favor, informe seu nome para o pedido.');
      document.getElementById('checkout-name').focus();
      return;
    }

    if (state.deliveryType === 'delivery' && (!street || !number)) {
      alert('Por favor, informe o endereço completo para a entrega.');
      return;
    }

    const orderId = '#AE-' + Math.floor(1000 + Math.random() * 9000);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const deliveryFee = state.deliveryType === 'delivery' ? (state.neighborhoodFees[state.neighborhood] || 6.0) : 0;
    const finalTotal = Math.max(0, subtotal + deliveryFee - state.discountAmount);

    let itemsText = '';
    state.cart.forEach(item => {
      itemsText += `• ${item.quantity}x ${item.name} (${formatMoney(item.unitPrice * item.quantity)})\n`;
      if (item.options && item.options.length > 0) {
        item.options.forEach(opt => {
          itemsText += `   └ ${opt.name}${opt.extraPrice > 0 ? ` (+${formatMoney(opt.extraPrice)})` : ''}\n`;
        });
      }
      if (item.notes) {
        itemsText += `   └ Obs: ${item.notes}\n`;
      }
    });

    let paymentDesc = '';
    if (state.paymentMethod === 'pix') {
      paymentDesc = 'PIX Instantâneo (CNPJ: 46.134.717/0001-27)';
    } else if (state.paymentMethod === 'cartao') {
      paymentDesc = 'Cartão de Débito/Crédito na Entrega';
    } else {
      paymentDesc = `Dinheiro (Troco para: ${change ? 'R$ ' + change : 'Não precisa'})`;
    }

    let addressBlock = '';
    if (state.deliveryType === 'delivery') {
      addressBlock = `📍 *ENTREGA EM INDAIATUBA:*\nEndereço: ${street}, Nº ${number}\nBairro: ${state.neighborhood}\n${complement ? 'Complemento: ' + complement + '\n' : ''}`;
    } else {
      addressBlock = `🏬 *MODALIDADE:* Retirada no Balcão\nAv. Geraldo Hackmann, 742 - Indaiatuba/SP\n`;
    }

    const fullMessage = `🥟 *NOVO PEDIDO - ANDRÉ DA EMPADA* 🥟\n\n` +
      `Código: *${orderId}*\n` +
      `Cliente: *${customerName}*\n` +
      `Telefone: ${customerPhone || 'Informado no zap'}\n\n` +
      `${addressBlock}\n` +
      `📋 *ITENS DO PEDIDO:*\n${itemsText}\n` +
      `──────────────────────────\n` +
      `Subtotal: ${formatMoney(subtotal)}\n` +
      `Taxa de Entrega: ${state.deliveryType === 'delivery' ? formatMoney(deliveryFee) : 'Grátis'}\n` +
      (state.discountAmount > 0 ? `Desconto Cupom: -${formatMoney(state.discountAmount)}\n` : '') +
      `*TOTAL DO PEDIDO: ${formatMoney(finalTotal)}*\n` +
      `──────────────────────────\n` +
      `Forma de Pagamento: *${paymentDesc}*\n\n` +
      `Fala comigo, André! Aguardo a confirmação da preparação! 🙏`;

    const encoded = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/5519989490912?text=${encoded}`;

    // Clear cart after submitting
    state.cart = [];
    persistCart();
    closeCheckoutModal();

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    showToast('Pedido gerado! Abrindo seu WhatsApp...', '🚀');
  }

  // Initialize Application
  function init() {
    updateBusinessHours();
    setInterval(updateBusinessHours, 60000); // Check every minute

    renderCategoryTabs();
    renderProductsCatalog();
    updateCartUI();

    // Search input listener (debounced)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let debounceTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          state.searchQuery = e.target.value;
          renderProductsCatalog();
        }, 180);
      });
    }

    // Filter Chips
    document.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeFilter = chip.getAttribute('data-filter');
        renderProductsCatalog();
      });
    });

    // Cart Drawer triggers
    const btnCart = document.getElementById('btn-cart-nav');
    if (btnCart) btnCart.addEventListener('click', openCartDrawer);

    const btnCloseCart = document.getElementById('btn-close-cart');
    if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartDrawer);

    const drawerBackdrop = document.getElementById('cart-drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', (e) => {
        if (e.target === drawerBackdrop) closeCartDrawer();
      });
    }

    // Modal Events
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeProductModal);

    const productModal = document.getElementById('product-modal');
    if (productModal) {
      productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
      });
    }

    // Modal Qty Stepper
    const btnModalDec = document.getElementById('btn-modal-dec');
    const btnModalInc = document.getElementById('btn-modal-inc');
    if (btnModalDec) {
      btnModalDec.addEventListener('click', () => {
        if (state.modalQuantity > 1) {
          state.modalQuantity--;
          document.getElementById('modal-qty').textContent = state.modalQuantity;
          updateModalTotalPrice();
        }
      });
    }
    if (btnModalInc) {
      btnModalInc.addEventListener('click', () => {
        state.modalQuantity++;
        document.getElementById('modal-qty').textContent = state.modalQuantity;
        updateModalTotalPrice();
      });
    }

    // Modal options check change
    const modalOptions = document.getElementById('modal-options-container');
    if (modalOptions) {
      modalOptions.addEventListener('change', updateModalTotalPrice);
    }

    // Add to Cart Button in Modal
    const btnModalAdd = document.getElementById('btn-modal-add');
    if (btnModalAdd) btnModalAdd.addEventListener('click', addModalItemToCart);

    // Delivery / Retirada Toggle in Cart
    const toggleDelivery = document.getElementById('btn-toggle-delivery');
    const toggleRetirada = document.getElementById('btn-toggle-retirada');
    if (toggleDelivery && toggleRetirada) {
      toggleDelivery.addEventListener('click', () => {
        state.deliveryType = 'delivery';
        toggleDelivery.classList.add('active');
        toggleRetirada.classList.remove('active');
        document.getElementById('neighborhood-selector-box').style.display = 'block';
        updateCartDrawerTotals(state.cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0));
      });
      toggleRetirada.addEventListener('click', () => {
        state.deliveryType = 'retirada';
        toggleRetirada.classList.add('active');
        toggleDelivery.classList.remove('active');
        document.getElementById('neighborhood-selector-box').style.display = 'none';
        updateCartDrawerTotals(state.cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0));
      });
    }

    // Neighborhood select
    const neighSelect = document.getElementById('neighborhood-select');
    if (neighSelect) {
      neighSelect.addEventListener('change', (e) => {
        state.neighborhood = e.target.value;
        updateCartDrawerTotals(state.cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0));
      });
    }

    // Coupon code apply
    const btnApplyCoupon = document.getElementById('btn-apply-coupon');
    const couponInput = document.getElementById('coupon-input');
    if (btnApplyCoupon && couponInput) {
      btnApplyCoupon.addEventListener('click', () => {
        const code = couponInput.value.toUpperCase().trim();
        const subtotal = state.cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
        if (code === 'FALACOMIGO') {
          state.discountAmount = 5.0;
          showToast('Cupom FALACOMIGO aplicado! R$ 5,00 OFF', '🎉');
        } else if (code === 'PRIMEIRACOMPRA') {
          state.discountAmount = subtotal * 0.10;
          showToast('Cupom 10% OFF aplicado!', '🎉');
        } else if (code) {
          alert('Cupom inválido ou expirado. Tente "FALACOMIGO".');
          state.discountAmount = 0;
        }
        updateCartDrawerTotals(subtotal);
      });
    }

    // Checkout Modal buttons
    const btnGoCheckout = document.getElementById('btn-go-to-checkout');
    if (btnGoCheckout) btnGoCheckout.addEventListener('click', openCheckoutModal);

    const btnCloseCheckout = document.getElementById('btn-close-checkout');
    if (btnCloseCheckout) btnCloseCheckout.addEventListener('click', closeCheckoutModal);

    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
      checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeCheckoutModal();
      });
    }

    // Payment radio cards
    document.querySelectorAll('.payment-radio-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.payment-radio-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.paymentMethod = card.getAttribute('data-method');

        const pixBox = document.getElementById('pix-checkout-box');
        const cashBox = document.getElementById('cash-change-box');

        if (state.paymentMethod === 'pix') {
          if (pixBox) pixBox.style.display = 'block';
          if (cashBox) cashBox.style.display = 'none';
        } else if (state.paymentMethod === 'dinheiro') {
          if (pixBox) pixBox.style.display = 'none';
          if (cashBox) cashBox.style.display = 'block';
        } else {
          if (pixBox) pixBox.style.display = 'none';
          if (cashBox) cashBox.style.display = 'none';
        }
      });
    });

    // Pix Copy Button
    const btnCopyPix = document.getElementById('btn-copy-pix');
    if (btnCopyPix) {
      btnCopyPix.addEventListener('click', () => {
        const text = document.getElementById('pix-payload-text').textContent;
        navigator.clipboard.writeText(text).then(() => {
          showToast('Código Pix copiado para a área de transferência!', '📋');
          btnCopyPix.textContent = 'Copiado com Sucesso! ✓';
          setTimeout(() => {
            btnCopyPix.textContent = 'Copiar Código Pix Copia e Cola';
          }, 3000);
        }).catch(() => {
          showToast('Selecione e copie o texto acima', '⚠️');
        });
      });
    }

    // WhatsApp Submit
    const btnSubmitOrder = document.getElementById('btn-submit-order');
    if (btnSubmitOrder) btnSubmitOrder.addEventListener('click', submitWhatsAppOrder);

    // Keyboard ESC to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProductModal();
        closeCartDrawer();
        closeCheckoutModal();
      }
    });
  }

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
