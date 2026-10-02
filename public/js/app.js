// Main Storefront Application Controller for Rajdeep Enterprise

import { storage } from './storage.js';
import { CATEGORIES, STORE_INFO } from './data.js';

let currentCategory = 'all';
let currentBrand = 'all';
let currentSort = 'featured';
let currentSearch = '';
let inStockOnly = false;

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderStoreInfo();
    renderUserAccountState();
    renderCategoryPills();
    renderProducts();
    initFilters();
    initSearch();
    initCart();
    initEmiCalculator();
    initContactForm();
    initReviews();

    // Sync live products & store info from server database
    syncWithServer();

    // Real-time update across open tabs when admin edits products
    window.addEventListener('storage', (e) => {
        if (e.key === 'rajdeep_products_catalog_v2') {
            renderCategoryPills();
            renderProducts();
        }
        if (e.key === 'rajdeep_store_info_v2') {
            renderStoreInfo();
        }
    });

    // Auto-refresh data when user switches back to this tab
    window.addEventListener('focus', () => {
        syncWithServer();
    });

    // Bind modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });

    // Make global handlers available to dynamically rendered buttons
    window.appQuickView = openQuickViewModal;
    window.appAddToCart = handleAddToCart;
    window.appWhatsAppInquiry = openWhatsAppProductInquiry;
}

async function syncWithServer() {
    try {
        const apiBase = window.location.port === '3000' ? '' : 'http://localhost:3000';

        const prodRes = await fetch(`${apiBase}/api/products`);
        if (prodRes.ok) {
            const prodData = await prodRes.json();
            if (prodData.success && Array.isArray(prodData.data) && prodData.data.length > 0) {
                storage.saveProducts(prodData.data);
                renderCategoryPills();
                renderProducts();
            }
        }

        const storeRes = await fetch(`${apiBase}/api/store-info`);
        if (storeRes.ok) {
            const storeData = await storeRes.json();
            if (storeData.success && storeData.data) {
                storage.saveStoreInfo(storeData.data);
                renderStoreInfo();
            }
        }
    } catch (err) {
        // Fallback to local cache gracefully
    }
}

function renderUserAccountState() {
    const user = storage.getCurrentUser();
    const label = document.getElementById('userAccountLabel');
    const authLink = document.getElementById('btnUserLogin');

    if (user && label && authLink) {
        label.textContent = `Hi, ${user.name.split(' ')[0]}`;
        authLink.href = 'javascript:void(0)';
        authLink.title = `Logged in as ${user.name} (${user.phone}) - Click to Log Out`;
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm(`Do you want to log out of ${user.name}'s account?`)) {
                storage.logoutUser();
                showToast('Logged out of customer account', 'info');
                setTimeout(() => window.location.reload(), 500);
            }
        });

        // Pre-fill forms if available
        const nameInput = document.getElementById('contactName');
        const phoneInput = document.getElementById('contactPhone');
        if (nameInput && !nameInput.value) nameInput.value = user.name;
        if (phoneInput && !phoneInput.value) phoneInput.value = user.phone;

        const quoteName = document.getElementById('quoteCustomerName');
        const quotePhone = document.getElementById('quoteCustomerPhone');
        const quoteCity = document.getElementById('quoteCustomerCity');
        if (quoteName && !quoteName.value) quoteName.value = user.name;
        if (quotePhone && !quotePhone.value) quotePhone.value = user.phone;
        if (quoteCity && !quoteCity.value && user.city) quoteCity.value = user.city;
    }
}

