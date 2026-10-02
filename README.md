# Rajdeep Enterprise - Premium Electronics Showroom Web Application

A modern, high-performance web storefront built for **Rajdeep Enterprise**, specializing in home appliances and consumer electronics:
- ❄️ **Air Conditioners (AC)**: Split Inverters, 5-Star BEE, Dual Inverter tech.
- 🧊 **Refrigerators (Freeze)**: Side-by-Side Smart Hubs, Frost-Free Double Door, Multi-Door.
- 🧺 **Washing Machines**: AI Direct-Drive Front Loaders, Inverter Top Loaders.
- 📺 **Smart TVs**: Cinema-grade 4K OLED, QLED, and Google TVs.
- 🔊 **Sound Systems**: 5.1 Dolby Atmos Soundbars, Wireless Subwoofers, Hi-Fi Speakers.

---

## 🌟 Key Features

### For Customers:
1. **Curated Showcase**: Hero banner with live festive offers, exchange bonuses, and 0% EMI schemes.
2. **Category Navigator**: Instant filtering for AC, Freeze (Refrigerators), Washing Machines, Smart TVs, and Sound Systems.
3. **Live Search & Multi-Filters**: Instant search by keywords, brand (Sony, Samsung, LG, Daikin, Bosch, etc.), price sorting, and in-stock toggle.
4. **Appliance Specifications**: Detailed modal with technical features, star ratings, dimensions, and compressor warranty.
5. **Interactive 0% EMI Calculator**: Sliders for appliance cost and down payment with monthly installment breakdown.
6. **Instant WhatsApp Deals**: One-click button pre-filling customer inquiry messages to the showroom manager.
7. **Quotation Cart**: Add multiple appliances to a quote cart and send direct orders via WhatsApp.

### For Store Admin (Owner / Manager):
- **Discreet Access**: Click the 🔒 lock icon in the top header or footer.
- **Default Admin Password**: `admin123`
- **Admin Capabilities**:
  - ➕ **Add New Products**: Fill in name, category, brand, model, price, MRP, star rating, specifications, and upload custom images (or pick from built-in high-res presets).
  - ✏️ **Edit Products**: Update prices, discounts, stock availability, or descriptions anytime.
  - 🗑️ **Delete Products**: Remove discontinued models with one click.
  - 📋 **Customer Leads Dashboard**: Review customer quotation requests with date, name, phone, and direct WhatsApp reply buttons.
  - 💾 **Export / Import Backup**: Save catalog to a `.json` file and restore on any computer.
  - 🔄 **Factory Reset**: Revert back to default demo catalog anytime.

---

## 🚀 How to Run Locally

You can run the store using any browser:
1. **Option A (Instant)**: Simply double-click [`index.html`](file:///c:/Users/harsh/OneDrive/Desktop/Shop/index.html) in your file explorer.
2. **Option B (Local Dev Server)**:
   ```powershell
   npx -y serve -p 3000
   ```
   Then open `http://localhost:3000` in your web browser.

---

## 📝 Information to Customize Your Store

To personalize the website with your exact enterprise details, you can update [`js/data.js`](file:///c:/Users/harsh/OneDrive/Desktop/Shop/js/data.js):
- **Phone Number**: Your showroom contact number
- **WhatsApp Number**: Mobile number with country code for direct orders (e.g. `919876543210`)
- **Showroom Address**: Full physical address
- **Showroom Timings**: Working hours (e.g., 10 AM to 9:30 PM)
- **Admin Password**: Configurable in [`js/storage.js`](file:///c:/Users/harsh/OneDrive/Desktop/Shop/js/storage.js)
