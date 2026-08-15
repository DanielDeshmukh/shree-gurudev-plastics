# Shree Gurudev Plastics — Project Documentation

---

## Client Profile

| Detail | Info |
|--------|------|
| **Business** | Shree Gurudev Plastics |
| **Owner** | Sindhi businessman |
| **Location** | Naigaon, Bhayander, Maharashtra, India |
| **Warehouse** | 5,000 sq ft |
| **Products** | Plastic chairs, tables, buckets, containers, storage, kitchenware, accessories |
| **Brands Stocked** | Aristo, KG Plast, Mango Chairs |
| **Total Products** | 866+ across 3 brand catalogs |
| **WhatsApp** | +91 85520 84251 |
| **Business Model** | Wholesale distributor, bulk seller, monthly subscription |
| **Competition** | Other plastic product distributors and retail brands in Mumbai/Thane/Palghar region |
| **Goal** | Dominate Google search for plastic products in the Bhayander/Mumbai region and drive WhatsApp enquiries |

---

## Implemented Features

### Customer-Facing Features (16)

---

#### 1. SEO Suite

A complete search engine optimization system covering meta tags, Open Graph, Twitter cards, JSON-LD structured data, dynamic sitemaps, and robots.txt across every page of the website.

**Why it matters:** Without SEO, the website is invisible to Google. Every product, brand, and category page needs to be properly indexed so that when someone searches "plastic chair Bhayander" or "bulk plastic seller Mumbai", our client's website appears — not the competitor's.

---

#### 2. Aggressive SEO Strategy

80+ targeted keywords covering product terms (plastic chair, plastic bucket), location terms (Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, Palghar), and business terms (bulk seller, distributor, wholesale, manufacturer). Includes LocalBusiness schema with geo-coordinates, FAQ schema for rich snippets, Breadcrumb schema, category landing pages, About page, and Contact page — all keyword-optimized.

**Why it matters:** Basic SEO isn't enough to beat competitors. We target every possible search combination a buyer might use. Location-specific keywords ensure we dominate local search results. FAQ schema creates rich snippets that attract more clicks.

---

#### 3. Server-Side Pagination

Products are loaded 24 per page instead of all 866 at once. Includes Previous/Next buttons, page numbers with ellipsis for large ranges, and smooth scroll-to-top on page change.

**Why it matters:** Loading 866 products at once is slow and creates a poor user experience — especially on mobile phones where most buyers browse. Pagination makes the site fast and usable.

---

#### 4. WhatsApp Cart

A cart system where buyers can add multiple products, adjust quantities, and send a single formatted WhatsApp message listing all selected products with quantities, colors, sizes, and total value.

**Why it matters:** Buyers don't usually want just one product. A retailer might need 5 different chairs, 3 types of buckets, and 10 containers. The cart lets them build an entire order and enquire once instead of sending 18 separate messages.

---

#### 5. Product Comparison

Buyers can select up to 4 products and compare them side-by-side in a table showing image, name, brand, price, color, size, category, stock status, and enquiry button.

**Why it matters:** Plastic products come in many variations. Buyers need to compare options before deciding. Comparison also showcases the breadth of the product catalog — a buyer looking at one chair might discover another color or size they prefer.

---

#### 6. Minimum Order Quantity (MOQ)

Each product can have a minimum order quantity set by the admin. The cart enforces this minimum. MOQ badges appear on product cards and detail pages.

**Why it matters:** As a wholesale distributor, selling 1 or 2 items isn't profitable. MOQ ensures every enquiry is worth the client's time and positions the business as a serious wholesale operation.

---

#### 7. Request a Quote

A dedicated form at `/quote` where buyers can submit detailed quote requests including name, phone, email, company, product category, quantity, description, brand preference, delivery location, and expected date. The form sends a formatted WhatsApp message with all details.

**Why it matters:** Not every buyer knows exactly what they want from the catalog. A quote request form captures all the details upfront, so the client can provide an accurate quote without back-and-forth messages.

---

#### 8. Dealer/Distributor Locator

A page showing the business location on a map, service areas (Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, Palghar), and delivery coverage information.

**Why it matters:** Buyers want to know if the business delivers to their area before enquiring. A locator answers this question immediately, building trust and reducing unnecessary enquiries.

---

#### 9. Product Tags

Badges on product cards like "Best Seller", "New Arrival", "Sale", "Bulk Discount". Admin can assign tags via the admin panel.

**Why it matters:** Tags guide buyers to popular products, new stock, and deals. They create visual hierarchy and urgency, helping buyers navigate a catalog of 866+ products.

---

#### 10. Recently Viewed Products