function renderStoreInfo() {
    const store = storage.getStoreInfo();
    
    // Store phone / links
    const phoneLinks = document.querySelectorAll('.store-phone-link');
    phoneLinks.forEach(el => {
        el.href = `tel:${store.phone.replace(/[^0-9+]/g, '')}`;
        el.textContent = store.phone;
    });

    const whatsappLinks = document.querySelectorAll('.store-whatsapp-link');
    whatsappLinks.forEach(el => {
        const cleanWa = (store.whatsapp || '918264276734').replace(/[^0-9]/g, '');
        el.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hello ${store.name}, I would like to inquire about electronic products and offers.`)}`;
    });

    const emailLinks = document.querySelectorAll('.store-email-link');
    emailLinks.forEach(el => {
        el.href = `mailto:${store.email}`;
        if (el.querySelector('span:last-child')) {
            el.querySelector('span:last-child').textContent = store.email;
        } else {
            el.textContent = store.email;
        }
    });

    const instaLinks = document.querySelectorAll('.store-instagram-link');
    instaLinks.forEach(el => {
        el.href = store.instagramUrl || 'https://www.instagram.com/rajdeep_enterprise_2001';
    });

    const addressEls = document.querySelectorAll('.store-address-text');
    addressEls.forEach(el => el.textContent = store.address);

    const timingEls = document.querySelectorAll('.store-timings-text');
    timingEls.forEach(el => el.textContent = store.timings);
}

function renderCategoryPills() {
    const container = document.getElementById('categoryChipsContainer');
    if (!container) return;

    const products = storage.getProducts();

    container.innerHTML = CATEGORIES.map(cat => {
        const count = cat.id === 'all' 
            ? products.length 
            : products.filter(p => p.category === cat.id).length;

        const isActive = currentCategory === cat.id ? 'active' : '';

        return `
            <button class="category-chip-btn ${isActive}" data-category="${cat.id}">
                <span>${cat.name}</span>
                <span class="cat-count">${count}</span>
            </button>
        `;
    }).join('');

    // Bind click events
    container.querySelectorAll('.category-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.getAttribute('data-category');
            container.querySelectorAll('.category-chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts();
        });
    });

    // Update brands dropdown dynamically based on products
    populateBrandFilter(products);
}

function populateBrandFilter(products) {
    const brandSelect = document.getElementById('filterBrand');
    if (!brandSelect) return;

    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort();
    
    const currentVal = brandSelect.value;
    brandSelect.innerHTML = `<option value="all">All Brands</option>` + 
        brands.map(b => `<option value="${escapeHTML(b)}">${escapeHTML(b)}</option>`).join('');

    if (brands.includes(currentVal)) {
        brandSelect.value = currentVal;
    }
}

function initFilters() {
    const brandSelect = document.getElementById('filterBrand');
    if (brandSelect) {
        brandSelect.addEventListener('change', (e) => {
            currentBrand = e.target.value;
            renderProducts();
        });
    }

    const sortSelect = document.getElementById('filterSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderProducts();
        });
    }

    const inStockCheckbox = document.getElementById('filterInStock');
    if (inStockCheckbox) {
        inStockCheckbox.addEventListener('change', (e) => {
            inStockOnly = e.target.checked;
            renderProducts();
        });
    }
}

function initSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    const searchClear = document.getElementById('globalSearchClear');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        if (searchClear) {
            searchClear.style.display = currentSearch ? 'block' : 'none';
        }
        renderProducts();
    });

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            currentSearch = '';
            searchClear.style.display = 'none';
            searchInput.focus();
            renderProducts();
        });
    }
}

