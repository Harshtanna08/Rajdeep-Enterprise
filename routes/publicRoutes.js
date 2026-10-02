// Public API Routes — Accessible without authentication
// Serves products, handles inquiries, and user registration/login

const express = require('express');
const db = require('../lib/database');

const router = express.Router();

// GET /api/products — Public product listing
router.get('/products', (req, res) => {
    try {
        const products = db.getCollection('products');
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load products.' });
    }
});

// GET /api/products/:id — Single product details
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

// POST /api/inquiries — Submit customer inquiry/lead
router.post('/inquiries', (req, res) => {
    try {
        const { name, phone, product, message } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Name and phone number are required.'
            });
        }

        const lead = {
            id: 'lead-' + Date.now(),
            name: name.trim(),
            phone: phone.trim(),
            email: (req.body.email || '').trim(),
            product: (product || 'General Inquiry').trim(),
            notes: (message || '').trim(),
            status: 'New',
            date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
            createdAt: new Date().toISOString()
        };

        db.addToCollection('leads', lead);

        // Update statistics
        const stats = db.getStatistics();
        db.updateStatistics({ totalInquiries: (stats.totalInquiries || 0) + 1 });

        res.status(201).json({ success: true, data: lead });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to submit inquiry.' });
    }
});

// POST /api/users/register — Customer registration
router.post('/users/register', (req, res) => {
    try {
        const { name, phone, email, city, password } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, phone number, and password are required.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters.'
            });
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const users = db.getCollection('users');

        // Check duplicates
        const existing = users.find(u =>
            (cleanPhone && u.phone === cleanPhone) ||
            (email && u.email && u.email.toLowerCase() === email.toLowerCase())
        );

        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'An account with this mobile number or email already exists.'
            });
        }

        const user = {
            id: 'user-' + Date.now(),
            name: name.trim(),
            phone: cleanPhone,
            email: (email || '').trim().toLowerCase(),
            city: (city || 'Mundra, Gujarat').trim(),
            password, // Note: For a production app, hash with bcrypt
            registeredAt: new Date().toISOString().slice(0, 10)
        };

        db.addToCollection('users', user);

        // Don't send password back
        const { password: _, ...safeUser } = user;
        res.status(201).json({ success: true, user: safeUser });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Registration failed.' });
    }
});

// POST /api/users/login — Customer login
router.post('/users/login', (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                error: 'Identifier and password are required.'
            });
        }

        const cleanIdent = identifier.trim().toLowerCase();
        const cleanPhone = identifier.replace(/[^0-9]/g, '');

        const user = db.findInCollection('users', u =>
            (u.phone === cleanPhone || (u.email && u.email.toLowerCase() === cleanIdent)) &&
            u.password === password
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid mobile/email or password.'
            });
        }

        const { password: _, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Login failed.' });
    }
});

// GET /api/store-info — Public store information
router.get('/store-info', (req, res) => {
    try {
        const settings = db.getSettings();
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load store info.' });
    }
});

// ============================================================
//  REVIEWS & FEEDBACK
// ============================================================

// GET /api/reviews — Public approved reviews
router.get('/reviews', (req, res) => {
    try {
        const reviews = db.getCollection('reviews');
        // Return only approved reviews
        const approved = reviews.filter(r => r.status === 'Approved' || !r.status);
        res.json({ success: true, data: approved });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load reviews.' });
    }
});

// POST /api/reviews — Submit review / feedback
router.post('/reviews', (req, res) => {
    try {
        const { name, location, rating, product, title, comment, email, phone } = req.body;

        if (!name || !comment) {
            return res.status(400).json({
                success: false,
                error: 'Your name and feedback comment are required.'
            });
        }

        const numRating = Math.min(5, Math.max(1, parseInt(rating) || 5));

        const review = {
            id: 'rev-' + Date.now(),
            name: name.trim(),
            location: (location || 'Mundra, Gujarat').trim(),
            email: (email || '').trim(),
            phone: (phone || '').trim(),
            rating: numRating,
            product: (product || 'Showroom Experience').trim(),
            title: (title || `${numRating} Star Review`).trim(),
            comment: comment.trim(),
            verified: true,
            status: 'Approved',
            createdAt: new Date().toISOString()
        };

        db.addToCollection('reviews', review);
        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to submit review.' });
    }
});

module.exports = router;