Tracks and displays the last 5-8 products a visitor viewed, shown as a section on the homepage or product pages.

**Why it matters:** Buyers often browse multiple products before deciding. Recently viewed makes it easy to pick up where they left off, reducing abandoned browsing sessions.

---

#### 11. Wishlist

Buyers can save products to a wishlist for later reference. Saved products persist across sessions.

**Why it matters:** Not every visitor is ready to buy immediately. A wishlist lets them bookmark products without committing to an enquiry.

---

#### 12. Multi-language (Hindi + English)

Toggle between Hindi and English across the entire website. Product names, descriptions, navigation, and UI text available in both languages.

**Why it matters:** Many buyers in the Bhayander/Mumbai region prefer Hindi. A bilingual website serves both English-speaking and Hindi-speaking customers, expanding the potential customer base.

---

#### 13. Product Reviews / Ratings

Buyers can leave star ratings and text reviews on products they've purchased. Reviews visible on product detail pages.

**Why it matters:** Social proof is powerful. A product with 50 positive reviews is more trusted than one with zero reviews. Reviews also generate unique, keyword-rich content that helps SEO.

---

#### 14. Delivery Pincode Check

Buyers enter their pincode to check if delivery is available in their area and estimated delivery time.

**Why it matters:** Delivery uncertainty is a major reason buyers abandon enquiries. Instant delivery confirmation removes a key barrier.

---

#### 15. Image Lazy Loading + Blur Placeholders

Product images load only when they scroll into view, with a blurred placeholder shown first.

**Why it matters:** 866 products with images = massive page weight. Lazy loading loads only what's visible, making pages feel instant.

---

#### 16. PWA (Progressive Web App)

Website installable on mobile phones as an app. Works offline, sends push notifications, loads instantly.

**Why it matters:** Mobile buyers want app-like experiences without downloading from the Play Store. PWA gives them that — install from the browser, works offline, feels native.

---

### Admin Panel Features (16)

---

#### 17. Dashboard

Revenue stats, order counts, customer metrics, low stock alerts, top products chart, recent orders table.

---

#### 18. Product Management

CRUD products with images, categories, pricing tiers, MOQ, stock levels. 866+ products managed from one place.

---

#### 19. Brand Management

Manage brand catalogs (Aristo, KG Plast, Mango Chairs) with logos and descriptions.

---

#### 20. Order Management

View, update, and track all customer orders. Status flow: pending → confirmed → shipped → arrived → delivered.

---

#### 21. GST Invoice

Auto-generated invoices with CGST/SGST (intra-state) or IGST (inter-state), HSN codes, format `SGP/YYMM/NNNN`. Invoice model with line items.

---

#### 22. Tiered Pricing

4 tiers (Retailer / Dealer / Distributor / Bulk) with auto-calculation based on customer's order count and total spend.

---

#### 23. Price Lock

Lock product prices for 24h–7d. Full price change audit trail with PriceHistory model.

---

#### 24. Recurring Orders

Subscription orders (daily / weekly / biweekly / monthly) with pause / resume / cancel. Auto-creates orders on schedule.

---

#### 25. Supplier Management

Supplier database with contact details, GST numbers, addresses.

---

#### 26. Purchase Orders

Create POs, track status (pending → ordered → received), auto-calculate totals.

---

#### 27. Delivery Scheduling

Time slot management, delivery assignment, dispatch tracking.

---

#### 28. Credit/Ledger

Customer credit accounts, running balance, payment tracking.

---

#### 29. Product Bundles

Create combo deals with auto-calculated discounts. Bundle model with items.

---

#### 30. Customer Database

Auto-created on order, tracks total orders, spending, customer tier. Full customer management page.

---

#### 31. Analytics Dashboard

Sales timeline, category breakdown, top products, top customers. Built with Recharts.

---

#### 32. Inventory Alerts

Low stock notifications with configurable thresholds per product.

---

### WhatsApp Integration Features (3)

---

#### 33. WhatsApp Follow-up

4 templates: order confirmation, delivery follow-up, review request, restock alert. Admin selects customer, generates message, opens WhatsApp.

---

#### 34. WhatsApp Arrival Notification

When warehouse stock arrives at the main store, admin changes order status to "Arrived" → "Notify" button appears → opens WhatsApp with pre-filled pickup message including itemized list, store address, and phone number.

**Why it matters:** Not all customers can be present at the store. They wait for bulk and specified products to arrive from the warehouse. Automated notification saves time and improves customer experience.

---

#### 35. Festival Broadcast

