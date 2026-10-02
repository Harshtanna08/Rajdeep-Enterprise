// Storage and State Management for Rajdeep Enterprise

import { INITIAL_PRODUCTS, STORE_INFO, INITIAL_LEADS } from './data.js';

const STORAGE_KEYS = {
    PRODUCTS: 'rajdeep_products_v2',
    STORE_INFO: 'rajdeep_store_info_v2',
    LEADS: 'rajdeep_customer_leads_v2',
    CART: 'rajdeep_cart_v2',
    ADMIN_SESSION: 'rajdeep_admin_logged_in_v2',
    ADMIN_PASSWORD: 'rajdeep_admin_pass_v2',
    USERS: 'rajdeep_users_v2',
    CURRENT_USER: 'rajdeep_current_user_v2'
};

const DEFAULT_ADMIN_PASS = 'admin123';

const DEFAULT_USERS = [
    {
        id: 'user-1',
        name: 'Rahul Sharma',
        phone: '8264276734',
        email: 'rahul.sharma@example.com',
        city: 'Mundra, Gujarat',
        password: 'password123',
        registeredAt: '2026-09-20'
    }
];

export const storage = {
    // Products
    getProducts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
            if (!raw) {
                this.saveProducts(INITIAL_PRODUCTS);
                return INITIAL_PRODUCTS;
            }
            return JSON.parse(raw);
        } catch (e) {
            console.error('Error reading products:', e);
            return INITIAL_PRODUCTS;
        }
    },

    saveProducts(products) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    },

    addProduct(product) {
        const products = this.getProducts();
        product.id = 'prod-' + Date.now();
        product.rating = product.rating || 4.8;
        product.reviewsCount = product.reviewsCount || 1;
        products.unshift(product);
        this.saveProducts(products);
        return product;
    },

    updateProduct(id, updatedFields) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedFields };
            this.saveProducts(products);
            return products[index];
        }
        return null;
    },

    deleteProduct(id) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== id);
        this.saveProducts(filtered);
        return filtered;
    },

    resetToDefaultProducts() {
        this.saveProducts(INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
    },

    // Store Info
    getStoreInfo() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.STORE_INFO);
            if (!raw) {
                this.saveStoreInfo(STORE_INFO);
                return STORE_INFO;
            }
            return { ...STORE_INFO, ...JSON.parse(raw) };
        } catch (e) {
            return STORE_INFO;
        }
    },

    saveStoreInfo(info) {
        localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(info));
    },

    // Leads & Inquiries
    getLeads() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
            if (!raw) {
                this.saveLeads(INITIAL_LEADS);
                return INITIAL_LEADS;
            }
            return JSON.parse(raw);
        } catch (e) {
            return INITIAL_LEADS;
        }
    },

    saveLeads(leads) {
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    },

    addLead(lead) {
        const leads = this.getLeads();
        lead.id = 'lead-' + Date.now();
        lead.date = new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
        lead.status = 'New';
        leads.unshift(lead);
        this.saveLeads(leads);
        return lead;
    },

    updateLeadStatus(id, status) {
        const leads = this.getLeads();
        const lead = leads.find(l => l.id === id);
        if (lead) {
            lead.status = status;
            this.saveLeads(leads);
        }
    },

    deleteLead(id) {
        const leads = this.getLeads().filter(l => l.id !== id);
        this.saveLeads(leads);
        return leads;
    },

    // Cart
    getCart() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.CART);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    },

    saveCart(cart) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    },

    addToCart(productId, qty = 1) {
        const cart = this.getCart();
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ id: productId, qty });
        }
        this.saveCart(cart);
        return cart;
    },

    removeFromCart(productId) {
        const cart = this.getCart().filter(item => item.id !== productId);
        this.saveCart(cart);
        return cart;
    },

    updateCartQty(productId, qty) {
        const cart = this.getCart();
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.qty = Math.max(1, qty);
            this.saveCart(cart);
        }
        return cart;
    },

    clearCart() {
        this.saveCart([]);
    },

    // Admin Auth
    isAdminLoggedIn() {
        return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true' || 
               localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
    },

    setAdminLoggedIn(status) {
        if (status) {
            sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
            localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        } else {
            sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
            localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
        }
    },

    getAdminPassword() {
        return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASS;
    },

    setAdminPassword(newPassword) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword);
    },

    verifyAdminPassword(inputPass) {
        return inputPass === this.getAdminPassword();
    },

    // User Authentication
    getUsers() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.USERS);
            if (!raw) {
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
                return DEFAULT_USERS;
            }
            return JSON.parse(raw);
        } catch (e) {
            return DEFAULT_USERS;
        }
    },

    registerUser(userData) {
        const users = this.getUsers();
        const cleanPhone = (userData.phone || '').replace(/[^0-9]/g, '');
        
        // Check if phone or email already registered
        const existing = users.find(u => 
            (cleanPhone && u.phone === cleanPhone) || 
            (userData.email && u.email && u.email.toLowerCase() === userData.email.toLowerCase())
        );

        if (existing) {
            return { success: false, error: 'A customer account with this mobile number or email already exists!' };
        }

        const newUser = {
            id: 'user-' + Date.now(),
            name: userData.name.trim(),
            phone: cleanPhone,
            email: (userData.email || '').trim().toLowerCase(),
            city: (userData.city || 'Mundra, Gujarat').trim(),
            password: userData.password,
            registeredAt: new Date().toISOString().slice(0, 10)
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        this.setCurrentUser(newUser);
        return { success: true, user: newUser };
    },

    loginUser(identifier, password) {
        const users = this.getUsers();
        const cleanIdent = identifier.trim().toLowerCase();
        const cleanPhone = identifier.replace(/[^0-9]/g, '');

        const user = users.find(u => 
            (u.phone === cleanPhone || (u.email && u.email.toLowerCase() === cleanIdent)) && 
            u.password === password
        );

        if (user) {
            this.setCurrentUser(user);
            return { success: true, user };
        }
        return { success: false, error: 'Invalid mobile/email or password.' };
    },

    getCurrentUser() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
    },

    logoutUser() {
        this.setCurrentUser(null);
    },

    // Export & Import Catalog
    exportCatalogJSON() {
        const data = {
            exportedAt: new Date().toISOString(),
            store: this.getStoreInfo(),
            products: this.getProducts()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rajdeep-enterprise-catalog-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importCatalogJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed.products)) {
                this.saveProducts(parsed.products);
                if (parsed.store) {
                    this.saveStoreInfo(parsed.store);
                }
                return { success: true, count: parsed.products.length };
            } else if (Array.isArray(parsed)) {
                this.saveProducts(parsed);
                return { success: true, count: parsed.length };
            }
            return { success: false, error: 'Invalid file format: products list missing.' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
};
