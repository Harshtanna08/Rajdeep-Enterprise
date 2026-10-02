// Admin API Routes — Protected CRUD for Products, Leads, Users, Orders, Settings, Statistics
// All routes require authenticateAdmin middleware

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateAdmin } = require('../middleware/auth');
const db = require('../lib/database');

const router = express.Router();

// Apply admin auth to ALL routes in this router
router.use(authenticateAdmin);

// ============================================================
//  DASHBOARD STATISTICS
// ============================================================

// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
    try {
        const products = db.getCollection('products');
        const users = db.getCollection('users');
        const leads = db.getCollection('leads');
        const orders = db.getCollection('orders');
        const reviews = db.getCollection('reviews');
        const stats = db.getStatistics();

        res.json({
            success: true,
            data: {
                totalProducts: products.length,
                totalUsers: users.length,
                totalLeads: leads.length,
                totalOrders: orders.length,
                totalReviews: reviews.length,
                pendingReviews: reviews.filter(r => r.status === 'Pending' || r.status === 'pending').length,
                inStockProducts: products.filter(p => p.inStock).length,
                outOfStockProducts: products.filter(p => !p.inStock).length,
                featuredProducts: products.filter(p => p.featured).length,
                newLeads: leads.filter(l => l.status === 'New').length,
                recentLeads: leads.slice(0, 5),
                recentOrders: orders.slice(0, 5),
                statistics: stats
            }
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ success: false, error: 'Failed to load dashboard data.' });
    }
});

// ============================================================
//  PRODUCTS CRUD
// ============================================================

// GET /api/admin/products
router.get('/products', (req, res) => {
    try {
        const products = db.getCollection('products');
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load products.' });
    }
});

// GET /api/admin/products/:id
router.get('/products/:id', (req, res) => {
    try {
        const product = db.findInCollection('products', p => p.id === req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found.' });
        }
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load product.' });
    }
});

// POST /api/admin/products
router.post('/products', (req, res) => {
    try {
        const { title, model, category, brand, price, mrp, energyStar, starRating,
            image, shortDesc, specs, inStock, featured } = req.body;

        if (!title || !category || !brand || !price) {
            return res.status(400).json({
                success: false,
                error: 'Title, category, brand, and price are required.'
            });
        }

        const fallbackImages = {
            'ac': 'assets/images/ac.jpg',
            'refrigerator': 'assets/images/refrigerator.jpg',
            'washing-machine': 'assets/images/washing-machine.jpg',
            'tv': 'assets/images/tv.jpg',
            'sound-system': 'assets/images/sound-system.jpg'
        };

        const product = {
            id: 'prod-' + Date.now(),
            title: title.trim(),
            model: (model || '').trim(),
            category,
            brand: brand.trim(),
            price: parseFloat(price) || 0,
            mrp: parseFloat(mrp) || parseFloat(price) || 0,
            energyStar: (energyStar || '').trim(),
            starRating: parseInt(starRating) || 5,
            rating: 4.8,
            reviewsCount: 1,
            image: image || fallbackImages[category] || 'assets/images/ac.jpg',
            shortDesc: (shortDesc || '').trim(),
            specs: Array.isArray(specs) ? specs : (specs || '').split('\n').map(s => s.trim()).filter(Boolean),
            inStock: inStock !== false,
            featured: Boolean(featured),
            createdAt: new Date().toISOString(),
            createdBy: req.admin.id
        };

        db.addToCollection('products', product);

        res.status(201).json({ success: true, data: product });
    } catch (err) {
        console.error('Add product error:', err);
        res.status(500).json({ success: false, error: 'Failed to add product.' });
    }
});

// PUT /api/admin/products/:id
router.put('/products/:id', (req, res) => {
    try {
        const existing = db.findInCollection('products', p => p.id === req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Product not found.' });
        }

        const updates = {};
        const allowed = ['title', 'model', 'category', 'brand', 'price', 'mrp',
            'energyStar', 'starRating', 'image', 'shortDesc', 'specs', 'inStock', 'featured'];

        for (const key of allowed) {
            if (req.body[key] !== undefined) {
                if (key === 'price' || key === 'mrp') {
                    updates[key] = parseFloat(req.body[key]) || 0;
                } else if (key === 'starRating') {
                    updates[key] = parseInt(req.body[key]) || 5;
                } else if (key === 'specs' && typeof req.body[key] === 'string') {
                    updates[key] = req.body[key].split('\n').map(s => s.trim()).filter(Boolean);
                } else {
                    updates[key] = req.body[key];
                }
            }
        }

        updates.updatedAt = new Date().toISOString();
        updates.updatedBy = req.admin.id;

        const updated = db.updateInCollection('products', req.params.id, updates);
        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ success: false, error: 'Failed to update product.' });
    }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', (req, res) => {
    try {
        const deleted = db.deleteFromCollection('products', req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Product not found.' });
        }
        res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete product.' });
    }
});

