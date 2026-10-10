// André da Empada - Sistema de Aplicação e Operações Comerciais
// Arquitetura: Catálogo Artesanal, Carrinho com Upsell, KDS Kanban, Controle de Estoque e Rastreio

(function () {
  'use strict';

  // Banco de Dados em Memória e Persistência
  const defaultOrders = [
    {
      id: '#AE-1082',
      createdAt: new Date(Date.now() - 38 * 60000).toISOString(),
      timestamp: Date.now() - 38 * 60000,
      customerName: 'Mariana Silveira',
      customerPhone: '(19) 99123-4567',
      deliveryType: 'delivery',
      courier: 'Motoboy 1 (Marcos)',
      neighborhood: 'Morada do Sol',
      address: 'Rua das Camélias, 142 - Morada do Sol',
      items: [
        { name: 'Empada de Camarão Especial com Catupiry', quantity: 2, unitPrice: 12.0 },
        { name: 'Empada de Frango com Catupiry Original', quantity: 1, unitPrice: 8.5 },
        { name: 'Coca-Cola Original 350ml Lata', quantity: 2, unitPrice: 6.0 }
      ],
      subtotal: 44.5,
      deliveryFee: 6.0,
      discount: 0,
      total: 50.5,
      paymentMethod: 'pix',
      status: 'pronto'
    },
    {
      id: '#AE-1083',
      createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
      timestamp: Date.now() - 14 * 60000,
      customerName: 'Rodrigo Almeida',
      customerPhone: '(19) 98877-6655',
      deliveryType: 'retirada',
      courier: 'Balcão / Retirada',
      neighborhood: 'Brigadeiro Faria Lima',
      address: 'Retirada no Balcão',
      items: [
        { name: 'Combo Família', quantity: 1, unitPrice: 158.0 }
      ],
      subtotal: 158.0,
      deliveryFee: 0,
      discount: 5.0,
      total: 153.0,
      paymentMethod: 'cartao',
      status: 'forno'
    },
    {
      id: '#AE-1084',
      createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
      timestamp: Date.now() - 4 * 60000,
      customerName: 'Camila Duarte',
      customerPhone: '(19) 97711-2233',
      deliveryType: 'delivery',
      courier: 'Aguardando Despacho',
      neighborhood: 'Centro',
      address: 'Rua 15 de Novembro, 890 - Centro',
      items: [
        { name: 'Empadão de Costela com Catupiry (Serve 2 a 3 pessoas)', quantity: 1, unitPrice: 52.0 },
        { name: 'Guaraná Antarctica 350ml Lata', quantity: 2, unitPrice: 6.0 }
      ],
      subtotal: 64.0,
      deliveryFee: 7.0,
      discount: 0,
      total: 71.0,
      paymentMethod: 'pix',
      status: 'recebido'
    }
  ];

  const state = {
    products: window.ANDRE_PRODUCTS || [],
    groups: window.ANDRE_GROUPS || {},
    cart: JSON.parse(localStorage.getItem('andre_cart') || '[]'),
    orders: JSON.parse(localStorage.getItem('andre_orders') || 'null') || defaultOrders,
    pausedItems: new Set(JSON.parse(localStorage.getItem('andre_paused_items') || '[]')),
    activeCategory: 'all',
    activeFilter: 'all',
    searchQuery: '',
    currentModalProduct: null,
    modalQuantity: 1,
    modalSelectedOptions: {},
    modalNotes: '',
    deliveryType: 'delivery',
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
    pixTimer: 900,
    pixTimerInterval: null,
    activeKDSTab: 'kanban'
  };

  // Garante integridade do modelo de entregador / motoboy em pedidos legados
  state.orders.forEach(order => {
    if (!order.courier) {
      order.courier = order.deliveryType === 'retirada' ? 'Balcão / Retirada' : 'Aguardando Despacho';
    }
  });

  // Helper: Formatação BRL
  function formatMoney(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Helper: Extração de preço numérico
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

  // Helper: Gerador de Slug
  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Notificações Toast
  function showToast(message, badgeText = 'OK') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `
      <span style="background:var(--color-primary-yellow); color:var(--color-primary-burgundy); border-radius:var(--radius-full); padding:2px 8px; font-weight:800; font-size:0.75rem;">${badgeText}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // Sinal Sonoro Sintético para Notificações (Web Audio API)
  function playNotificationAudio(type = 'chime') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'new-order') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // Ignora restrição de reprodução sem interação
    }
  }

  // Persistência de Carrinho
  function persistCart() {
    localStorage.setItem('andre_cart', JSON.stringify(state.cart));
    updateCartUI();
  }

  // Persistência de Pedidos
  function persistOrders() {
    localStorage.setItem('andre_orders', JSON.stringify(state.orders));
  }

  // Persistência de Itens Pausados
  function persistPausedItems() {
    localStorage.setItem('andre_paused_items', JSON.stringify(Array.from(state.pausedItems)));
  }

  // Checagem de Horário Comercial (Indaiatuba: Ter-Dom 18:00 - 23:30)
  function updateBusinessHours() {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const brHours = (utcHours - 3 + 24) % 24;
    const brMinutes = now.getUTCMinutes();
    const brDay = now.getUTCDay();

    const pill = document.getElementById('status-pill');
    if (!pill) return;

    const isMonday = brDay === 1;
    const totalMinutes = brHours * 60 + brMinutes;
    const openMinutes = 18 * 60;
    const closeMinutes = 23 * 60 + 30;

    const isOpen = !isMonday && (totalMinutes >= openMinutes && totalMinutes <= closeMinutes);

    if (isOpen) {
      pill.innerHTML = `<span class="status-dot"></span> <span>Aberto Agora • Atendimento até 23h30</span>`;
      pill.style.background = 'rgba(37, 211, 102, 0.2)';
    } else {
      pill.innerHTML = `<span class="status-dot" style="background:#F59E0B; box-shadow:0 0 8px #F59E0B;"></span> <span>Abre às 18h • Aceitando Pré-Pedidos</span>`;
      pill.style.background = 'rgba(245, 158, 11, 0.2)';
    }
  }

  // Abas de Categorias
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
      const activeClass = state.activeCategory === cat.name ? 'active' : '';
      html += `
        <button class="category-tab-btn ${activeClass}" data-cat="${escapeHtml(cat.name)}">
          ${cat.name} <span class="category-badge-count">${cat.products.length}</span>
        </button>
      `;
    });

    tabsContainer.innerHTML = html;

    tabsContainer.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeCategory = btn.getAttribute('data-cat');
        renderProductsCatalog();

        if (state.activeCategory !== 'all') {
          const targetBlock = document.getElementById('cat-' + slugify(state.activeCategory));
          if (targetBlock) {
            targetBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  // Renderização do Catálogo
  function renderProductsCatalog() {
    const catalogContainer = document.getElementById('catalog-content');
    if (!catalogContainer) return;

    let filteredCategories = [];

    state.products.forEach(cat => {
      if (state.activeCategory !== 'all' && state.activeCategory !== cat.name) {
        return;
      }

      let matchingProducts = cat.products.filter(p => {
        if (state.searchQuery) {
          const q = state.searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesDesc = (p.description || '').toLowerCase().includes(q);
          if (!matchesName && !matchesDesc) return false;
        }

        if (state.activeFilter === 'bestseller') {
          return p.name.includes('Catupiry') || p.name.includes('Camarão') || cat.name.includes('Combos');
        }
        if (state.activeFilter === 'veg') {
          return p.name.toLowerCase().includes('vegetariana') || p.name.toLowerCase().includes('palmito') || p.name.toLowerCase().includes('queijo');
        }
        if (state.activeFilter === 'empadoes') {
          return cat.name.includes('Empadão');
        }
        if (state.activeFilter === 'combos') {
          return cat.name.includes('Combos');
        }

        return true;
      });

      if (matchingProducts.length > 0) {
        filteredCategories.push({
          name: cat.name,
          products: matchingProducts
        });
      }
    });

    if (filteredCategories.length === 0) {
      catalogContainer.innerHTML = `
        <div style="text-align:center; padding:60px 20px; background:#FFFDF9; border:2px dashed var(--color-border); border-radius:var(--radius-lg); margin:30px auto; max-width:600px;">
          <h3 style="font-size:1.4rem; margin-bottom:8px;">Nenhum produto localizado</h3>
          <p style="color:var(--color-text-muted); margin-bottom:16px;">Não encontramos itens para o critério "<strong>${state.searchQuery}</strong>".</p>
          <button class="btn-primary" id="btn-reset-search" style="padding:10px 20px; font-size:0.9rem;">Limpar Filtros</button>
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
            <h2 class="category-title font-display">${cat.name}</h2>
            <span class="category-item-count">${cat.products.length} itens</span>
          </div>
          <div class="products-grid">
            ${cat.products.map(p => renderProductCard(p, cat.name)).join('')}
          </div>
        </div>
      `;
    });

    catalogContainer.innerHTML = html;

    catalogContainer.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodName = btn.getAttribute('data-name');
        const catName = btn.getAttribute('data-cat');
        const prod = findProduct(catName, prodName);
        if (prod) openProductModal(prod, catName);
      });
    });
  }

  // Render do Card de Produto
  function renderProductCard(p, catName) {
    const isPaused = state.pausedItems.has(p.name);
    const isEsgotado = p.status.toLowerCase().includes('esgotado') || p.status.toLowerCase().includes('falta') || isPaused;
    const isCatupiry = p.name.includes('Catupiry') || (p.description && p.description.includes('Catupiry'));
    const isVeg = p.name.toLowerCase().includes('vegetariana');
    const isEmpadao = catName.includes('Empadão');

    let badgeHtml = '';
    if (isEsgotado) {
      badgeHtml += `<span class="pill-badge badge-esgotado">Esgotado</span>`;
    }
    if (isCatupiry) {
      badgeHtml += `<span class="pill-badge badge-catupiry">100% Catupiry Original</span>`;
    }
    if (isVeg) {
      badgeHtml += `<span class="pill-badge badge-veg">Vegetariano</span>`;
    }
    if (isEmpadao) {
      badgeHtml += `<span class="pill-badge" style="background:#FEF3C7; color:#92400E;">Serve 2 a 3 pessoas</span>`;
    }

    return `
      <div class="product-card ${isPaused ? 'is-paused' : ''}" id="card-${slugify(p.name)}">
        <div class="product-badges-row">${badgeHtml}</div>
        <div class="product-header">
          <h3 class="product-title">${p.name}</h3>
        </div>
        ${p.description ? `<p class="product-desc">${p.description}</p>` : `<p class="product-desc" style="color:var(--color-text-light); font-style:italic;">Receita caseira exclusiva com ingredientes nobres.</p>`}
        <div class="product-footer">
          <span class="product-price">${p.price}</span>
          <button class="btn-add-item" data-name="${escapeHtml(p.name)}" data-cat="${escapeHtml(catName)}" ${isEsgotado ? 'disabled' : ''}>
            ${isEsgotado ? 'Indisponível' : (p.groups ? 'Personalizar' : 'Adicionar')} +
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

  // Modal de Personalização
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

    const groupIds = (product.groups || '')
      .split(',')
      .map(g => g.trim())
      .filter(g => g && state.groups[g]);

    const uniqueGroups = [...new Set(groupIds)];

    if (uniqueGroups.length > 0) {
      uniqueGroups.forEach(gid => {
        const group = state.groups[gid];
        const groupEl = document.createElement('div');
        groupEl.className = 'options-group-box';

        const isRequired = group.rule && group.rule.toLowerCase().includes('obrigatório');
        const isSingleChoice = group.rule && (group.rule.includes('Escolha 1') || (group.options.length === 2 && group.options[0].name === 'Sim'));

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
          Este item não requer seleções adicionais. Você pode acrescentar observações abaixo.
        </div>
      `;
    }

    document.getElementById('modal-qty').textContent = state.modalQuantity;
    updateModalTotalPrice();
    modal.classList.add('open');
  }

  function updateModalTotalPrice() {
    if (!state.currentModalProduct) return;
    const basePrice = parsePrice(state.currentModalProduct.price);
    let addonsTotal = 0;

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
    playNotificationAudio('add');
    showToast(`"${cartItem.name}" adicionado ao pedido!`, 'Item Salvo');
  }

  function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.remove('open');
    state.currentModalProduct = null;
  }

  // Carrinho de Compras e Upsell
  function openCartDrawer() {
    const drawerBackdrop = document.getElementById('cart-drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.classList.add('open');
      renderCartDrawerItems();
      renderCartUpsell();
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

    const bottomBadge = document.getElementById('bottom-cart-badge');
    if (bottomBadge) bottomBadge.textContent = totalCount;

    const navTotal = document.getElementById('cart-nav-total');
    if (navTotal) navTotal.textContent = formatMoney(subtotal);

    renderCartDrawerItems();
    renderCartUpsell();
  }

  // Upsell Inteligente no Carrinho
  function renderCartUpsell() {
    const container = document.getElementById('cart-upsell-items');
    const box = document.getElementById('cart-upsell-box');
    if (!container || !box) return;

    if (state.cart.length === 0) {
      box.style.display = 'none';
      return;
    }

    const upsellCandidates = [
      { name: 'Coca-Cola Original 350ml Lata', cat: 'Bebidas', price: 6.0 },
      { name: 'Guaraná Antarctica 350ml Lata', cat: 'Bebidas', price: 6.0 },
      { name: 'Empada Doce de Nutella com Ninho', cat: 'Empadas Doces', price: 13.0 },
      { name: 'Empada Doce de Doce de Leite com Côco', cat: 'Empadas Doces', price: 12.0 }
    ];

    const currentNames = state.cart.map(i => i.name);
    const availableUpsells = upsellCandidates.filter(u => !currentNames.includes(u.name)).slice(0, 2);

    if (availableUpsells.length === 0) {
      box.style.display = 'none';
      return;
    }

    box.style.display = 'block';
    container.innerHTML = availableUpsells.map(item => `
      <div class="cart-upsell-item">
        <div class="cart-upsell-info">
          <div class="cart-upsell-name">${item.name}</div>
          <div class="cart-upsell-price">${formatMoney(item.price)}</div>
        </div>
        <button class="cart-upsell-btn btn-add-upsell" data-name="${escapeHtml(item.name)}" data-price="${item.price}" data-cat="${escapeHtml(item.cat)}">
          + Adicionar
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-add-upsell').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        const price = parseFloat(btn.getAttribute('data-price'));
        const cat = btn.getAttribute('data-cat');

        state.cart.push({
          cartId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: name,
          category: cat,
          unitPrice: price,
          quantity: 1,
          options: [],
          notes: ''
        });

        persistCart();
        playNotificationAudio('add');
        showToast(`${name} adicionado ao pedido!`, 'Upsell');
      });
    });
  }

  function renderCartDrawerItems() {
    const container = document.getElementById('cart-drawer-items');
    if (!container) return;

    if (state.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:var(--color-text-muted);">
          <div style="display:flex; justify-content:center; margin-bottom:12px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-burgundy)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h4 style="font-size:1.15rem; color:var(--color-primary-burgundy); margin-bottom:6px;">Seu carrinho está vazio</h4>
          <p style="font-size:0.86rem; margin-bottom:18px;">Escolha uma empada artesanal quentinha para começar.</p>
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
            <button class="btn-remove-item" data-index="${index}" style="color:var(--color-error); font-size:0.8rem; font-weight:700; padding:4px;">Remover</button>
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
        showToast('Item removido do pedido', 'Atualizado');
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

  // Checkout e Envio de Pedido
  function openCheckoutModal() {
    closeCartDrawer();
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    modal.classList.add('open');

    const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const deliveryFee = state.deliveryType === 'delivery' ? (state.neighborhoodFees[state.neighborhood] || 6.0) : 0;
    const finalTotal = Math.max(0, subtotal + deliveryFee - state.discountAmount);

    const totalDisplay = document.getElementById('checkout-total-display');
    if (totalDisplay) totalDisplay.textContent = formatMoney(finalTotal);

    startPixCountdown();
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('open');
    if (state.pixTimerInterval) clearInterval(state.pixTimerInterval);
  }

  function startPixCountdown() {
    if (state.pixTimerInterval) clearInterval(state.pixTimerInterval);
    state.pixTimer = 900;
    const timerEl = document.getElementById('pix-countdown');

    state.pixTimerInterval = setInterval(() => {
      state.pixTimer--;
      if (state.pixTimer <= 0) {
        clearInterval(state.pixTimerInterval);
        if (timerEl) timerEl.textContent = 'EXPIRADO';
        return;
      }
      const mins = Math.floor(state.pixTimer / 60).toString().padStart(2, '0');
      const secs = (state.pixTimer % 60).toString().padStart(2, '0');
      if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  // Submissão do Pedido (Salva no KDS e Redireciona ao WhatsApp)
  function submitWhatsAppOrder() {
    const customerName = document.getElementById('checkout-name').value.trim();
    const customerPhone = document.getElementById('checkout-phone').value.trim();

    if (!customerName) {
      alert('Por favor, informe seu nome para identificação do pedido.');
      document.getElementById('checkout-name').focus();
      return;
    }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const deliveryFee = state.deliveryType === 'delivery' ? (state.neighborhoodFees[state.neighborhood] || 6.0) : 0;
    const finalTotal = Math.max(0, subtotal + deliveryFee - state.discountAmount);
    const orderId = '#AE-' + Math.floor(1000 + Math.random() * 9000);

    let itemsText = '';
    state.cart.forEach(item => {
      itemsText += `• ${item.quantity}x ${item.name} (${formatMoney(item.unitPrice * item.quantity)})\n`;
      if (item.options && item.options.length > 0) {
        item.options.forEach(opt => {
          itemsText += `   - ${opt.name}${opt.extraPrice > 0 ? ` (+${formatMoney(opt.extraPrice)})` : ''}\n`;
        });
      }
      if (item.notes) {
        itemsText += `   - Obs: ${item.notes}\n`;
      }
    });

    let addressBlock = '';
    if (state.deliveryType === 'delivery') {
      const street = document.getElementById('checkout-street').value.trim();
      const num = document.getElementById('checkout-num').value.trim();
      const comp = document.getElementById('checkout-comp').value.trim();
      if (!street || !num) {
        alert('Por favor, informe o nome da rua e o número para entrega.');
        return;
      }
      addressBlock = `MODALIDADE: Entrega Delivery\nEndereço: ${street}, ${num}${comp ? ` (${comp})` : ''}\nBairro: ${state.neighborhood} - Indaiatuba/SP\n`;
    } else {
      addressBlock = `MODALIDADE: Retirada no Balcão\nAv. Geraldo Hackmann, 742 - Indaiatuba/SP\n`;
    }

    let paymentDesc = '';
    if (state.paymentMethod === 'pix') {
      paymentDesc = 'PIX (Chave CNPJ: 46.134.717/0001-27)';
    } else if (state.paymentMethod === 'cartao') {
      paymentDesc = 'Cartão de Débito / Crédito na entrega';
    } else {
      const troco = document.getElementById('checkout-change').value.trim();
      paymentDesc = `Dinheiro (Troco informado: ${troco || 'Não precisa de troco'})`;
    }

    // Registra pedido no KDS e persistência
    const initialCourier = state.deliveryType === 'retirada' ? 'Balcão / Retirada' : 'Aguardando Despacho';
    const orderRecord = {
      id: orderId,
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
      customerName: customerName,
      customerPhone: customerPhone,
      deliveryType: state.deliveryType,
      courier: initialCourier,
      neighborhood: state.neighborhood,
      address: addressBlock,
      items: state.cart.map(i => ({
        name: i.name,
        category: i.category,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        options: i.options,
        notes: i.notes
      })),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      discount: state.discountAmount,
      total: finalTotal,
      paymentMethod: state.paymentMethod,
      status: 'recebido'
    };

    state.orders.unshift(orderRecord);
    persistOrders();
    localStorage.setItem('andre_last_order_id', orderId);

    const fullMessage = `*NOVO PEDIDO - ANDRÉ DA EMPADA*\n\n` +
      `Código: *${orderId}*\n` +
      `Cliente: *${customerName}*\n` +
      `Telefone: ${customerPhone || 'Informado no chat'}\n\n` +
      `${addressBlock}` +
      `Despacho: ${initialCourier}\n\n` +
      `*ITENS DO PEDIDO:*\n${itemsText}\n` +
      `--------------------------\n` +
      `Subtotal: ${formatMoney(subtotal)}\n` +
      `Taxa de Entrega: ${state.deliveryType === 'delivery' ? formatMoney(deliveryFee) : 'Grátis'}\n` +
      (state.discountAmount > 0 ? `Desconto Cupom: -${formatMoney(state.discountAmount)}\n` : '') +
      `*TOTAL DO PEDIDO: ${formatMoney(finalTotal)}*\n` +
      `--------------------------\n` +
      `Forma de Pagamento: *${paymentDesc}*\n\n` +
      `Fala comigo, André! Aguardo a confirmação da preparação.`;

    const encoded = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/5519989490912?text=${encoded}`;

    // Limpa carrinho e fecha modal
    state.cart = [];
    persistCart();
    closeCheckoutModal();

    playNotificationAudio('new-order');
    showToast(`Pedido ${orderId} registrado! Abrindo WhatsApp...`, 'Pedido Criado');

    // Abre WhatsApp e aciona Rastreamento
    window.open(whatsappUrl, '_blank');
    setTimeout(() => {
      openLiveTracker(orderId);
    }, 800);
  }

  // Rastreamento de Pedido em Tempo Real
  function openLiveTracker(orderId) {
    const modal = document.getElementById('live-tracker-modal');
    if (!modal) return;

    const targetId = orderId || localStorage.getItem('andre_last_order_id') || (state.orders[0] ? state.orders[0].id : null);
    if (targetId) {
      document.getElementById('tracker-search-id').value = targetId;
      renderLiveTracker(targetId);
    }

    modal.classList.add('open');
  }

  function closeLiveTracker() {
    const modal = document.getElementById('live-tracker-modal');
    if (modal) modal.classList.remove('open');
  }

  function renderLiveTracker(orderId) {
    const order = state.orders.find(o => o.id.toLowerCase() === orderId.toLowerCase().trim());
    const contentBox = document.getElementById('tracker-content-box');
    const badgeLabel = document.getElementById('tracker-order-id-label');
    const timeLabel = document.getElementById('tracker-order-time-label');
    const summaryItems = document.getElementById('tracker-summary-items');

    if (!order) {
      if (contentBox) {
        contentBox.innerHTML = `
          <div style="text-align:center; padding:30px 10px; color:var(--color-text-muted);">
            <p style="font-weight:700; color:var(--color-primary-burgundy);">Nenhum pedido encontrado para o código "${orderId}".</p>
            <p style="font-size:0.85rem; margin-top:6px;">Verifique o código informado no WhatsApp do seu pedido.</p>
          </div>
        `;
      }
      return;
    }

    // Restaura estrutura do tracker se estiver com msg de erro
    if (!document.getElementById('step-recebido')) {
      contentBox.innerHTML = `
        <div class="tracker-order-badge" id="tracker-order-badge">
          <span id="tracker-order-id-label">Pedido: ${order.id}</span>
          <span>•</span>
          <span id="tracker-order-time-label">Horário: ${new Date(order.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="tracker-timeline">
          <div class="tracker-step" id="step-recebido"><div class="tracker-step-dot">1</div><div class="tracker-step-title">Pedido Confirmado</div><div class="tracker-step-desc">Recebido pela cozinha do André e enviado para produção</div></div>
          <div class="tracker-step" id="step-forno"><div class="tracker-step-dot">2</div><div class="tracker-step-title">No Forno & Preparo</div><div class="tracker-step-desc">Massa artesanal dourando e recheio no ponto perfeito</div></div>
          <div class="tracker-step" id="step-pronto"><div class="tracker-step-dot">3</div><div class="tracker-step-title">Embalado e Pronto</div><div class="tracker-step-desc">Acondicionado na embalagem térmica selada</div></div>
          <div class="tracker-step" id="step-entrega"><div class="tracker-step-dot">4</div><div class="tracker-step-title">Em Rota / Disponível</div><div class="tracker-step-desc">A caminho do seu endereço ou pronto para retirada no balcão</div></div>
        </div>
        <div id="tracker-summary-items" style="background:#FFFDF9; border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:14px; font-size:0.85rem; margin-top:16px;"></div>
      `;
    } else {
      if (badgeLabel) badgeLabel.textContent = `Pedido: ${order.id}`;
      if (timeLabel) timeLabel.textContent = `Horário: ${new Date(order.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    const stepRecebido = document.getElementById('step-recebido');
    const stepForno = document.getElementById('step-forno');
    const stepPronto = document.getElementById('step-pronto');
    const stepEntrega = document.getElementById('step-entrega');

    [stepRecebido, stepForno, stepPronto, stepEntrega].forEach(el => {
      if (el) el.className = 'tracker-step';
    });

    const st = order.status;
    if (st === 'recebido') {
      if (stepRecebido) stepRecebido.className = 'tracker-step active';
    } else if (st === 'forno') {
      if (stepRecebido) stepRecebido.className = 'tracker-step done';
      if (stepForno) stepForno.className = 'tracker-step active';
    } else if (st === 'pronto') {
      if (stepRecebido) stepRecebido.className = 'tracker-step done';
      if (stepForno) stepForno.className = 'tracker-step done';
      if (stepPronto) stepPronto.className = 'tracker-step active';
    } else if (st === 'entrega') {
      if (stepRecebido) stepRecebido.className = 'tracker-step done';
      if (stepForno) stepForno.className = 'tracker-step done';
      if (stepPronto) stepPronto.className = 'tracker-step done';
      if (stepEntrega) stepEntrega.className = 'tracker-step active';
    } else if (st === 'finalizado') {
      if (stepRecebido) stepRecebido.className = 'tracker-step done';
      if (stepForno) stepForno.className = 'tracker-step done';
      if (stepPronto) stepPronto.className = 'tracker-step done';
      if (stepEntrega) stepEntrega.className = 'tracker-step done';
    }

    const summaryBox = document.getElementById('tracker-summary-items');
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div style="font-weight:800; color:var(--color-primary-burgundy); margin-bottom:6px;">Resumo da Comanda:</div>
        <div>${order.items.map(i => `${i.quantity}x ${i.name}`).join('<br>')}</div>
        <div style="margin-top:8px; border-top:1px solid var(--color-border); padding-top:6px; display:flex; justify-content:space-between; font-weight:700;">
          <span>Total:</span>
          <span>${formatMoney(order.total)}</span>
        </div>
      `;
    }
  }

  // Área do Dono & KDS (Kitchen Display System)
  function openKDSModal() {
    const modal = document.getElementById('owner-kds-modal');
    if (!modal) return;
    modal.classList.add('open');
    renderKDSKanban();
    renderKDSStock();
    renderKDSShiftReport();
  }

  function closeKDSModal() {
    const modal = document.getElementById('owner-kds-modal');
    if (modal) modal.classList.remove('open');
  }

  function switchKDSTab(tabName) {
    state.activeKDSTab = tabName;
    document.querySelectorAll('.kds-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    document.getElementById('kds-tab-kanban').style.display = tabName === 'kanban' ? 'block' : 'none';
    document.getElementById('kds-tab-estoque').style.display = tabName === 'estoque' ? 'block' : 'none';
    document.getElementById('kds-tab-caixa').style.display = tabName === 'caixa' ? 'block' : 'none';

    if (tabName === 'kanban') renderKDSKanban();
    if (tabName === 'estoque') renderKDSStock();
    if (tabName === 'caixa') renderKDSShiftReport();
  }

  // Renderização do Quadro Kanban KDS
  function renderKDSKanban() {
    const lists = {
      recebido: document.getElementById('list-recebido'),
      forno: document.getElementById('list-forno'),
      pronto: document.getElementById('list-pronto'),
      entrega: document.getElementById('list-entrega'),
      finalizado: document.getElementById('list-finalizado')
    };

    const counts = { recebido: 0, forno: 0, pronto: 0, entrega: 0, finalizado: 0 };
    Object.values(lists).forEach(list => { if (list) list.innerHTML = ''; });

    state.orders.forEach(order => {
      const st = order.status || 'recebido';
      if (counts[st] !== undefined) counts[st]++;
      const targetList = lists[st];
      if (!targetList) return;

      const elapsedMinutes = Math.floor((Date.now() - order.timestamp) / 60000);
      const elapsedLabel = elapsedMinutes <= 1 ? 'Agora' : `Há ${elapsedMinutes} min`;

      let actionBtnText = '';
      let nextStatus = '';
      if (st === 'recebido') { actionBtnText = 'Enviar p/ Forno'; nextStatus = 'forno'; }
      else if (st === 'forno') { actionBtnText = 'Pronto p/ Embalar'; nextStatus = 'pronto'; }
      else if (st === 'pronto') { actionBtnText = 'Despachar / Balcão'; nextStatus = 'entrega'; }
      else if (st === 'entrega') { actionBtnText = 'Concluir Pedido'; nextStatus = 'finalizado'; }

      const card = document.createElement('div');
      card.className = 'kds-card';
      card.innerHTML = `
        <div class="kds-card-top">
          <span class="kds-card-id">${order.id}</span>
          <span class="kds-card-time">${elapsedLabel}</span>
        </div>
        <div style="font-weight:700; font-size:0.86rem; color:var(--color-text-dark);">${order.customerName}</div>
        <div style="font-size:0.75rem; color:var(--color-text-muted);">${order.deliveryType === 'delivery' ? 'Delivery • ' + order.neighborhood : 'Retirada no Balcão'}</div>
        <div class="kds-card-items">
          ${order.items.map(i => `• ${i.quantity}x ${i.name}`).join('\n')}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; font-size:0.82rem; font-weight:800; border-top:1px solid var(--color-border-subtle); padding-top:6px;">
          <span>${formatMoney(order.total)}</span>
          <span style="font-size:0.72rem; text-transform:uppercase; color:var(--color-primary-burgundy);">${order.paymentMethod}</span>
        </div>
        ${actionBtnText ? `
          <div class="kds-card-actions">
            <button class="kds-btn-action" data-id="${order.id}" data-next="${nextStatus}">
              ${actionBtnText} →
            </button>
          </div>
        ` : ''}
      `;
      targetList.appendChild(card);
    });

    // Atualiza contadores dos crachás
    ['recebido', 'forno', 'pronto', 'entrega', 'finalizado'].forEach(st => {
      const badge = document.getElementById(`badge-${st}`);
      if (badge) badge.textContent = counts[st];
    });

    // Eventos dos botões de transição
    document.querySelectorAll('.kds-btn-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        const nextStatus = btn.getAttribute('data-next');
        const targetOrder = state.orders.find(o => o.id === orderId);
        if (targetOrder) {
          targetOrder.status = nextStatus;
          persistOrders();
          playNotificationAudio('advance');
          renderKDSKanban();

          // Atualiza tracker caso esteja aberto
          const trackerInput = document.getElementById('tracker-search-id');
          if (trackerInput && trackerInput.value.trim().toUpperCase() === orderId.toUpperCase()) {
            renderLiveTracker(orderId);
          }
        }
      });
    });
  }

  // Simulação de Pedido de Teste para o Dono
  function simulateTestOrder() {
    const testCustomers = ['Matheus Santos', 'Beatriz Lima', 'Thiago Rocha', 'Juliana Ramos'];
    const randomCustomer = testCustomers[Math.floor(Math.random() * testCustomers.length)];
    const orderId = '#AE-' + Math.floor(1000 + Math.random() * 9000);

    const testOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
      customerName: randomCustomer,
      customerPhone: '(19) 99888-7766',
      deliveryType: Math.random() > 0.4 ? 'delivery' : 'retirada',
      neighborhood: 'Brigadeiro Faria Lima',
      address: 'Av. Geraldo Hackmann, 100 - Indaiatuba/SP',
      items: [
        { name: 'Empada de Frango com Catupiry Original', quantity: 2, unitPrice: 8.5 },
        { name: 'Empada de Palmito Pupunha', quantity: 1, unitPrice: 8.5 },
        { name: 'Coca-Cola Original 350ml Lata', quantity: 1, unitPrice: 6.0 }
      ],
      subtotal: 31.5,
      deliveryFee: 5.0,
      discount: 0,
      total: 36.5,
      paymentMethod: 'pix',
      status: 'recebido'
    };

    state.orders.unshift(testOrder);
    persistOrders();
    playNotificationAudio('new-order');
    showToast(`Comanda de teste ${orderId} inserida no KDS!`, 'KDS Teste');
    renderKDSKanban();
    renderKDSShiftReport();
  }

  // Gestão de Estoque (Pausa de Itens)
  function renderKDSStock() {
    const listContainer = document.getElementById('kds-stock-list');
    const searchInput = document.getElementById('kds-stock-search');
    if (!listContainer) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let allItems = [];
    state.products.forEach(cat => {
      cat.products.forEach(p => {
        if (!query || p.name.toLowerCase().includes(query) || cat.name.toLowerCase().includes(query)) {
          allItems.push({ ...p, category: cat.name });
        }
      });
    });

    listContainer.innerHTML = allItems.map(item => {
      const isPaused = state.pausedItems.has(item.name);
      return `
        <div class="kds-stock-item">
          <div class="kds-stock-item-info">
            <span class="kds-stock-item-name">${item.name}</span>
            <span class="kds-stock-item-cat">${item.category} • ${item.price}</span>
          </div>
          <button class="kds-stock-toggle-btn ${isPaused ? 'active' : 'inactive'}" data-name="${escapeHtml(item.name)}">
            ${isPaused ? 'Pausado' : 'Disponível'}
          </button>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.kds-stock-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodName = btn.getAttribute('data-name');
        if (state.pausedItems.has(prodName)) {
          state.pausedItems.delete(prodName);
          showToast(`"${prodName}" reativado no cardápio!`, 'Disponível');
        } else {
          state.pausedItems.add(prodName);
          showToast(`"${prodName}" pausado temporariamente!`, 'Pausado');
        }
        persistPausedItems();
        renderKDSStock();
        renderProductsCatalog();
      });
    });
  }

  // Fechamento de Caixa do Turno
  function renderKDSShiftReport() {
    const totalOrders = state.orders.length;
    const totalRevenue = state.orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgTicket = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    const pixTotal = state.orders.filter(o => o.paymentMethod === 'pix').reduce((s, o) => s + o.total, 0);
    const cardTotal = state.orders.filter(o => o.paymentMethod === 'cartao').reduce((s, o) => s + o.total, 0);
    const cashTotal = state.orders.filter(o => o.paymentMethod === 'dinheiro').reduce((s, o) => s + o.total, 0);

    const shiftTotalEl = document.getElementById('shift-total-sales');
    const shiftCountEl = document.getElementById('shift-order-count');
    const shiftAvgEl = document.getElementById('shift-avg-ticket');
    const shiftPixEl = document.getElementById('shift-pix-total');
    const shiftCardEl = document.getElementById('shift-card-total');
    const shiftCashEl = document.getElementById('shift-cash-total');

    if (shiftTotalEl) shiftTotalEl.textContent = formatMoney(totalRevenue);
    if (shiftCountEl) shiftCountEl.textContent = totalOrders;
    if (shiftAvgEl) shiftAvgEl.textContent = formatMoney(avgTicket);
    if (shiftPixEl) shiftPixEl.textContent = formatMoney(pixTotal);
    if (shiftCardEl) shiftCardEl.textContent = formatMoney(cardTotal);
    if (shiftCashEl) shiftCashEl.textContent = formatMoney(cashTotal);

    const tbody = document.getElementById('shift-orders-tbody');
    if (!tbody) return;

    tbody.innerHTML = state.orders.map(o => `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:800; color:var(--color-primary-burgundy);">${o.id}</td>
        <td>${new Date(o.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
        <td style="font-weight:700;">${o.customerName}</td>
        <td>${o.deliveryType === 'delivery' ? 'Delivery' : 'Retirada'}</td>
        <td style="text-transform:uppercase; font-size:0.75rem; font-weight:800;">${o.paymentMethod}</td>
        <td style="font-weight:800;">${formatMoney(o.total)}</td>
        <td>
          <span style="background:${o.status === 'finalizado' ? '#DCFCE7' : '#FEF3C7'}; color:${o.status === 'finalizado' ? '#166534' : '#92400E'}; padding:2px 8px; border-radius:var(--radius-full); font-size:0.75rem; font-weight:700; text-transform:uppercase;">
            ${o.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  // Inicialização e Event Listeners
  function init() {
    updateBusinessHours();
    setInterval(updateBusinessHours, 60000);

    renderCategoryTabs();
    renderProductsCatalog();
    updateCartUI();

    // Busca no Catálogo com Debounce
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

    // Filtros por Tag
    document.querySelectorAll('.filter-tags .tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-tags .tag-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeFilter = chip.getAttribute('data-filter');
        renderProductsCatalog();
      });
    });

    // Gatilhos de Carrinho
    const btnCartNav = document.getElementById('btn-cart-nav');
    if (btnCartNav) btnCartNav.addEventListener('click', openCartDrawer);

    const btnBottomCart = document.getElementById('btn-bottom-cart');
    if (btnBottomCart) btnBottomCart.addEventListener('click', openCartDrawer);

    const btnCloseCart = document.getElementById('btn-close-cart');
    if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartDrawer);

    const drawerBackdrop = document.getElementById('cart-drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', (e) => {
        if (e.target === drawerBackdrop) closeCartDrawer();
      });
    }

    // Gatilhos de Rastreamento
    const btnOpenTracker = document.getElementById('btn-open-tracker');
    if (btnOpenTracker) btnOpenTracker.addEventListener('click', () => openLiveTracker());

    const btnBottomTracker = document.getElementById('btn-bottom-tracker');
    if (btnBottomTracker) btnBottomTracker.addEventListener('click', () => openLiveTracker());

    const btnCloseTracker = document.getElementById('btn-close-tracker');
    if (btnCloseTracker) btnCloseTracker.addEventListener('click', closeLiveTracker);

    const trackerModal = document.getElementById('live-tracker-modal');
    if (trackerModal) {
      trackerModal.addEventListener('click', (e) => {
        if (e.target === trackerModal) closeLiveTracker();
      });
    }

    const btnSearchOrder = document.getElementById('btn-search-order');
    if (btnSearchOrder) {
      btnSearchOrder.addEventListener('click', () => {
        const id = document.getElementById('tracker-search-id').value.trim();
        if (id) renderLiveTracker(id);
      });
    }

    // Gatilhos de KDS / Área do Dono
    const btnOpenKDS = document.getElementById('btn-open-kds');
    if (btnOpenKDS) btnOpenKDS.addEventListener('click', openKDSModal);

    const btnBottomKDS = document.getElementById('btn-bottom-kds');
    if (btnBottomKDS) btnBottomKDS.addEventListener('click', openKDSModal);

    const btnCloseKDS = document.getElementById('btn-close-kds');
    if (btnCloseKDS) btnCloseKDS.addEventListener('click', closeKDSModal);

    const kdsModal = document.getElementById('owner-kds-modal');
    if (kdsModal) {
      kdsModal.addEventListener('click', (e) => {
        if (e.target === kdsModal) closeKDSModal();
      });
    }

    document.querySelectorAll('.kds-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchKDSTab(btn.getAttribute('data-tab'));
      });
    });

    const btnSimulate = document.getElementById('btn-kds-simulate');
    if (btnSimulate) btnSimulate.addEventListener('click', simulateTestOrder);

    const kdsStockSearch = document.getElementById('kds-stock-search');
    if (kdsStockSearch) {
      kdsStockSearch.addEventListener('input', renderKDSStock);
    }

    // Modal de Produto
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeProductModal);

    const productModal = document.getElementById('product-modal');
    if (productModal) {
      productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
      });
    }

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

    const modalOptions = document.getElementById('modal-options-container');
    if (modalOptions) {
      modalOptions.addEventListener('change', updateModalTotalPrice);
    }

    const btnModalAdd = document.getElementById('btn-modal-add');
    if (btnModalAdd) btnModalAdd.addEventListener('click', addModalItemToCart);

    // Opções de Entrega / Retirada no Carrinho
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

    const neighSelect = document.getElementById('neighborhood-select');
    if (neighSelect) {
      neighSelect.addEventListener('change', (e) => {
        state.neighborhood = e.target.value;
        updateCartDrawerTotals(state.cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0));
      });
    }

    // Cupom de Desconto
    const btnApplyCoupon = document.getElementById('btn-apply-coupon');
    const couponInput = document.getElementById('coupon-input');
    if (btnApplyCoupon && couponInput) {
      btnApplyCoupon.addEventListener('click', () => {
        const code = couponInput.value.toUpperCase().trim();
        const subtotal = state.cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
        if (code === 'FALACOMIGO') {
          state.discountAmount = 5.0;
          showToast('Cupom FALACOMIGO aplicado! R$ 5,00 OFF', 'Cupom');
        } else if (code === 'PRIMEIRACOMPRA') {
          state.discountAmount = subtotal * 0.10;
          showToast('Cupom PRIMEIRACOMPRA aplicado! 10% OFF', 'Cupom');
        } else if (code) {
          alert('Cupom inválido. Experimente "FALACOMIGO".');
          state.discountAmount = 0;
        }
        updateCartDrawerTotals(subtotal);
      });
    }

    // Checkout
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

    // Métodos de Pagamento
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

    // Copiar Chave Pix
    const btnCopyPix = document.getElementById('btn-copy-pix');
    if (btnCopyPix) {
      btnCopyPix.addEventListener('click', () => {
        const text = document.getElementById('pix-payload-text').textContent.trim();
        navigator.clipboard.writeText(text).then(() => {
          showToast('Código Pix copiado!', 'Copiado');
          btnCopyPix.textContent = 'Copiado com Sucesso!';
          setTimeout(() => {
            btnCopyPix.textContent = 'Copiar Código Pix Copia e Cola';
          }, 3000);
        }).catch(() => {
          showToast('Selecione e copie o texto acima', 'Aviso');
        });
      });
    }

    // Botão Enviar Pedido
    const btnSubmitOrder = document.getElementById('btn-submit-order');
    if (btnSubmitOrder) btnSubmitOrder.addEventListener('click', submitWhatsAppOrder);

    // Tecla ESC para fechar modais
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProductModal();
        closeCartDrawer();
        closeCheckoutModal();
        closeLiveTracker();
        closeKDSModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