Send Diwali, Raksha Bandhan, Holi, New Year, Navratri, Christmas, Pongal, Eid greetings to all customers via WhatsApp. Custom message support with `{name}` placeholder for personalization.

**Why it matters:** Festival greetings build customer relationships. Personalized messages with customer name feel thoughtful, not spammy. Keeps the business top-of-mind during festive seasons when purchasing peaks.

---

### Reporting Features (2)

---

#### 36. Excel Sales Reports

Daily and monthly sales reports in `.xlsx` format with branded formatting, itemized orders, GST summary.

---

#### 37. Price History Report

Track all price changes across products with timestamps, old price, new price, and who made the change.

---

### Security & Infrastructure Features (6)

---

#### 38. Server-Side Auth

JWT + bcrypt, httpOnly cookies, 7-day expiry. Credentials stored in `.env` not hardcoded.

---

#### 39. Middleware Protection

All `/admin/*` routes validated server-side before page load. Returns 404 on registration routes.

---

#### 40. Single Admin Lockdown

Only one admin account permitted. Enforced at ORM level (Prisma extension), login level, and middleware level.

---

#### 41. Error Handling

Global error boundary, 404/500 pages, loading states for both public and admin routes. Standardized API error responses.

---

#### 42. CI/CD Pipeline

GitHub Actions — lint, typecheck, build on every push/PR to main.

---

#### 43. CSS Theme System

Theme color via `@theme` block in `globals.css` — change entire orange theme in one place by editing hex values.

---

## Feature Summary

| Category | Count | Features |
|----------|-------|-----------|
| Customer-Facing | 16 | SEO Suite, Aggressive SEO, Pagination, WhatsApp Cart, Product Comparison, MOQ, Request a Quote, Dealer Locator, Product Tags, Recently Viewed, Wishlist, Multi-language, Product Reviews, Pincode Check, Lazy Loading, PWA |
| Admin Panel | 16 | Dashboard, Product Management, Brand Management, Order Management, GST Invoice, Tiered Pricing, Price Lock, Recurring Orders, Supplier Management, Purchase Orders, Delivery Scheduling, Credit/Ledger, Product Bundles, Customer Database, Analytics, Inventory Alerts |
| WhatsApp Integration | 3 | Follow-up, Arrival Notification, Festival Broadcast |
| Reporting | 2 | Excel Reports, Price History |
| Security & Infrastructure | 6 | Auth, Middleware, Single Admin, Error Handling, CI/CD, CSS Theme |
| **Total** | **43** | |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | SQLite + Prisma 6.12 |
| Image Storage | Cloudinary |
| Authentication | JWT + bcryptjs |
| Charts | Recharts |
| Excel Export | Exceljs |
| Icons | react-icons |
| PWA | Service Worker + Manifest |

---

## Project Structure

```
shree-gurudev-plastics/
├── prisma/
│   ├── schema.prisma          # 20+ models (Product, Order, Customer, Invoice, etc.)
│   └── seed.ts                # 866+ products from Aristo, KG Plast, Mango Chairs
├── src/
│   ├── app/
│   │   ├── admin/             # 15+ admin pages
│   │   │   ├── layout.tsx     # Admin sidebar with 19 nav links
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── invoices/
│   │   │   ├── reports/
│   │   │   ├── analytics/
│   │   │   ├── reviews/
│   │   │   ├── inventory/
│   │   │   ├── customers/
│   │   │   ├── followup/
│   │   │   ├── broadcast/
│   │   │   ├── price-lock/
│   │   │   ├── recurring-orders/
│   │   │   ├── suppliers/
│   │   │   ├── purchase-orders/
│   │   │   ├── delivery/
│   │   │   ├── ledger/
│   │   │   ├── bundles/
│   │   │   └── login/
│   │   ├── api/               # 30+ API endpoints
│   │   ├── products/
│   │   ├── product/[id]/
│   │   ├── brands/
│   │   ├── compare/
│   │   ├── wishlist/
│   │   ├── quote/
│   │   ├── contact/
│   │   ├── about/
│   │   └── sitemap.xml/
│   ├── components/            # Reusable UI components
│   └── lib/                   # Auth, DB, pricing, GST, pincodes
├── public/                    # PWA manifest, icons, service worker
├── middleware.ts               # Server-side admin route protection
└── .github/workflows/ci.yml   # GitHub Actions CI
```

---

## Cost Breakdown & Pricing Justification

### What This Project Actually Is

This is **not a basic website**. This is a **custom business management system** with:

