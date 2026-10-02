// ============================================================
// Rajdeep Enterprise — Express Server
// Secure Admin Portal + Public Storefront
// ============================================================

require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

const db = require('./lib/database');
const { authenticateAdmin } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
//  GLOBAL MIDDLEWARE
// ============================================================

// Security headers (relaxed for development)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Enable CORS for local development (Live Server, different ports)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ============================================================
//  RATE LIMITING
// ============================================================

// General API rate limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { success: false, error: 'Too many requests. Please try again later.' }
});

// Strict rate limit for admin login (brute-force protection)
const adminLoginLimiter = rateLimit({
    windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
    message: {
        success: false,
        error: 'Too many login attempts. Account temporarily locked for 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/admin/login', adminLoginLimiter);

// ============================================================
//  STATIC FILES — Public Website
// ============================================================

// Serve public website static files
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html']
}));

// ============================================================
//  API ROUTES
// ============================================================

// Public API (no auth required)
app.use('/api', publicRoutes);

// Auth API (login/logout/session)
app.use('/api/auth', authRoutes);

// Protected Admin API (requires JWT)
app.use('/api/admin', adminRoutes);

// ============================================================
//  ADMIN PAGE ROUTES
// ============================================================

// Admin Login Page (no auth required — this is the entry point)
app.get('/admin/login', (req, res) => {
    // If already authenticated, redirect to dashboard
    const token = req.cookies?.admin_token;
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect('/admin/dashboard');
        } catch (e) {
            // Token invalid, show login page
            res.clearCookie('admin_token');
        }
    }
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// All other /admin/* routes require authentication
app.get('/admin/dashboard', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/products', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/products/add', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/products/edit/:id', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/users', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/orders', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/leads', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/settings', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/profile', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/reviews', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Redirect legacy /admin.html to secure admin panel
app.get('/admin.html', (req, res) => {
    res.redirect('/admin/dashboard');
});

// Admin static assets (CSS, JS for admin panel)
app.use('/admin/assets', authenticateAdmin, express.static(path.join(__dirname, 'admin', 'assets')));

// ============================================================
//  PUBLIC PAGE ROUTES (catch-all)
// ============================================================

// SPA fallback — serve index.html for unmatched public GET routes
app.use((req, res, next) => {
    // Don't catch API or admin routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/')) {
        return res.status(404).json({ success: false, error: 'Route not found.' });
    }
    if (req.method === 'GET') {
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
    next();
});

// ============================================================
//  ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'An internal server error occurred.'
            : err.message
    });
});

// ============================================================
//  AUTO-SEED & START SERVER
// ============================================================

async function initializeAndStart() {
    // Ensure database exists
    db.ensureDbExists();

    // Auto-seed admin if none exists
    const admins = db.getCollection('admins');
    if (admins.length === 0) {
        console.log('\n🔧 No admin account found. Creating default admin...');

        const email = process.env.ADMIN_EMAIL || 'rajdeepenterprise200@gmail.com';
        const password = process.env.ADMIN_PASSWORD || 'admin@2026secure';

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        db.addToCollection('admins', {
            id: 'admin-' + Date.now(),
            name: 'Rajdeep Enterprise Admin',
            email,
            passwordHash,
            role: 'admin',
            createdAt: new Date().toISOString()
        });

        console.log(`   ✅ Admin created: ${email}`);
        console.log(`   ⚠️  Default password: ${password}`);
        console.log(`   🔐 Change this password after first login!\n`);
    }

    // Auto-seed products if none exist
    const products = db.getCollection('products');
    if (products.length === 0) {
        console.log('📦 Seeding initial product catalog...');
        const { INITIAL_PRODUCTS, INITIAL_LEADS } = require('./data/seed-data');

        for (const p of INITIAL_PRODUCTS) {
            db.addToCollection('products', { ...p, createdAt: new Date().toISOString() });
        }
        console.log(`   ✅ ${INITIAL_PRODUCTS.length} products added.`);

        if (INITIAL_LEADS) {
            for (const l of INITIAL_LEADS) {
                db.addToCollection('leads', l);
            }
            console.log(`   ✅ ${INITIAL_LEADS.length} sample leads added.\n`);
        }
    }

    // Auto-seed reviews if none exist
    const reviews = db.getCollection('reviews');
    if (reviews.length === 0) {
        const { INITIAL_REVIEWS } = require('./data/seed-data');
        if (INITIAL_REVIEWS) {
            for (const r of INITIAL_REVIEWS) {
                db.addToCollection('reviews', r);
            }
            console.log(`   ✅ ${INITIAL_REVIEWS.length} initial reviews added.\n`);
        }
    }

    // Start server
    app.listen(PORT, () => {
        console.log('╔══════════════════════════════════════════════════╗');
        console.log('║   🏪 Rajdeep Enterprise Server                  ║');
        console.log('╠══════════════════════════════════════════════════╣');
        console.log(`║   🌐 Website:      http://localhost:${PORT}          ║`);
        console.log(`║   🔐 Admin Login:   http://localhost:${PORT}/admin/login ║`);
        console.log(`║   📊 Admin Panel:   http://localhost:${PORT}/admin/dashboard ║`);
        console.log('╠══════════════════════════════════════════════════╣');
        console.log('║   📁 Public:  /public/                          ║');
        console.log('║   🔒 Admin:   /admin/ (JWT Protected)           ║');
        console.log('║   🗄️  API:     /api/                             ║');
        console.log('╚══════════════════════════════════════════════════╝');
    });
}

initializeAndStart().catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
