<div align="center">

# Shree Gurudev Plastics

Premium plastic products distributor and bulk seller in Bhayander, Maharashtra. Browse 866+ products from Aristo, KG Plast, and Mango Chairs — chairs, tables, buckets, containers, storage, kitchenware, and accessories.

---

[![CI](https://github.com/DanielDeshmukh/shree-gurudev-plastics/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielDeshmukh/shree-gurudev-plastics/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/Tests-179%20passing-brightgreen)](https://github.com/DanielDeshmukh/shree-gurudev-plastics/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.12-2D3748?logo=prisma)](https://prisma.io)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://sqlite.org)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Storage-FD9A00?logo=cloudinary)](https://cloudinary.com)
[![License](https://img.shields.io/badge/License-Private-red)](#)

</div>

## Client Profile

| Detail | Info |
|--------|------|
| **Business** | Shree Gurudev Plastics |
| **Location** | Naigaon, Bhayander, Maharashtra, India |
| **Warehouse** | 5,000 sq ft |
| **Products** | 866+ across 3 brand catalogs |
| **Brands** | Aristo, KG Plast, Mango Chairs |
| **WhatsApp** | [+91 85520 84251](https://wa.me/918552084251) |
| **Business Model** | Wholesale distributor, bulk seller |

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
| Database | SQLite + Prisma 6.12 |
| Image Storage | Cloudinary |
| Authentication | JWT + bcryptjs |
| Charts | Recharts |
| Excel Export | Exceljs |
| Icons | react-icons |
| PWA | Service Worker + Manifest |

---

## License

Private — Shree Gurudev Plastics