- 16 customer-facing pages with full SEO
- 16 admin panel pages with 19 navigation sections
- 30+ API endpoints
- 866+ products seeded from 3 brand catalogs
- WhatsApp integrations (cart, follow-up, arrival notification, festival broadcast)
- GST invoicing with CGST/SGST/IGST
- Customer database with tiered pricing (4 levels)
- Supplier management + purchase orders
- Delivery scheduling + credit ledger
- Analytics dashboard with Recharts
- Excel report generation
- Product bundles, price lock, recurring orders
- PWA, CI/CD, error handling, theme system

---

### Market Rates for This Scope (2026 Research)

Based on multiple Indian freelance/agency pricing guides published in 2025-2026:

#### Hourly Rates (India)

| Experience Level | Indian Client Rate (₹/hr) | International Rate ($/hr) |
|------------------|---------------------------|---------------------------|
| Junior (0-2 yrs) | ₹300 – ₹800 | $8 – $18 |
| Mid-Level (2-5 yrs) | ₹800 – ₹2,000 | $18 – $40 |
| Senior (5+ yrs) | ₹2,000 – ₹4,000 | $40 – $80 |
| Specialist/Niche | ₹3,000 – ₹6,000 | $60 – $120+ |

#### Project Rates (India, 2026)

| Project Type | Beginner | Mid-Level | Senior |
|--------------|----------|-----------|--------|
| Basic Landing Page | ₹5,000 – ₹12,000 | ₹12,000 – ₹25,000 | ₹25,000 – ₹60,000 |
| 5-Page Business Website | ₹12,000 – ₹25,000 | ₹25,000 – ₹60,000 | ₹60,000 – ₹1,20,000 |
| 10-20 Page Professional Site | ₹25,000 – ₹50,000 | ₹50,000 – ₹1,20,000 | ₹1,20,000 – ₹2,50,000 |
| E-commerce Website | ₹35,000 – ₹70,000 | ₹70,000 – ₹2,00,000 | ₹2,00,000 – ₹5,00,000+ |
| Custom Web Application | ₹80,000 – ₹2,00,000 | ₹2,00,000 – ₹5,00,000 | ₹5,00,000 – ₹20,00,000 |
| Next.js Custom App | ₹75,000 – ₹1,50,000 | ₹1,50,000 – ₹4,00,000 | ₹4,00,000 – ₹8,00,000 |

#### Monthly Maintenance Rates (India, 2026)

| Scope | Rate (₹/month) |
|-------|----------------|
| Basic site maintenance | ₹3,000 – ₹6,000 |
| Mid-complexity (CMS + updates) | ₹6,000 – ₹15,000 |
| Complex app (features + support) | ₹15,000 – ₹35,000 |

---

### Where This Project Falls

This project is a **Custom Web Application** / **Next.js Custom App** — not a basic business website.

**Market rate for this scope:**

| Provider | Rate for This Scope |
|----------|---------------------|
| Freelancer (Tier 2/3 city) | ₹50,000 – ₹1,00,000 |
| Freelancer (Metro city) | ₹1,00,000 – ₹2,50,000 |
| Boutique Agency | ₹1,50,000 – ₹3,00,000 |
| Mid-Size Agency | ₹3,00,000 – ₹8,00,000 |
| Enterprise (TCS, Infosys) | ₹8,00,000 – ₹20,00,000 |

**Sources:** buildbyravirai.com, zethic.com, raafiinfotech.com, innovatrixinfotech.com, byteminders.com, tusharbuilds.com, itdgrowthlabs.com — all published 2025-2026.

---

### Why ₹25,000 One-Time is Fair

| Factor | Detail |
|--------|--------|
| **What was built** | 43 features, 30+ API endpoints, 16+16 pages, 866 products |
| **Market rate (mid-level freelancer)** | ₹1,00,000 – ₹2,50,000 |
| **What you're charging** | ₹25,000 |
| **Discount from market** | 75% – 90% below market rate |
| **Equivalent hourly rate** | If this took ~100 hours, ₹250/hr — below junior rate (₹300-800/hr) |

**You're not overcharging. You're giving away a ₹1-2 lakh project for ₹25,000.**

---

### Why ₹6,000/Month Maintenance is Fair

| What's Included | Market Rate |
|-----------------|-------------|
| Bug fixes and issue resolution | ₹2,000 – ₹5,000/mo |
| Feature additions (small) | ₹3,000 – ₹8,000/mo |
| Product updates (new items, price changes) | ₹2,000 – ₹5,000/mo |
| WhatsApp integration maintenance | ₹1,000 – ₹3,000/mo |
| Security updates + monitoring | ₹1,000 – ₹3,000/mo |
| **Total market rate** | **₹9,000 – ₹24,000/mo** |
| **What you're charging** | **₹6,000/mo** |
| **Discount** | **33% – 75% below market** |