function getFilteredProducts() {
    let list = storage.getProducts();

    // Category filter
    if (currentCategory !== 'all') {
        list = list.filter(p => p.category === currentCategory);
    }

    // Brand filter
    if (currentBrand !== 'all') {
        list = list.filter(p => p.brand.toLowerCase() === currentBrand.toLowerCase());
    }

    // In-Stock filter
    if (inStockOnly) {
        list = list.filter(p => p.inStock !== false);
    }

    // Search query
    if (currentSearch) {
        list = list.filter(p => {
            const matchTitle = (p.title || '').toLowerCase().includes(currentSearch);
            const matchBrand = (p.brand || '').toLowerCase().includes(currentSearch);
            const matchModel = (p.model || '').toLowerCase().includes(currentSearch);
            const matchDesc = (p.shortDesc || '').toLowerCase().includes(currentSearch);
            const matchSpecs = Array.isArray(p.specs) && p.specs.some(s => s.toLowerCase().includes(currentSearch));
            return matchTitle || matchBrand || matchModel || matchDesc || matchSpecs;
        });
    }

    // Sorting
    switch (currentSort) {
        case 'price-low':
            list.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            list.sort((a, b) => b.price - a.price);
            break;
        case 'discount':
            list.sort((a, b) => {
                const discA = a.mrp ? (a.mrp - a.price) / a.mrp : 0;
                const discB = b.mrp ? (b.mrp - b.price) / b.mrp : 0;
                return discB - discA;
            });
            break;
        case 'rating':
            list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'featured':
        default:
            list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            break;
    }

    return list;
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const countDisplay = document.getElementById('activeResultsCount');
    if (!grid) return;

    const products = getFilteredProducts();

    if (countDisplay) {
        countDisplay.textContent = `Showing ${products.length} product${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; background: var(--glass-bg); border-radius: var(--radius-lg); border: 1px dashed #cbd5e1;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔍</div>
                <h3 style="font-family: var(--font-heading); font-size: 1.3rem; margin-bottom: 0.5rem;">No Matching Electronic Products Found</h3>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try modifying your search or clearing category filters.</p>
                <button class="btn-primary" onclick="window.appResetFilters()">
                    Reset All Filters
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(prod => {
        const discountPercent = prod.mrp && prod.mrp > prod.price 
            ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) 
            : 0;

        const savings = prod.mrp && prod.mrp > prod.price ? prod.mrp - prod.price : 0;

        // Key bullets (first 2)
        const bulletsHtml = Array.isArray(prod.specs) && prod.specs.length > 0
            ? `<ul class="card-bullets">${prod.specs.slice(0, 2).map(s => `<li>${escapeHTML(s)}</li>`).join('')}</ul>`
            : `<p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1rem;">${escapeHTML(prod.shortDesc || '')}</p>`;

        return `
            <div class="product-card" id="card-${prod.id}">
                <div class="card-media-wrapper">
                    <img src="${escapeHTML(prod.image || 'assets/images/ac.jpg')}" alt="${escapeHTML(prod.title)}" class="card-img" loading="lazy" onerror="this.src='assets/images/ac.jpg'">
                    
                    <div class="card-badge-top-left">
                        <span class="badge-brand">${escapeHTML(prod.brand)}</span>
                        ${prod.energyStar ? `<span class="badge-energy">⚡ ${escapeHTML(prod.energyStar)}</span>` : ''}
                    </div>

                    ${discountPercent > 0 ? `
                        <div class="card-badge-top-right">
                            <span class="badge-discount">${discountPercent}% OFF</span>
                        </div>
                    ` : ''}
                </div>

                <div class="card-content">
                    <div class="card-meta-line">
                        <span class="card-model-tag">${escapeHTML(prod.model || '')}</span>
                        <span class="card-rating-badge">★ ${(prod.rating || 4.8).toFixed(1)} <small style="color:var(--text-dim);">(${prod.reviewsCount || 42})</small></span>
                    </div>

                    <h3 class="card-title" title="${escapeHTML(prod.title)}">${escapeHTML(prod.title)}</h3>

                    ${bulletsHtml}

                    <div class="card-price-box">
                        <div class="card-price-row">
                            <span class="current-price">₹${prod.price.toLocaleString('en-IN')}</span>
                            ${prod.mrp && prod.mrp > prod.price ? `<span class="original-mrp">₹${prod.mrp.toLocaleString('en-IN')}</span>` : ''}
                            ${savings > 0 ? `<span class="save-amount">Save ₹${savings.toLocaleString('en-IN')}</span>` : ''}
                        </div>
                        <div class="stock-status-pill ${prod.inStock !== false ? 'in-stock' : 'out-of-stock'}">
                            <span class="stock-dot"></span>
                            <span>${prod.inStock !== false ? 'In Stock • Ready in Mundra' : 'Out of Stock • Order on Request'}</span>
                        </div>
                    </div>

                    <div class="card-actions">
                        <button class="btn-card-action btn-whatsapp-quote" onclick="window.appWhatsAppInquiry('${prod.id}')" title="Get Best Price on WhatsApp">
                            <span>💬</span> WhatsApp Deal
                        </button>
                        <button class="btn-card-action btn-add-quote" onclick="window.appAddToCart('${prod.id}')" title="Add to Quote Cart">
                            <span>🛒</span> Add to Quote
                        </button>
                        <button class="btn-card-action btn-card-specs" onclick="window.appQuickView('${prod.id}')">
                            View Full Specifications & EMI
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.appResetFilters = () => {
    currentCategory = 'all';
    currentBrand = 'all';
    currentSort = 'featured';
    currentSearch = '';
    inStockOnly = false;

    const brandSelect = document.getElementById('filterBrand');
    if (brandSelect) brandSelect.value = 'all';

    const sortSelect = document.getElementById('filterSort');
    if (sortSelect) sortSelect.value = 'featured';

    const inStockCheckbox = document.getElementById('filterInStock');
    if (inStockCheckbox) inStockCheckbox.checked = false;

    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) searchInput.value = '';

    renderCategoryPills();
    renderProducts();
};

// Product Detail Modal
function openQuickViewModal(productId) {
    const products = storage.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const container = document.getElementById('quickViewContent');
    const modal = document.getElementById('modalQuickView');

    const discountPercent = prod.mrp && prod.mrp > prod.price 
        ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) 
        : 0;

    const monthlyEmiEst = Math.round(prod.price / 6);

    container.innerHTML = `
        <div class="product-detail-layout">
            <div>
                <div class="detail-img-container">
                    <img src="${escapeHTML(prod.image || 'assets/images/ac.jpg')}" alt="${escapeHTML(prod.title)}" onerror="this.src='assets/images/ac.jpg'">
                </div>
                <div style="margin-top:1rem; background:#f8fafc; border:1px solid #e2e8f0; padding:1.1rem; border-radius:var(--radius-md);">
                    <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--text-dim); font-weight:700; margin-bottom:0.25rem;">Estimated 0% Interest EMI</div>
                    <div style="font-size:1.4rem; font-weight:800; color:var(--primary);">Starting ₹${monthlyEmiEst.toLocaleString('en-IN')}<span style="font-size:0.85rem; font-weight:normal; color:var(--text-muted);"> / month (6 months)</span></div>
                    <div style="font-size:0.78rem; color:var(--text-dim); margin-top:0.35rem;">Available on Bajaj Finserv, HDFC & Credit Cards at our Mundra showroom.</div>
                </div>
            </div>

            <div>
                <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
                    <span class="badge-brand">${escapeHTML(prod.brand)}</span>
                    ${prod.energyStar ? `<span class="badge-energy">⚡ ${escapeHTML(prod.energyStar)}</span>` : ''}
                </div>

                <h2 style="font-family:var(--font-heading); font-size:1.45rem; font-weight:800; color:var(--text-main); line-height:1.25; margin-bottom:0.5rem;">
                    ${escapeHTML(prod.title)}
                </h2>

                <div style="font-size:0.85rem; color:var(--text-dim); margin-bottom:1rem;">
                    Model No: <strong style="color:var(--text-main);">${escapeHTML(prod.model || 'Standard')}</strong> | Category: <strong style="color:var(--text-main); text-transform:capitalize;">${escapeHTML(prod.category)}</strong>
                </div>

                <div class="card-price-row" style="margin-bottom:1.2rem;">
                    <span class="current-price" style="font-size:1.85rem;">₹${prod.price.toLocaleString('en-IN')}</span>
                    ${prod.mrp && prod.mrp > prod.price ? `<span class="original-mrp" style="font-size:1rem;">₹${prod.mrp.toLocaleString('en-IN')}</span>` : ''}
                    ${discountPercent > 0 ? `<span class="badge-discount">${discountPercent}% OFF</span>` : ''}
                </div>

                <p style="font-size:0.92rem; color:var(--text-muted); line-height:1.55; margin-bottom:1rem;">
                    ${escapeHTML(prod.shortDesc || '')}
                </p>

                <h4 style="font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; color:var(--primary); margin-bottom:0.4rem; font-weight:800;">
                    Technical Specifications & Highlights:
                </h4>

                <ul class="detail-specs-list">
                    ${Array.isArray(prod.specs) && prod.specs.length > 0 
                        ? prod.specs.map(s => `<li>${escapeHTML(s)}</li>`).join('') 
                        : '<li>Official manufacturer standard specifications apply.</li>'}
                </ul>

                <div style="display:flex; gap:0.75rem; margin-top:1.5rem; flex-wrap:wrap;">
                    <button class="btn-whatsapp-hero" onclick="window.appWhatsAppInquiry('${prod.id}')" style="flex:1;">
                        <span>💬</span> Inquire on WhatsApp
                    </button>
                    <button class="btn-primary" onclick="window.appAddToCart('${prod.id}'); document.getElementById('modalQuickView').classList.remove('open');" style="flex:1;">
                        <span>🛒</span> Add to Quote
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// WhatsApp Direct Inquiry
function openWhatsAppProductInquiry(productId) {
    const products = storage.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const store = storage.getStoreInfo();
    const cleanWa = (store.whatsapp || '918264276734').replace(/[^0-9]/g, '');

    const message = `Hello ${store.name}! 👋\n\nI am inquiring about the following electronic product from your Mundra showroom:\n\n*Product:* ${prod.title}\n*Brand:* ${prod.brand}\n*Model:* ${prod.model || '-'}\n*Showroom Offer Price:* ₹${prod.price.toLocaleString('en-IN')}\n\nPlease share availability, best discounted deal, and delivery/installation time. Thank you!`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(message)}`, '_blank');
}

// Cart / Quotation
function initCart() {
    const btnOpenCart = document.getElementById('btnOpenCart');
    const modalCart = document.getElementById('modalCart');
    if (btnOpenCart && modalCart) {
        btnOpenCart.addEventListener('click', () => {
            renderCartModal();
            modalCart.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    updateCartBadge();

    const formSubmitQuote = document.getElementById('formSubmitQuote');
    if (formSubmitQuote) {
        formSubmitQuote.addEventListener('submit', (e) => {
            e.preventDefault();
            handleQuoteSubmission();
        });
    }
}

function handleAddToCart(productId) {
    storage.addToCart(productId, 1);
    updateCartBadge();
    const products = storage.getProducts();
    const prod = products.find(p => p.id === productId);
    showToast(`Added "${prod ? prod.title : 'Product'}" to your quotation cart!`, 'success');
}

function updateCartBadge() {
    const badge = document.getElementById('cartCountBadge');
    if (!badge) return;

    const cart = storage.getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? 'inline-flex' : 'none';
}

function renderCartModal() {
    const cart = storage.getCart();
    const products = storage.getProducts();
    const container = document.getElementById('cartItemsList');
    const emptyNotice = document.getElementById('cartEmptyNotice');
    const footerActions = document.getElementById('cartFooterActions');
    const totalAmountDisplay = document.getElementById('cartTotalAmount');
    const savingsAmountDisplay = document.getElementById('cartSavingsAmount');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyNotice) emptyNotice.style.display = 'block';
        if (footerActions) footerActions.style.display = 'none';
        return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';
    if (footerActions) footerActions.style.display = 'block';

    let totalAmount = 0;
    let totalMrp = 0;

    container.innerHTML = cart.map(item => {
        const prod = products.find(p => p.id === item.id);
        if (!prod) return '';

        const itemTotal = prod.price * item.qty;
        totalAmount += itemTotal;
        totalMrp += (prod.mrp || prod.price) * item.qty;

        return `
            <div class="cart-item-row">
                <img src="${escapeHTML(prod.image || 'assets/images/ac.jpg')}" alt="${escapeHTML(prod.title)}" class="cart-item-thumb" onerror="this.src='assets/images/ac.jpg'">
                <div class="cart-item-info">
                    <div class="cart-item-title">${escapeHTML(prod.title)}</div>
                    <div class="cart-item-price">₹${prod.price.toLocaleString('en-IN')} × ${item.qty} = ₹${itemTotal.toLocaleString('en-IN')}</div>
                </div>
                <div class="cart-qty-controls">
                    <button class="btn-qty" onclick="window.appCartChangeQty('${prod.id}', ${item.qty - 1})">-</button>
                    <span style="font-weight:700; min-width:20px; text-align:center;">${item.qty}</span>
                    <button class="btn-qty" onclick="window.appCartChangeQty('${prod.id}', ${item.qty + 1})">+</button>
                    <button class="btn-admin btn-admin-danger" style="margin-left:4px; padding:2px 8px;" onclick="window.appCartRemove('${prod.id}')" title="Remove">✕</button>
                </div>
            </div>
        `;
    }).join('');

    const totalSavings = totalMrp - totalAmount;

    if (totalAmountDisplay) {
        totalAmountDisplay.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
    }
    if (savingsAmountDisplay) {
        savingsAmountDisplay.textContent = totalSavings > 0 
            ? `You Save ₹${totalSavings.toLocaleString('en-IN')}!` 
            : '';
    }
}

window.appCartChangeQty = (id, newQty) => {
    if (newQty <= 0) {
        storage.removeFromCart(id);
    } else {
        storage.updateCartQty(id, newQty);
    }
    updateCartBadge();
    renderCartModal();
};

window.appCartRemove = (id) => {
    storage.removeFromCart(id);
    updateCartBadge();
    renderCartModal();
    showToast('Item removed from cart', 'info');
};

function handleQuoteSubmission() {
    const cart = storage.getCart();
    if (cart.length === 0) {
        showToast('Your quote cart is empty!', 'error');
        return;
    }

    const name = document.getElementById('quoteCustomerName').value.trim();
    const phone = document.getElementById('quoteCustomerPhone').value.trim();
    const city = document.getElementById('quoteCustomerCity').value.trim();

    if (!name || !phone) {
        showToast('Please provide your name and phone number!', 'error');
        return;
    }

    const products = storage.getProducts();
    const itemsList = cart.map(item => {
        const prod = products.find(p => p.id === item.id);
        return prod ? `${prod.title} (Qty: ${item.qty}, Price: ₹${(prod.price * item.qty).toLocaleString('en-IN')})` : '';
    }).filter(Boolean);

    const store = storage.getStoreInfo();

    storage.addLead({
        name,
        phone,
        email: city || 'Mundra',
        product: itemsList.join(' | '),
        notes: `Quotation requested via Website Cart for ${cart.length} item(s).`
    });

    const cleanWa = (store.whatsapp || '918264276734').replace(/[^0-9]/g, '');
    const waText = `Hello ${store.name}! 👋\n\nI would like to request an official quotation/order for the following appliances from your Mundra showroom:\n\n*Customer Details:*\n• Name: ${name}\n• Phone: ${phone}\n• Area/Location: ${city || 'Mundra, Gujarat'}\n\n*Requested Products:*\n${itemsList.map(i => `• ${i}`).join('\n')}\n\nPlease confirm availability, additional discounts, and installation schedule. Thank you!`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(waText)}`, '_blank');

    storage.clearCart();
    updateCartBadge();
    document.getElementById('modalCart').classList.remove('open');
    document.body.style.overflow = '';
    showToast('Quotation submitted! Opening WhatsApp chat...', 'success');
}

