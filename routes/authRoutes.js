// Admin Authentication API Routes
// Handles login, logout, and session verification

const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateAdmin, generateAdminToken } = require('../middleware/auth');
const db = require('../lib/database');

const router = express.Router();

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required.'
            });
        }

        // Find admin by email
        const admin = db.findInCollection('admins', a =>
            a.email.toLowerCase() === email.toLowerCase().trim()
        );

        if (!admin) {
            // Use generic message to prevent email enumeration
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password.'
            });
        }

        // Generate JWT
        const token = generateAdminToken(admin);

        // Set HTTP-only cookie
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Update last login
        db.updateInCollection('admins', admin.id, {
            lastLogin: new Date().toISOString()
        });

        res.json({
            success: true,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: 'admin'
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            error: 'An internal server error occurred.'
        });
    }
});

// POST /api/auth/admin/logout
router.post('/admin/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/admin/session — verify current session
router.get('/admin/session', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        admin: req.admin
    });
});

// PUT /api/auth/admin/password — change admin password
router.put('/admin/password', authenticateAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current and new password are required.'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 8 characters long.'
            });
        }

        // Get current admin
        const admin = db.findInCollection('admins', a => a.id === req.admin.id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin account not found.'
            });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect.'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const newHash = await bcrypt.hash(newPassword, salt);

        // Update
        db.updateInCollection('admins', admin.id, { passwordHash: newHash });

        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({
            success: false,
            error: 'An internal server error occurred.'
        });
    }
});

// PUT /api/auth/admin/profile — update admin profile
router.put('/admin/profile', authenticateAdmin, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Name and email are required.'
            });
        }

        // Check if email is taken by another admin
        const existingAdmin = db.findInCollection('admins', a =>
            a.email.toLowerCase() === email.toLowerCase().trim() && a.id !== req.admin.id
        );
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                error: 'This email is already used by another admin.'
            });
        }

        const updated = db.updateInCollection('admins', req.admin.id, {
            name: name.trim(),
            email: email.toLowerCase().trim()
        });

        // Re-generate token with updated info
        const token = generateAdminToken(updated);
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            admin: {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                role: 'admin'
            }
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({
            success: false,
            error: 'An internal server error occurred.'
        });
    }
});

module.exports = router;
