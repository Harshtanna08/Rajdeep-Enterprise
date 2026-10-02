// JSON File-based Database for Rajdeep Enterprise
// Handles reading/writing to data/db.json with atomic operations

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const DATA_DIR = path.join(__dirname, '..', 'data');

// Default database structure
const DEFAULT_DB = {
    admins: [],
    users: [],
    products: [],
    leads: [],
    orders: [],
    reviews: [],
    settings: {
        storeName: 'Rajdeep Enterprise',
        tagline: 'Premium Consumer Electronics & Home Appliances',
        phone: '+91 82642 76734',
        whatsapp: '918264276734',
        email: 'rajdeepenterprise200@gmail.com',
        instagram: 'rajdeep_enterprise_2001',
        instagramUrl: 'https://www.instagram.com/rajdeep_enterprise_2001',
        address: 'Shop No. 01, Baroi Road, near VI Mini Store, Rushbha Nagar, Mundra, Gujarat 370421.',
        timings: '9:00 AM - 9:00 PM (All 7 Days Open)',
        established: '2015',
        city: 'Mundra, Gujarat'
    },
    statistics: {
        totalVisits: 0,
        totalInquiries: 0,
        totalOrders: 0
    }
};

function ensureDbExists() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
    }
}

function readDb() {
    ensureDbExists();
    try {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Error reading database:', err.message);
        return { ...DEFAULT_DB };
    }
}

function writeDb(data) {
    ensureDbExists();
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing database:', err.message);
        return false;
    }
}

// Collection helpers
function getCollection(name) {
    const db = readDb();
    return db[name] || [];
}

function setCollection(name, data) {
    const db = readDb();
    db[name] = data;
    return writeDb(db);
}

function addToCollection(name, item) {
    const db = readDb();
    if (!db[name]) db[name] = [];
    db[name].push(item);
    writeDb(db);
    return item;
}

function updateInCollection(name, id, updates) {
    const db = readDb();
    if (!db[name]) return null;
    const index = db[name].findIndex(item => item.id === id);
    if (index === -1) return null;
    db[name][index] = { ...db[name][index], ...updates };
    writeDb(db);
    return db[name][index];
}

function deleteFromCollection(name, id) {
    const db = readDb();
    if (!db[name]) return false;
    const before = db[name].length;
    db[name] = db[name].filter(item => item.id !== id);
    writeDb(db);
    return db[name].length < before;
}

function findInCollection(name, predicate) {
    const db = readDb();
    if (!db[name]) return null;
    return db[name].find(predicate);
}

function getSettings() {
    const db = readDb();
    return db.settings || DEFAULT_DB.settings;
}

function updateSettings(updates) {
    const db = readDb();
    db.settings = { ...db.settings, ...updates };
    writeDb(db);
    return db.settings;
}

function getStatistics() {
    const db = readDb();
    return db.statistics || DEFAULT_DB.statistics;
}

function updateStatistics(updates) {
    const db = readDb();
    db.statistics = { ...db.statistics, ...updates };
    writeDb(db);
    return db.statistics;
}

module.exports = {
    readDb,
    writeDb,
    getCollection,
    setCollection,
    addToCollection,
    updateInCollection,
    deleteFromCollection,
    findInCollection,
    getSettings,
    updateSettings,
    getStatistics,
    updateStatistics,
    ensureDbExists,
    DEFAULT_DB
};