// EMI Calculator
function initEmiCalculator() {
    const sliderAmount = document.getElementById('emiSliderAmount');
    const sliderDown = document.getElementById('emiSliderDown');
    const tenureButtons = document.querySelectorAll('.tenure-pill-btn');

    let currentTenureMonths = 6;

    if (!sliderAmount || !sliderDown) return;

    const calculateEmi = () => {
        const total = parseFloat(sliderAmount.value) || 45000;
        const downPercent = parseFloat(sliderDown.value) || 20;

        document.getElementById('emiValAmount').textContent = `₹${total.toLocaleString('en-IN')}`;
        document.getElementById('emiValDown').textContent = `${downPercent}% (₹${Math.round(total * (downPercent / 100)).toLocaleString('en-IN')})`;

        const loanPrincipal = total - (total * (downPercent / 100));
        let annualInterestRate = currentTenureMonths <= 6 ? 0 : 9.5;
        let monthlyRate = (annualInterestRate / 12) / 100;

        let monthlyEmi = 0;
        let totalInterest = 0;

        if (monthlyRate === 0) {
            monthlyEmi = Math.round(loanPrincipal / currentTenureMonths);
            totalInterest = 0;
        } else {
            monthlyEmi = Math.round((loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, currentTenureMonths)) / (Math.pow(1 + monthlyRate, currentTenureMonths) - 1));
            totalInterest = Math.round((monthlyEmi * currentTenureMonths) - loanPrincipal);
        }

        const emiDisplay = document.getElementById('emiMonthlyResult');
        if (emiDisplay) emiDisplay.textContent = `₹${monthlyEmi.toLocaleString('en-IN')}`;

        const loanPrincipalDisplay = document.getElementById('emiLoanPrincipal');
        if (loanPrincipalDisplay) loanPrincipalDisplay.textContent = `₹${Math.round(loanPrincipal).toLocaleString('en-IN')}`;

        const totalPayableDisplay = document.getElementById('emiTotalPayable');
        if (totalPayableDisplay) totalPayableDisplay.textContent = `₹${Math.round(loanPrincipal + totalInterest).toLocaleString('en-IN')}`;
    };

    sliderAmount.addEventListener('input', calculateEmi);
    sliderDown.addEventListener('input', calculateEmi);

    tenureButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tenureButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTenureMonths = parseInt(btn.getAttribute('data-months')) || 6;
            calculateEmi();
        });
    });

    calculateEmi();
}