// ============================================================
//  LEADS (Customer Inquiries)
// ============================================================

// GET /api/admin/leads
router.get('/leads', (req, res) => {
    try {
        const leads = db.getCollection('leads');
        res.json({ success: true, data: leads });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load leads.' });
    }
});

// PUT /api/admin/leads/:id/status
router.put('/leads/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required.' });
        }
        const updated = db.updateInCollection('leads', req.params.id, { status });
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Lead not found.' });
        }
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update lead status.' });
    }
});

// DELETE /api/admin/leads/:id
router.delete('/leads/:id', (req, res) => {
    try {
        const deleted = db.deleteFromCollection('leads', req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Lead not found.' });
        }
        res.json({ success: true, message: 'Lead deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete lead.' });
    }
});

// ============================================================
//  USERS (View Customer Accounts)
// ============================================================

// GET /api/admin/users
router.get('/users', (req, res) => {
    try {
        const users = db.getCollection('users');
        // Remove passwords from response
        const safeUsers = users.map(({ password, ...u }) => u);
        res.json({ success: true, data: safeUsers });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load users.' });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
    try {
        const deleted = db.deleteFromCollection('users', req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }
        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete user.' });
    }
});

// ============================================================
//  ORDERS
// ============================================================

// GET /api/admin/orders
router.get('/orders', (req, res) => {
    try {
        const orders = db.getCollection('orders');
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load orders.' });
    }
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const updated = db.updateInCollection('orders', req.params.id, {
            status,
            updatedAt: new Date().toISOString()
        });
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Order not found.' });
        }
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update order.' });
    }
});

// ============================================================
//  SETTINGS
// ============================================================

// GET /api/admin/settings
router.get('/settings', (req, res) => {
    try {
        const settings = db.getSettings();
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load settings.' });
    }
});

// PUT /api/admin/settings
router.put('/settings', (req, res) => {
    try {
        const allowed = ['storeName', 'tagline', 'phone', 'whatsapp', 'email',
            'instagram', 'instagramUrl', 'address', 'timings', 'city'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }
        const settings = db.updateSettings(updates);
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update settings.' });
    }
});

// ============================================================
//  STATISTICS
// ============================================================

// GET /api/admin/statistics
router.get('/statistics', (req, res) => {
    try {
        const products = db.getCollection('products');
        const users = db.getCollection('users');
        const leads = db.getCollection('leads');
        const orders = db.getCollection('orders');

        // Category breakdown
        const categories = {};
        products.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });

        // Revenue estimate from orders
        const totalRevenue = orders
            .filter(o => o.status === 'Completed')
            .reduce((sum, o) => sum + (o.total || 0), 0);

        res.json({
            success: true,
            data: {
                totalProducts: products.length,
                totalUsers: users.length,
                totalLeads: leads.length,
                totalOrders: orders.length,
                categoryBreakdown: categories,
                totalRevenue,
                newLeadsToday: leads.filter(l => {
                    const d = new Date(l.date || l.createdAt);
                    const today = new Date();
                    return d.toDateString() === today.toDateString();
                }).length
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load statistics.' });
    }
});

// ============================================================
//  REVIEWS MANAGEMENT
// ============================================================

// GET /api/admin/reviews
router.get('/reviews', (req, res) => {
    try {
        const reviews = db.getCollection('reviews');
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load reviews.' });
    }
});

// PUT /api/admin/reviews/:id/status
router.put('/reviews/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required.' });
        }
        const updated = db.updateInCollection('reviews', req.params.id, { status });
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Review not found.' });
        }
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update review status.' });
    }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', (req, res) => {
    try {
        const deleted = db.deleteFromCollection('reviews', req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Review not found.' });
        }
        res.json({ success: true, message: 'Review deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete review.' });
    }
});

module.exports = router;
