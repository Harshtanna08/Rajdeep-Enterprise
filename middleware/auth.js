// Authentication Middleware for Rajdeep Enterprise Admin Portal
// Verifies JWT tokens from HTTP-only cookies and checks admin role

const jwt = require('jsonwebtoken');
const db = require('../lib/database');

// Verify JWT token and attach admin to request
function authenticateAdmin(req, res, next) {
    const token = req.cookies?.admin_token;

    if (!token) {
        // For API requests, return 401
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required. Please log in.'
            });
        }
        // For page requests, redirect to admin login
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify the admin still exists in DB
        const admin = db.findInCollection('admins', a => a.id === decoded.id);
        if (!admin) {
            res.clearCookie('admin_token');
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({
                    success: false,
                    error: 'Admin account not found. Please log in again.'
                });
            }
            return res.redirect('/admin/login');
        }

        // Check role
        if (decoded.role !== 'admin') {
            if (req.path.startsWith('/api/')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. Admin privileges required.'
                });
            }
            return res.redirect('/admin/login');
        }

        // Attach admin info to request
        req.admin = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
        };

        next();
    } catch (err) {
        res.clearCookie('admin_token');
        if (req.path.startsWith('/api/')) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Session expired. Please log in again.'
                });
            }
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication token.'
            });
        }
        return res.redirect('/admin/login');
    }
}

// Generate JWT token for admin
function generateAdminToken(admin) {
    return jwt.sign(
        {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
}

module.exports = {
    authenticateAdmin,
    generateAdminToken
};