// Contact Form
function initContactForm() {
    const form = document.getElementById('formShowroomContact');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const productCategory = document.getElementById('contactProductCategory').value;
        const message = document.getElementById('contactMessage').value.trim();

        if (!name || !phone) {
            showToast('Please provide your name and phone number!', 'error');
            return;
        }

        const leadData = {
            name,
            phone,
            product: `Inquiry: ${productCategory}`,
            message: message || 'Inquiry from Mundra showroom website.'
        };

        storage.addLead(leadData);

        // Also sync to server backend database for admin panel
        fetch('/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        }).catch(err => console.warn('Server sync error:', err));

        const store = storage.getStoreInfo();
        const cleanWa = (store.whatsapp || '918264276734').replace(/[^0-9]/g, '');
        const waMsg = `Hello ${store.name} (Mundra),\n\nNew customer inquiry from *${name}* (${phone}):\nCategory: *${productCategory}*\nMessage: ${message || 'Please share latest deals and showroom offers.'}`;

        showToast('Thank you! Your message was submitted to Rajdeep Enterprise.', 'success');
        form.reset();

        if (confirm('Would you like to open WhatsApp to chat with our showroom manager in Mundra right now?')) {
            window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(waMsg)}`, '_blank');
        }
    });
}

// ============================================================
// Customer Reviews & Feedback
// ============================================================

function initReviews() {
    const btnOpen = document.getElementById('btnOpenReviewModal');
    const modal = document.getElementById('reviewModal');
    const form = document.getElementById('formSubmitReview');
    const ratingInput = document.getElementById('reviewRatingInput');
    const starContainer = document.getElementById('starRatingSelector');

    window.appOpenReviewModal = () => {
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    };

    if (btnOpen) {
        btnOpen.addEventListener('click', window.appOpenReviewModal);
    }

    if (starContainer) {
        const stars = starContainer.querySelectorAll('.star-rating-item');
        stars.forEach(s => {
            s.addEventListener('click', () => {
                const val = parseInt(s.getAttribute('data-star')) || 5;
                if (ratingInput) ratingInput.value = val;
                stars.forEach(st => {
                    const stVal = parseInt(st.getAttribute('data-star')) || 0;
                    st.style.color = stVal <= val ? '#f59e0b' : '#cbd5e1';
                });
            });
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSubmit = document.getElementById('btnSubmitReview');
            const name = document.getElementById('reviewName').value.trim();
            const location = document.getElementById('reviewLocation').value.trim();
            const product = document.getElementById('reviewProduct').value.trim();
            const title = document.getElementById('reviewTitle').value.trim();
            const comment = document.getElementById('reviewComment').value.trim();
            const rating = parseInt(ratingInput ? ratingInput.value : 5) || 5;

            if (!name || !comment) {
                showToast('Please provide your name and review feedback!', 'error');
                return;
            }

            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Submitting...';

            const payload = {
                name,
                location: location || 'Mundra, Gujarat',
                product: product || 'Showroom Experience',
                title: title || `${rating} Star Showroom Review`,
                comment,
                rating
            };

            try {
                const apiBase = window.location.port === '3000' ? '' : 'http://localhost:3000';
                const res = await fetch(`${apiBase}/api/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    showToast('Thank you! Your feedback has been published.', 'success');
                    form.reset();
                    if (ratingInput) ratingInput.value = 5;
                    if (starContainer) {
                        starContainer.querySelectorAll('.star-rating-item').forEach(st => st.style.color = '#f59e0b');
                    }
                    if (modal) {
                        modal.classList.remove('open');
                        document.body.style.overflow = '';
                    }
                    loadReviews();
                } else {
                    showToast(data.error || 'Failed to submit review', 'error');
                }
            } catch (err) {
                showToast('Network error submitting review', 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Submit Review & Feedback';
            }
        });
    }

    loadReviews();
}

