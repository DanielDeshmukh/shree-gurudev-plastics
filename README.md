<div align="center">

# Shree Gurudev Plastics

Premium plastic products distributor and bulk seller in Bhayander, Maharashtra. Browse 1,361+ products from Aristo, KG Plast, and Mango Chairs — chairs, tables, buckets, containers, storage, kitchenware, and accessories.

---

[![CI](https://github.com/DanielDeshmukh/shree-gurudev-plastics/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielDeshmukh/shree-gurudev-plastics/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/Tests-174%20passing-brightgreen)](https://github.com/DanielDeshmukh/shree-gurudev-plastics/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.12-2D3748?logo=prisma)](https://prisma.io)
[![Turso](https://img.shields.io/badge/Turso-Database-4FF8D2?logo=sqlite)](https://turso.tech)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Storage-FD9A00?logo=cloudinary)](https://cloudinary.com)
[![License](https://img.shields.io/badge/License-Private-red)](#)

</div>

## Client Profile

| Detail | Info |
|--------|------|
| **Business** | Shree Gurudev Plastics |
| **Location** | Naigaon, Bhayander, Maharashtra, India |
| **Warehouse** | 5,000 sq ft |
| **Products** | 1,361+ color variants across 3 brand catalogs |
| **Brands** | Aristo, KG Plast, Mango Chairs |
| **WhatsApp** | [+91 85520 84251](https://wa.me/918552084251) |
| **Business Model** | Wholesale distributor, bulk seller, monthly subscription |
| **Built in** | 16 days |

---

## Architecture

```
Customer (Browser/Phone)
    |
    v
Next.js App (Vercel)
    |-- Public: Product catalog, cart, order tracking, quote form
    |-- Admin: Products, orders, invoices, analytics, reports
    |-- API: REST endpoints with JWT auth
    |
    v
Turso Database (libSQL)          Cloudinary (Images)
    |-- 22 models                     |-- Product photos
    |-- 1,361+ products               |-- Brand logos
    |-- 63 verified pincodes          |-- Optimized delivery
    |
    v
WhatsApp Business API (via wa.me)
    |-- Order enquiries
    |-- Follow-up messages
    |-- Festival broadcasts
```

### Key Technical Decisions

- **Product-per-color architecture**: Each color variant is a separate DB row with its own ID, slug, stock, and image. Public API groups by name; admin API shows all variants.
- **Stock race conditions solved**: Atomic `$transaction` for deduction, status history checks before restoration, no double-decrement on delivery.
- **Invoice-status sync**: Invoice status auto-updates when order payment changes (draft -> paid).
- **Thermal receipts**: 58mm iframe-based print with `@page { size: 58mm auto }` instead of stretched A4 PDFs.
- **63 verified pincodes**: Verified against India Post API across Bhayander, Naigaon, Vasai, Virar, Mumbai, Thane, Palghar.

---

## Features

### Customer-Facing

| Feature | Description |
|---------|-------------|
| **SEO Suite** | Meta tags, Open Graph, Twitter cards, JSON-LD structured data, dynamic sitemaps, robots.txt across every page |
| **Aggressive SEO** | 80+ targeted keywords covering product, location, and business terms. LocalBusiness schema with geo-coordinates, FAQ schema, Breadcrumb schema |
| **Server-Side Pagination** | Products loaded 24 per page with Previous/Next, page numbers, ellipsis, and scroll-to-top |
| **WhatsApp Cart** | Add multiple products, adjust quantities, send single formatted WhatsApp message with full order details |
| **Product Comparison** | Compare up to 4 products side-by-side — image, name, brand, price, color, size, stock status |
| **Minimum Order Quantity** | Admin-set MOQ per product, enforced in cart, badges on product cards |
| **Request a Quote** | Dedicated form at `/quote` — name, phone, email, company, category, quantity, delivery details. Sends formatted WhatsApp message |
| **Dealer Locator** | Interactive map with store locations, search by area, distance calculator |
| **Product Tags** | Filterable tag system for quick product discovery |
| **Recently Viewed** | Tracks and displays recently browsed products |
| **Wishlist** | Save products for later, persistent across sessions |
| **Multi-language** | English/Hindi toggle for broader audience reach |
| **Product Reviews** | Star ratings and text reviews on product pages |
| **Delivery Pincode Check** | Check delivery availability by pincode before ordering |
| **Image Lazy Loading** | Blur placeholder + lazy loading for faster page loads |
| **PWA Support** | Installable as app, offline fallback, service worker caching |
| **Error Pages** | Polished 404, 500, and global error boundaries for public and admin |

### Admin Panel

| Feature | Description |
|---------|-------------|
| **Dashboard** | Revenue stats, order counts, customer metrics, low stock alerts |
| **Product Management** | CRUD products with images, categories, pricing tiers, MOQ, stock levels |
| **Brand Management** | Manage brand catalogs (Aristo, KG Plast, Mango Chairs) |
| **Order Management** | View, update, and track all customer orders |
| **GST Invoice** | Auto-generated invoices with CGST/SGST/IGST, HSN codes, format `SGP/YYMM/NNNN` |
| **Tiered Pricing** | 4 tiers (Retailer/Dealer/Distributor/Bulk) with auto-calculation based on customer history |
| **Price Lock** | Lock product prices for 24h–7d, full price change audit trail |
| **Recurring Orders** | Subscription orders (daily/weekly/biweekly/monthly) with pause/resume/cancel |
| **Supplier Management** | Supplier database with contact details, GST numbers |
| **Purchase Orders** | Create POs, track status (pending → ordered → received), auto-calculate totals |
| **Delivery Scheduling** | Time slot management, delivery assignment, dispatch tracking |
| **Credit/Ledger** | Customer credit accounts, running balance, payment tracking |
| **Product Bundles** | Create combo deals with auto-calculated discounts |
| **Customer Database** | Auto-created on order, tracks total orders, spending, customer tier |
| **Analytics Dashboard** | Sales timeline, category breakdown, top products, top customers (Recharts) |
| **Inventory Alerts** | Low stock notifications with configurable thresholds |
| **WhatsApp Follow-up** | Order confirmation, delivery follow-up, review request, restock alert templates |
| **WhatsApp Arrival Notification** | Notify customers when warehouse stock arrives at store — pre-filled pickup message |
| **Festival Broadcast** | Send Diwali, Raksha Bandhan, Holi, New Year, Navratri, Christmas, Pongal, Eid greetings to all customers via WhatsApp |
| **Excel Reports** | Daily and monthly sales reports in `.xlsx` format with branded formatting |
| **Single Admin Lockdown** | Only one admin account permitted, enforced at ORM, login, and middleware levels |

### Security & Infrastructure

| Feature | Description |
|---------|-------------|
| **Server-Side Auth** | JWT + bcrypt, httpOnly cookies, 7-day expiry |
| **Middleware Protection** | All `/admin/*` routes validated server-side before page load |
| **Env-Based Credentials** | Secrets in `.env`, not hardcoded. Required vars: `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` |
| **Error Handling** | Global error boundary, 404/500 pages, standardized API error responses |
| **CI/CD** | GitHub Actions — lint, typecheck, build on every push/PR to main |
| **CSS Variables** | Theme color via `@theme` in `globals.css` — change entire theme in one place |
| **React Icons** | All UI icons from `react-icons/md` — no emoji characters in UI |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | Turso (libSQL) + Prisma 6.12 |
| Image Storage | Cloudinary |
| Authentication | JWT + bcryptjs |
| Charts | Recharts |
| Excel Export | Exceljs |
| PDF | jsPDF |
| Icons | react-icons (Material Design) |
| PWA | Service Worker + Manifest |
| Hosting | Vercel |
| CI/CD | GitHub Actions |

---

## Order Lifecycle

```
Customer places order
  -> Stock deducted atomically in transaction
  -> Tracking token generated (32-char hex)
  -> Notification created for admin

Admin: pending -> confirmed -> shipped -> arrived -> delivered
  -> Intermediate statuses auto-filled in history
  -> Customer sees real-time updates on tracking page (auto-refreshes every 10s)

Admin: mark paid
  -> Invoice status auto-syncs to "paid"
  -> Payment status updated across system
```

### Race Conditions Solved

| Problem | Solution |
|---------|----------|
| Double stock restore on cancel | Check `existingStatuses.has("Cancelled")` before restoring |
| Stock double-decrement on delivery | Removed stock change from delivery — only deducted on creation |
| Delete after cancel restores again | `DELETE` checks `order.status !== "Cancelled"` |
| Cart exceeds available stock | `CartItem.stock` field, `+` button disabled at limit, "Only X left" warning |
| Two orders oversell same stock | Atomic `$transaction` — validation + deduction in one DB operation |

---

## GST Invoice System

- **Invoice number**: `SGP/YYMM/NNNN` (e.g., `SGP/2608/0001`)
- **Intra-state** (Maharashtra): CGST + SGST (split equally)
- **Inter-state**: IGST (full amount)
- **HSN codes**: Auto-mapped by category (chairs: 9401, tables: 9403, buckets: 3924, bottles: 3923, bags: 3926, pipes: 3917)
- **Thermal receipt**: 58mm paper style with SGP header/footer, Courier New monospace
- **Status sync**: Invoice status follows order payment status (draft/paid/cancelled)

---

## Delivery System

### 63 Verified Pincodes

| Area | Pincodes | Delivery Time |
|------|----------|---------------|
| Bhayander | 401101, 401102 | Same-day |
| Naigaon | 401208 | 1-2 days |
| Vasai/Nallasopara | 401201, 401202, 401203, 401207, 401209, 401303 | 2-3 days |
| Virar | 401301, 401302, 401304, 401305, 401306 | 2-3 days |
| Mira Road | 401104, 401107 | 2-3 days |
| Thane | 400601-400615 (11 pincodes) | 2-3 days |
| Mumbai | 32 pincodes across suburbs | 2-3 days |
| Palghar | 401401, 401402 | 2-3 days |

All pincodes verified against India Post API.

---

## Security

| Layer | Implementation |
|-------|---------------|
| Auth | JWT + bcryptjs, httpOnly cookies, 7-day expiry |
| Middleware | All `/admin/*` routes validated server-side before page load |
| Headers | X-Frame-Options DENY, HSTS, CSP, nosniff, XSS protection |
| CORS | Whitelisted origins only |
| Admin Lock | Single admin account enforced at ORM, login, and middleware |
| Security Logger | Tracks unauthorized access, path traversal, rate limiting |
| Registration | All signup endpoints return 404 (blocked) |

---

## SEO

- 80+ targeted keywords (product, location, business terms)
- JSON-LD structured data: LocalBusiness with geo-coordinates, FAQ, Breadcrumb
- Dynamic sitemap from DB (products, brands, static pages)
- Meta tags, Open Graph, Twitter cards on every page
- robots.txt with sitemap reference

---

## Testing

- **174 automated tests** across 17 test suites
- Unit tests: GST calculations, pincodes, pricing, validation, auth, rate limiting
- Integration tests: API routes, middleware
- Component tests: Cart context, comparison context
- CI: GitHub Actions runs lint, typecheck, build, and test on every push/PR

---

## Admin Panel Features

| Feature | Description |
|---------|-------------|
| Dashboard | Revenue stats, order counts, customer metrics, low stock alerts |
| Products | CRUD with images, categories, 4-tier pricing, MOQ, stock levels |
| Orders | Status management, payment tracking, stock restoration on cancel |
| Invoices | GST invoices with CGST/SGST/IGST, thermal receipt modal |
| Analytics | Sales timeline, category breakdown, top products/customers (Recharts) |
| Reports | Daily/monthly Excel exports with branded formatting |
| Delivery | Time slot management, driver assignment, dispatch tracking |
| Recurring | Subscription orders (daily/weekly/biweekly/monthly) |
| Suppliers | Supplier database, purchase order tracking |
| Bundles | Combo deals with auto-calculated discounts |
| Customers | Auto-created on order, tier tracking, credit ledger |
| WhatsApp | Follow-up templates, arrival notifications, festival broadcasts |
| Notifications | Auto-read after 5 seconds, real-time alerts |

---

## License

Private — Shree Gurudev Plastics
