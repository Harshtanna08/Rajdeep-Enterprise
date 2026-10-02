// Admin Account Seeder — Creates the default admin account
// Run: node scripts/create-admin.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../lib/database');

// Import initial product data
const { INITIAL_PRODUCTS, INITIAL_LEADS } = require('../data/seed-data');

async function seedAdmin() {
    console.log('\n🔧 Rajdeep Enterprise — Admin Account Seeder\n');

    const email = process.env.ADMIN_EMAIL || 'rajdeepenterprise200@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'admin@2026secure';

    // Check if admin already exists
    const existing = db.findInCollection('admins', a => a.email === email);
    if (existing) {
        console.log(`✅ Admin account already exists: ${email}`);
        console.log('   Skipping admin creation.\n');
    } else {
        // Hash password with bcrypt (12 rounds)
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const admin = {
            id: 'admin-' + Date.now(),
            name: 'Rajdeep Enterprise Admin',
            email,
            passwordHash,
            role: 'admin',
            createdAt: new Date().toISOString()
        };

        db.addToCollection('admins', admin);
        console.log(`✅ Admin account created successfully!`);
        console.log(`   Email:    ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   ⚠️  Change this password immediately after first login!\n`);
    }

    // Seed products if none exist
    const products = db.getCollection('products');
    if (products.length === 0) {
        console.log('📦 Seeding initial product catalog...');
        for (const p of INITIAL_PRODUCTS) {
            db.addToCollection('products', {
                ...p,
                createdAt: new Date().toISOString()
            });
        }
        console.log(`   ✅ ${INITIAL_PRODUCTS.length} products added.\n`);
    } else {
        console.log(`📦 Product catalog already has ${products.length} products. Skipping seed.\n`);
    }

    // Seed leads if none exist
    const leads = db.getCollection('leads');
    if (leads.length === 0 && INITIAL_LEADS) {
        console.log('📋 Seeding sample customer leads...');
        for (const l of INITIAL_LEADS) {
            db.addToCollection('leads', l);
        }
        console.log(`   ✅ ${INITIAL_LEADS.length} leads added.\n`);
    }

    console.log('🚀 Seeding complete! Start the server with: npm run dev\n');
}

seedAdmin().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