async function loadReviews() {
    const container = document.getElementById('reviewsGridContainer');
    if (!container) return;

    try {
        const apiBase = window.location.port === '3000' ? '' : 'http://localhost:3000';
        const res = await fetch(`${apiBase}/api/reviews`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        const reviews = data.success ? data.data : [];

        if (!reviews.length) {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem; color:var(--text-dim); grid-column:1/-1;">
                    Be the first to review Rajdeep Enterprise! Click "Write a Review / Feedback" above.
                </div>
            `;
            return;
        }

        container.innerHTML = reviews.map(r => {
            const ratingNum = Math.min(5, Math.max(1, r.rating || 5));
            const starsFilled = '★'.repeat(ratingNum);
            const starsEmpty = '☆'.repeat(5 - ratingNum);
            const initial = (r.name || 'C')[0].toUpperCase();
            const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Verified';

            return `
                <div class="review-card">
                    <div>
                        <div class="review-card-header">
                            <div class="review-stars">${starsFilled}<span style="color:#cbd5e1;">${starsEmpty}</span></div>
                            <span class="review-badge-verified">✓ Verified Buyer</span>
                        </div>
                        ${r.product ? `<span class="review-product-tag">${escapeHTML(r.product)}</span>` : ''}
                        <h3 class="review-title">${escapeHTML(r.title || 'Excellent Experience')}</h3>
                        <p class="review-comment">"${escapeHTML(r.comment)}"</p>
                    </div>
                    <div class="review-author">
                        <div class="review-avatar">${initial}</div>
                        <div class="review-author-info">
                            <h4>${escapeHTML(r.name)}</h4>
                            <span>📍 ${escapeHTML(r.location || 'Mundra, Gujarat')} · ${dateStr}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.warn('Could not load reviews from API:', err);
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

export function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <div>${escapeHTML(message)}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3800);
}

window.showToast = showToast;