---

### Complete Cost Breakdown

#### Development Costs (What You Built)

| Component | Hours (Est.) | Market Rate (₹) | You're Charging |
|-----------|-------------|-----------------|-----------------|
| Customer-facing pages (16) | 30-40 hrs | 30,000 – 60,000 | |
| Admin panel (16 pages) | 40-50 hrs | 40,000 – 80,000 | |
| 30+ API endpoints | 25-35 hrs | 25,000 – 50,000 | |
| 866+ products data entry | 15-20 hrs | 10,000 – 20,000 | |
| WhatsApp integrations (4) | 20-25 hrs | 20,000 – 40,000 | |
| GST invoicing system | 15-20 hrs | 15,000 – 30,000 | |
| Customer DB + tiered pricing | 15-20 hrs | 15,000 – 25,000 | |
| Inventory + suppliers + POs | 20-25 hrs | 20,000 – 40,000 | |
| Delivery + credit ledger | 15-20 hrs | 15,000 – 25,000 | |
| Analytics (Recharts) | 10-15 hrs | 10,000 – 20,000 | |
| Excel reports | 8-10 hrs | 8,000 – 15,000 | |
| SEO (80+ keywords) | 15-20 hrs | 15,000 – 30,000 | |
| PWA + CI/CD + error handling | 10-15 hrs | 10,000 – 20,000 | |
| Testing + bug fixes | 20-30 hrs | 15,000 – 30,000 | |
| **Total** | **258-345 hrs** | **₹2,48,000 – ₹4,90,000** | **₹25,000** |

#### Infrastructure Costs (Monthly)

| Item | Cost (₹/month) |
|------|----------------|
| Vercel hosting (Pro) | 1,600 |
| Domain (annual ÷ 12) | 100 |
| Cloudinary (free tier) | 0 |
| SQLite database | 0 |
| SSL (included) | 0 |
| **Total** | **₹1,700/month** |

#### Your Monthly Maintenance Covers

| Task | Time (hrs/mo) | Market Rate |
|------|--------------|-------------|
| Bug fixes | 2-4 hrs | ₹4,000 – ₹8,000 |
| Product/price updates | 2-3 hrs | ₹3,000 – ₹6,000 |
| Feature requests (small) | 3-5 hrs | ₹6,000 – ₹10,000 |
| Monitoring + support | 1-2 hrs | ₹2,000 – ₹4,000 |
| **Total** | **8-14 hrs/mo** | **₹15,000 – ₹28,000/mo** |
| **You're charging** | | **₹6,000/mo** |

---

### Revenue Projection for You

| Timeline | One-Time | Monthly | Total |
|----------|----------|---------|-------|
| Year 1 | ₹25,000 | ₹6,000 × 12 = ₹72,000 | **₹97,000** |
| Year 2 | ₹0 | ₹6,000 × 12 = ₹72,000 | **₹72,000** |
| Year 3 | ₹0 | ₹6,000 × 12 = ₹72,000 | **₹72,000** |
| **3-Year Total** | | | **₹2,41,000** |

**Plus:** Copper bottle project (Diwali) — additional revenue.

---

### What Happens If You Charge Less

| You Charge | Client Perception | Your Effective Rate | Impact |
|------------|-------------------|---------------------|--------|
| ₹15,000 | "This is cheap, must be simple work" | ₹150-200/hr (below junior) | Undervalues your skill, sets precedent for cheap work |
| ₹25,000 | "Fair price for a good developer" | ₹250-350/hr (still below junior) | Reasonable, client sees value |
| ₹40,000 | "Premium developer, serious work" | ₹400-500/hr (junior rate) | Positions you as quality provider |

---

### Scripts for the Pricing Conversation

**Opening:**
> "Sir, I've completed the full system — website, admin panel, WhatsApp notifications, GST invoicing, customer database, inventory, analytics, everything. Based on the scope and features, the development charge would be ₹25,000."

**If he says "too much":**
> "I understand. Let me break it down — this includes 16 customer pages, 16 admin pages, 30+ APIs, WhatsApp integrations, GST invoicing, analytics dashboard, and 866 products loaded. Market rate for this scope is ₹1-2 lakh. I'm charging ₹25,000 because I value our long-term relationship."

**If he still hesitates:**
> "The monthly maintenance of ₹6,000 covers all updates, bug fixes, and small feature additions. You won't need to hire anyone else — I handle everything."

**Closing:**
> "This system runs your entire business — orders, invoices, customers, inventory, WhatsApp notifications. It pays for itself in the first month through time saved."

---

*Last updated: August 2026*
