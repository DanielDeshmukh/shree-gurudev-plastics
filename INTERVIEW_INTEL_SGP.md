# INTERVIEW INTEL — Shree Gurudev Plastics (B2B plastic-products distributor site)

**What this file is:** everything I verified in this repo (code + git history + live commands), organised into spoken answers for a 5-question AI Engineer screen, plus the sections you asked for.

**Ground rules I followed while writing this**

- Every claim carries a `path:line-LINE` citation (or a `git show`/`git log` reference, or a command output in `## Verification log`).
- Nothing was guessed. Where I could not find something I wrote **NOT FOUND IN CODE**.
- No file in the repo was changed except this one. `.env`, `.env.local`, `PROJECT_BLACKBOOK.md` and `scripts/*` were **never opened**; where their contents matter I only state *names* and mark values `<REDACTED>`.
- The main answers are written the way you should *say* them (150–300 words each). Read them aloud once; do not recite.

---

## 0. Reality check: what this stack actually is

React was right (React 19); FastAPI and Postgres were both wrong. The verified stack:

| Layer | Reality | Citation |
|---|---|---|
| Framework | **Next.js 15.5.13, App Router, React 19, TypeScript 5** | `package.json:28`, `package.json:32`, `package.json:59` |
| API | **Next.js Route Handlers** (no FastAPI — no Python in the app; the only Python is a deleted catalog-extractor) | `src/app/api/**/route.ts` (64 route files) |
| DB | **Prisma 6.12 on SQLite → Turso (libSQL) in prod** via driver adapter | `prisma/schema.prisma:6-9`, `src/lib/db.ts:10-12`, `package.json:56`, `package.json:19-20` |
| Auth | **Two systems**: custom JWT (`admin_token` httpOnly cookie) for the single admin, **NextAuth + Google** for customers | `src/lib/auth.ts:44-47`, `src/app/api/auth/login/route.ts:56-62`, `src/lib/auth-config.ts:12` |
| Styling | **Tailwind CSS 4** with `@theme` CSS variables | `src/app/globals.css:1-3`, `package.json:57` |
| Money/GST | Hand-rolled `gst.ts` + `pricing.ts`, `exceljs` reports, `jspdf`/`pdfkit` invoices | `package.json:24`, `package.json:27`, `package.json:30` |
| Payments | **Razorpay** (order create / verify / webhook / refund / subscription) | `package.json:31`, `src/app/api/razorpay/*` |
| Tests | **Vitest 4** — `npm test` | `package.json:14`, `package.json:60` |
| CI/CD | GitHub Actions (`ci.yml`) + Vercel; a `deploy-gate.yml` blocks deploys | `.github/workflows/ci.yml:23-29`, `.github/workflows/deploy-gate.yml:11-16` |
| Repo shape | **476 commits**, 2026-08-14 (`08b3769 Initial commit`) → 2026-09-07 (`5e1c22b`) | `git rev-list --count HEAD` |

---

## The five questions

### Q1 — "Walk me through what this system does, end to end."

**Answer (spoken):**

"Honestly the flow starts with a customer landing on the home page — that's a server component, so brands and FAQ schema are fetched on the server, and then the catalog itself is client-rendered: the products page reads brand, category and sub-category straight out of the URL with `useSearchParams` and calls `/api/brands` and `/api/products`. The product detail page is a server component that queries Prisma directly — the product, a fallback lookup, siblings, plus brand and same-category rows for the 'you may also like' rails. Adding to cart lives in a React context backed by `localStorage`; pricing is recalculated *in the browser* from quantity tiers and any festival discount.

Checkout is one page: address, delivery method, payment method — COD, online, bank transfer or other. It POSTs to `/api/orders`, and the order API **refuses anonymous orders**, so the customer must have signed in with Google first. Inside a single Prisma transaction the server re-reads the product prices, checks and decrements stock, upserts the customer, writes the order with `status: "Order Placed"`, writes the first status-history row, creates an admin notification, and returns a `trackingToken`. The success screen links to `/track/<token>`, which polls every ten seconds. On the admin side there is exactly one admin, a JWT cookie, and a 22-item nav; confirming or cancelling an order returns a pre-filled `wa.me` link, because **WhatsApp is the real notification channel** for this business." (231 words)

**Follow-ups**

- **Q: Why does checkout require Google sign-in if it's a wholesale shop?**
  A: The API hard-blocks it — `src/app/api/orders/route.ts:39` returns `401 "Please sign in to place an order"` before validation runs. Sign-in itself is NextAuth Google, `src/lib/auth-config.ts:12`.
- **Q: Who computes the total the customer sees?**
  A: The client. `totalPrice` is a `useMemo` over cart items (`src/context/CartContext.tsx:179`) and tier/festival pricing is applied client-side (`src/context/CartContext.tsx:80-93`, `src/context/CartContext.tsx:106-116`). The server re-derives `item.price || dbProduct.price` (`src/app/api/orders/route.ts:87`) — see Q4, that's a real weakness.
- **Q: How does the customer know the order landed?**
  A: Two ways: the tracking page (`src/app/track/[token]/page.tsx:68-87`, polls every 10 s) and a WhatsApp deep link generated server-side, e.g. `src/app/api/orders/[id]/action/route.ts:62-64`.
- **Q: What does the admin actually see?**
  A: 22 nav entries from Dashboard through Payments — `src/app/admin/layout.tsx:33-54`. Note Analytics, Recurring Orders, Subscriptions and the print page were deliberately removed (`c623723`, `74fc580`, `d5cb1e6`, `4b05284`), so do not describe `/admin/analytics` as existing.

---

### Q2 — "Explain the architecture of what you built."

**Answer (spoken):**

"It's a single Next.js application that plays four roles at once: marketing storefront, customer account, admin back-office, and API. Everything runs in one deployable on Vercel, with route handlers under `src/app/api`, server components for the SEO-critical pages — home, product detail, brand — and client components for anything stateful: cart, wishlist, compare, recently-viewed, the tracking page.

Requests hit `middleware.ts` first. It enforces maintenance mode, blocks the three registration endpoints with a 404, and does the admin JWT check for `/api/admin/*` — with a second, independent `getAuthUser()` check inside each admin handler, so a middleware regression doesn't open the API. Underneath, Prisma sits on SQLite locally and Turso's libSQL over HTTP in production, chosen because the client needs a zero-ops managed database with a free tier. Auth is split: custom JWT with bcrypt-plus-pepper for the one admin, NextAuth Google for customers.

The side systems are Cloudinary for product images, Razorpay for payments including a webhook, Excel/PDF generators for invoices and reports, and WhatsApp deep links rather than email or push. State that isn't in the database — rate limiting, security logs, festival cache, maintenance cache — lives in process memory, which is the main thing that changes when you scale out." (200 words)

**Architecture (Mermaid)**

```mermaid
flowchart TD
  U["Customer / Admin browser"] --> MW["middleware.ts<br/>maintenance · block /api/auth/register* · admin JWT check<br/>middleware.ts:83-151"]
  MW --> P["Next.js 15 App Router (Vercel)<br/>server components: page.tsx, product/[id]/page.tsx<br/>client components: CartContext, checkout, track"]
  P --> API["Route Handlers src/app/api/**/route.ts<br/>double auth: middleware + getAuthUser()"]
  MW -->|"admin cookie verify"| API
  API --> PR["Prisma 6 + @prisma/adapter-libsql<br/>src/lib/db.ts:10-16 · single-admin $extends src/lib/db.ts:22-41"]
  PR --> DB[("Turso libSQL (prod) / SQLite (dev)<br/>prisma/schema.prisma:6-9")]
  API -->|"images"| CLOUD["Cloudinary upload_stream<br/>src/app/api/upload/route.ts:41"]
  P -->|"create/verify order"| RZ["Razorpay<br/>order · verify · webhook · refund"]
  P -->|"wa.me deep links<br/>src/app/api/orders/[id]/action/route.ts:62"| WA["WhatsApp"]
  A["NextAuth Google (customers)"] --> P
  CI["GitHub Actions ci.yml: lint → prisma generate → next build → npm test<br/>+ deploy-gate.yml blocks deploy unless maintenance ON"] --> V["Vercel deploy"]
```

**Follow-ups**

- **Q: Why check auth in middleware *and* in every admin handler?**
  A: Defence in depth. Middleware gates `/api/admin/*` (`middleware.ts:114-121`); handlers re-check with `getAuthUser()`, e.g. `src/app/api/orders/[id]/route.ts:73-76`. If someone adds a route that the matcher skips, the handler still protects itself.
- **Q: Why did you choose SQLite/Turso over Postgres?**
  A: It's what's in the code — `prisma/schema.prisma:7` is `provider = "sqlite"`, and `src/lib/db.ts:10-12` swaps in the libSQL adapter only when `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` are set, so dev falls back to a local file (`package.json:11` is `db:push`, not `migrate`).
- **Q: Where does the domain logic live?**
  A: In `src/lib` — `gst.ts` (GST + invoice numbers + HSN), `pricing.ts` (tiers + MRP ceiling), `validation.ts` (zod), `db.ts` (aggregation helpers). The route handlers are thin orchestration. That's why the pure functions are the only thing with unit tests.
- **Q: How do you know it builds?**
  A: CI runs `npm run lint`, `npx prisma generate`, `npx next build`, `npm test` (`.github/workflows/ci.yml:23-29`), and `deploy-gate.yml` refuses a production deploy while maintenance mode is off (`.github/workflows/deploy-gate.yml:11-16`). Locally I re-ran all four — see `## Verification log`.

---

### Q3 — "Tell me about a real bug the client hit, and how you diagnosed it."

**Answer (spoken):**

"The one I'd tell is stale customer statistics. The Customers page and the dashboard 'top customers' card were reading `Customer.totalOrders`, `Customer.totalSpent` and `Customer.lastOrderAt` — denormalised columns that were written once when the customer row was created and then never touched again. So after the client used the system for a few weeks, one customer showed **34 orders** on the board when they had actually placed **1**. Sales, not code, exposed it.

I diagnosed it by comparing two sources: the column value versus a count of `Order` rows grouped by phone. They disagreed wildly, and the pattern pointed at write paths that create orders, cancel them, edit totals or delete them without recomputing those columns. The fix had two parts: a single `recomputeCustomerStats()` helper that re-derives all three fields from the orders table, called from the paths that were breaking them — order update, order delete, admin cancel — and, on the analytics/dashboard side, computing top customers by walking the actual orders array instead of trusting the columns, with a code comment saying so. Order creation still increments the columns by hand inside the transaction; I'd unify that too.

What I'd say next, honestly: the same class of bug was hiding in revenue. The recompute helper still counts cancelled orders, and the reports revenue sums every order regardless of status — so I'd flag that rather than pretend the cleanup was complete." (231 words)

**Evidence (git + code)**

- Commit `c8a40a8` (2026-09-03) — *"fix: compute top customers from actual orders, not stale DB columns"*; its body is the proof: *"Fixed Manoj Steel House showing 34 orders (actual: 1)"* and *"stale seed values"*
- Commit `04234a2` (2026-09-03) — *"fix: eliminate stale customer data across entire project"*, body: *"Root cause: Customer.totalOrders/totalSpent/lastOrderAt were only incremented on order creation but never updated on delete/cancel/edit"*
- The fix is visible in code: `src/app/api/admin/analytics/route.ts:48` comment *"// Compute top customers from actual orders, not stale Customer columns"*, aggregation at `src/app/api/admin/analytics/route.ts:50-61`
- The helper: `src/lib/db.ts:77-92`
- Call sites (the mutation paths that were fixed): `src/app/api/orders/[id]/route.ts:116` (PUT), `src/app/api/orders/[id]/route.ts:210` (DELETE), `src/app/api/orders/[id]/action/route.ts:94` (admin cancel). **Order creation does *not* call it** — it still increments by hand inside the transaction (`src/app/api/orders/route.ts:112-120`, `:139-147`), which is why two sources of truth still exist.

**Follow-ups**

- **Q: Why did it take so long to surface?**
  A: Nothing recomputed the columns, and nothing compared them to the orders table — there's no reconciliation job (**NOT FOUND IN CODE**). It only became visible when the client compared a name they knew with a number they knew.
- **Q: What's still wrong with the fix?**
  A: `recomputeCustomerStats` filters only by `customerId` — no `status` filter — so cancelled orders still count toward `totalOrders`/`totalSpent` (`src/lib/db.ts:78-83`). Same in reports: `where: { createdAt: { gte: from, lte: to } }` with no status exclusion, so revenue includes cancellations (`src/app/api/admin/reports/route.ts:86-87`, summed at `:98`).
- **Q: What else did the same commit series reveal?**
  A: Three more, all in history: `1d8d9e1` → `44c1976`/`16a05c3`/`afdf6b2` (stock was decremented on *delivery* first, then reworked to reserve atomically on *creation*), `8c00e69` (*"retailer was +15% above MRP, now -5% below"* — a data bug plus an MRP ceiling guard in `getTierPrice`), and `f0e8cfd` (*"don't show MOST BOUGHT when all products have 0 sales"* — the placeholder catalog had zero orders).
- **Q: How would you stop it recurring?**
  A: Stop storing the aggregate at all — derive it, or make recompute part of one domain function that every order mutation calls inside the same transaction. Right now the calls are outside any transaction and wrapped in `.catch(() => {})`, so a failure is silent (`src/app/api/orders/[id]/route.ts:116`).

---

### Q4 — "How did you handle money — pricing, GST, invoices, payments?"

**Answer (spoken):**

"Money has three representations and that's the honest headline. Prices, order totals, invoice subtotals and ledger balances are Prisma `Float`; Razorpay amounts are `Int` in paise; GST is computed in `gst.ts` and rounded to two decimals at invoice level — `Math.round(x * 100) / 100` — while line items inside an order stay unrounded. Tier pricing is a pure function: quantity bucket to tier, tier to a discount off price, with an MRP ceiling so a discount can never exceed the base price — that ceiling was added by commit `8c00e69` after the DB had retailer prices *15% above* MRP.

Invoices are server-side: `calculateInvoiceGST` splits CGST/SGST for intra-state and IGST for inter-state based on place of supply, and the HSN code is mapped from category. Payments use Razorpay's signature verification on `/api/razorpay/verify` — but the amount that gets charged comes from the browser, and the verify route checks the signature without re-checking the amount against the order. There's a `priceManipulationAttempt` logger that is defined and never called anywhere in `src/`. I'd say all of that out loud, because the interviewer will ask what you'd change: use `Decimal` instead of `Float`, take the amount from the server-side order row, and actually call the logger." (203 words)

**Money facts and where they live**

| Concern | Verified behaviour | Citation |
|---|---|---|
| Money type | `price`, tier prices, `Order.total`, invoice fields, ledger `amount`/`balance` are `Float` | `prisma/schema.prisma:28-32`, `:116`, `:225-229`, `:381-382` |
| Payment amount | `Int` (paise) | `prisma/schema.prisma:158` |
| GST rounding | Two decimals at invoice level, line items unrounded | `src/lib/gst.ts:58-62` |
| GST split | CGST+SGST intra-state, IGST inter-state, per place of supply | `src/app/api/admin/invoices/route.ts:45` |
| Invoice number | `generateInvoiceNumber(invoiceCount + 1)` — count-based, racy | `src/app/api/admin/invoices/route.ts:53-54`, `src/lib/gst.ts:66` |
| Tier guard | `raw < base ? raw : Math.round(base * 0.75)` (and 0.90) | `src/lib/pricing.ts:56-60` |
| Client-supplied price | `price: z.number().positive().optional()` → `item.price || dbProduct.price` | `src/lib/validation.ts:13`, `src/app/api/orders/route.ts:87` |
| Client-supplied charge | `amount: Math.round(amount * 100)` taken from the request body | `src/app/api/razorpay/order/route.ts:8`, `:20`, `:30` |
| Verify route | Checks signature; does **not** compare amount to `Order.total` | `src/app/api/razorpay/verify/route.ts:14`, `:35` |
| Manipulation logger | Defined, **never called in `src/`** (only its own definition at `:45`) | `src/lib/security-logger.ts:45` |
| Dashboard revenue | `_sum.total` over **all** orders, no status filter | `src/app/api/dashboard/route.ts:29`, `:45` |
| Ledger balance | Read-modify-write running balance, no transaction | `src/app/api/admin/ledger/route.ts:39-58` |

**Verbatim — `src/lib/pricing.ts:37-61` (25 lines), the MRP ceiling guard added by `8c00e69`:**

```ts
export function getTierPrice(
  product: {
    price: number;
    retailerPrice: number;
    dealerPrice: number;
    distributorPrice: number;
    bulkPrice: number;
  },
  tier: CustomerTier
): number {
  const base = product.price;
  if (base <= 0) return 0;

  if (tier === "individual") {
    return Math.round(base * 0.95);
  }

  if (tier === "bulk") {
    const raw = product.bulkPrice;
    return raw > 0 && raw < base ? raw : Math.round(base * 0.75);
  }

  const raw = product.retailerPrice;
  return raw > 0 && raw < base ? raw : Math.round(base * 0.90);
}
```

**Follow-ups**

- **Q: How do you avoid floating-point drift?**
  A: You don't fully — you confine it. GST totals are rounded to 2 dp at the invoice boundary (`src/lib/gst.ts:58-62`) and reports format with `toLocaleString("en-IN")`, but the stored `Float` values are not rounded on write. That's the honest answer: the correct fix is `Decimal`.
- **Q: What happens if two invoices are created at the same moment?**
  A: Both can read the same `invoice.count()` and mint the same number — `generateInvoiceNumber(invoiceCount + 1)` (`src/app/api/admin/invoices/route.ts:53-54`) has no unique constraint behind it. **NOT FOUND IN CODE:** any unique index on `Invoice.number` or a retry/sequence mechanism.
- **Q: Can a customer manipulate what they pay?**
  A: The *displayed* tier and festival discount are computed client-side and posted with the order (`src/lib/validation.ts:13`, `src/app/api/orders/route.ts:87`), and `/api/razorpay/order` charges whatever `amount` the browser sends (`src/app/api/razorpay/order/route.ts:8-30`). The verify route validates the HMAC but not the amount (`src/app/api/razorpay/verify/route.ts:14-35`). So: signature-verified, amount-unverified.
- **Q: Is GST correct for this business?**
  A: The maths is unit-tested — 13 tests in `__tests__/lib/gst.test.ts` covering 18%/12%, CGST+SGST vs IGST, zero quantity, HSN mapping (chairs → `9401`). What's *not* tested is which rate applies to which product beyond the default `gstRate Float @default(18.0)` (`prisma/schema.prisma:45`).

---

### Q5 — "Suppose 100 clients hit it at once. What happens?"

**Answer (spoken):**

"Read traffic would mostly hold; the parts that break first are the parts I kept in process memory. Vercel gives each serverless instance its own heap, so the rate-limit `Map`, the security-log array capped at 1000 entries, the 60-second festival cache and the 10-second maintenance cache are *per instance* — a login burst spread across instances gets five attempts per instance, not five per client, and security events written on one instance can never be read on another because `getRecent()` has no API route.

Second, throughput: the product detail page issues about six to seven queries per view, the dashboard fires a `Promise.all` of eight-plus queries, and `apiFetch` sets `cache: "no-store"` on everything, so nothing is cached at the page level. Under load the dangerous part isn't slowness, it's that those parallel queries are wrapped in `.catch(() => ({ _sum: { total: 0 } }))` — a DB hiccup renders a dashboard showing **zero revenue** instead of an error.

What I'd do, in order: move rate limiting and the security log to a shared store, cache product pages with revalidate, add pagination to the lists, strip the `.catch(() => zeros)` so failures are loud, and load-test a preview deploy with k6 against `/api/health`. The schema side is already decent — indexed on `customerId`, `status`, `trackingToken`, `createdAt`." (216 words)

**Scale facts**

| Concern | Reality | Citation |
|---|---|---|
| Rate limit store | `new Map<string, RateLimitEntry>()` in module scope | `src/lib/rate-limit.ts:6` |
| Where rate limiting is applied | **Only 2 routes**: login (5/min per IP) and track lookup | `src/app/api/auth/login/route.ts:19`, `src/app/api/orders/track/[token]/route.ts:26` |
| Security log | In-memory array, `MAX_LOGS = 1000`, `pop()` when full; `getRecent()` never exposed | `src/lib/security-logger.ts:12`, `:23`, `:61` |
| Festival cache | Module-level, 60 s TTL | `src/lib/festival-cache.ts:1-2` |
| Maintenance cache | Module-level, 10 s TTL, plus a DB query per miss | `middleware.ts:23-24`, `middleware.ts:40-54` |
| No page cache | `fetch(url, { cache: "no-store" })` for all `apiFetch` calls | `src/lib/api-fetch.ts:13` |
| Product page queries | `findUnique` + fallback + siblings + `generateMetadata` + brand + sameBrand + sameCategory | `src/app/product/[id]/page.tsx:22-91` |
| Silent failures under load | `.catch(() => ({ _sum: { total: 0 } }))` and `.catch(() => [])` ×8 | `src/app/api/dashboard/route.ts:29`, `:61-67` |
| Indexes | Product: brand/category/subCategory/createdAt; Order: customerId/status/trackingToken/createdAt | `prisma/schema.prisma:60-63`, `:134-137` |
| Health check | `/api/health` returns 200/503 with DB round-trip | `src/app/api/health/route.ts` |
| Middleware matcher | Every path except `_next/static`, `_next/image`, favicon | `middleware.ts:153-155` |

**Follow-ups**

- **Q: What's the actual bottleneck?**
  A: Queries per view × uncached pages, not CPU. Product detail alone is up to seven Prisma round-trips per request (`src/app/product/[id]/page.tsx:22-91`) with `cache: "no-store"` everywhere (`src/lib/api-fetch.ts:13`).
- **Q: What breaks first?**
  A: Correctness, not availability: per-instance rate limits and logs diverge, and dashboard failures render as `0` revenue (`src/app/api/dashboard/route.ts:29`).
- **Q: How would you verify?**
  A: Hit `/api/health` for DB sanity, run k6/a autocannon against a preview deployment, and watch that the dashboard returns an error status rather than zeros when the DB is down — the tests today don't cover any of this (**API-route integration tests: NOT FOUND IN CODE**).
- **Q: Is Turso a bottleneck?**
  A: Not at this shape — it's HTTP libSQL with per-instance clients (`src/lib/db.ts:10-12`), and the hot tables are indexed. The first spend should be caching, then a shared store for the four in-memory caches.

---

## Swapping in the client's real data

**Where the current data came from (do not pretend it is real):**

- The very first commit seeded **random** values: `price: Math.floor(Math.random() * 1800) + 200` and `stock: Math.floor(Math.random() * 100) + 10`, after `prisma.product.deleteMany()` — `git show 8d55cb9:scripts/seed-placeholder.ts` lines 57-58, 84-85 (file removed from the tree in `82bd6d7`).
- Prices were then overwritten by `scripts/assign-prices.mjs` — random per product (`Math.round((Math.random() * (max - min) + min) / 10) * 10`, `scripts/assign-prices.mjs:9`, range "Rs.300 … Rs.9000" at `:64`) — and tiers by `scripts/fix-tier-prices.mjs:21-27`, which sets `retailerPrice = CAST(price * 0.95 …)`, `0.90`, `0.85`, `0.80`. Both live in `scripts/`, which is gitignored (`.gitignore:42`), so read them from the working tree, not from git.
- **The bug had a named source.** `scripts/assign-prices.mjs:80` wrote `retailerPrice = Math.round(u.price * 1.15)` — i.e. the "retailer" tier was **15 % above MRP**. Commit `8c00e69` (*"fix: correct tier prices in DB (retailer was +15% above MRP, now -5% below) and add MRP ceiling guard in getTierPrice"*) is the fix, and the guard is `src/lib/pricing.ts:56-60`. Say this chain out loud — it shows you trace a bad number to the script that wrote it.
- Audit tooling already exists for verification: `scripts/audit-counts.mjs`, `scripts/check-turso-data.mjs`, `scripts/turso-raw.json`, `scripts/check-zero-prices.ps1` (all present in the working tree).

**The safest import path (ordered, with the code that already supports it):**

1. **Never write prices directly.** Create brands first (`/api/brands`), then products with `isActive: false` and `price: 0` so nothing is sellable while incomplete — `POST` requires admin (`src/app/api/products/route.ts:168-177`).
2. **Load the catalog through the admin API, not raw SQL.** `PUT /api/products/[id]` writes `priceHistory` rows automatically whenever a price changes (`src/app/api/products/[id]/route.ts:54-69`) and accepts all four tier prices plus dimensions, MOQ, tags and HSN-relevant fields (`:70-83`). That gives you an audit trail for free.
3. **Images go through Cloudinary, admin-only.** `POST /api/upload` is guarded by `getAuthUser()` and uses `cloudinary.uploader.upload_stream` (`src/app/api/upload/route.ts:8-9`, `:41`).
4. **Prices last, tiers derived.** Set `price`, then derive `retailerPrice/dealerPrice/distributorPrice/bulkPrice` in one place and assert the ceiling invariant (`retailerPrice <= price`) — the guard that exists today is in the pricing *function* (`src/lib/pricing.ts:56-60`), not in the write path, so add it to `PUT`.
5. **GST defaults are per product:** `gstRate` defaults to 18.0 and `hsnCode` to `"3924"` (`prisma/schema.prisma:44-45`); correct them per category before the first invoice.
6. **Reconcile, don't assume.** Re-run the audit scripts and a `recomputeCustomerStats()` sweep (`src/lib/db.ts:77-92`) once real orders exist.

**NOT FOUND IN CODE:** any CSV/Excel bulk-import route or admin import page — the only upload route is `src/app/api/upload/route.ts`. So today the path is one-by-one API/admin edits, or a throwaway script in the gitignored `scripts/` folder.

---

## AI tooling: which parts, how verified

> **Read this first:** I cannot claim what *you* used AI for. Fill the bracketed markers yourself before speaking; everything else below is verified in the repo.

**What is verifiably in the repo (safe to describe as "AI-assisted work in this project"):**

1. **An AI catalog-extraction pipeline** — `catalog_extractor/ai_extractor.py` (introduced in `c8beace Add catalog image extractor pipeline`, extended in `b89c62b Add scraper scripts`), **1,228 changed lines** of churn, since removed from the tree. An NVIDIA NIM key is referenced by the toolchain: `NIM_API_KEY="your-nim-api-key"` in `.env.example:35`.
2. **AI colour suggestions in a label-colouring tool** — commit `869f0a0 Add AI color suggestions back to label-colors tool` touched `src/app/api/label-colors/route.ts` (+24) and `src/app/label-colors/page.tsx` (+22); both were later deleted in `18634e0 cleanup - remove dead code, secrets, temp files, empty dirs`. Decision output lived in `scripts/ai-color-decisions.json`.
3. **A secrets incident with AI tooling in the middle:** `91c39bd` *"fix: remove hardcoded NIM API keys from scripts, use env vars"*, then `6994983` *"Revert: restore hardcoded API keys (repo is private)"*, then `82bd6d7` *"chore: remove scripts from git tracking (gitignored, contain secrets)"*. The keys are still in git history — see `## Security findings`.
4. **`[FILL IN: which model/agent you used day to day]`** — **NOT FOUND IN CODE**. There are **zero** `Co-authored-by`, `Generated with`, or agent trailers in `git log`; no `AGENTS.md`/`CLAUDE.md` in the tree.

**How the output was verified (this is the answer they want):**

- **Automated:** `npm test` → **173 passed / 16 files** (re-run this session); `npm run lint` → exit 0; `npx next build` → compiled successfully; CI runs all four (`.github/workflows/ci.yml:23-29`). Note the README badge claims *174 across 17 suites* (`README.md:10`, `README.md:303`) — that is stale by one test.
- **Type-check honesty:** `npx tsc --noEmit` exits 1 with **4 errors**, all in tests: `__tests__/contexts/LanguageContext.test.tsx:55`, `RecentlyViewedContext.test.tsx:79`, `WishlistContext.test.tsx:87` (`Cannot find name 'vi'`) and `__tests__/lib/api-fetch.test.ts:41` (`NODE_ENV` read-only). `next build` still passes because Next's check doesn't treat those as fatal the same way — quote both results rather than picking the flattering one.
- **Where AI-shaped patterns show up in the code** (say this only as *code review*, not as blame):
  - Two status vocabularies coexisting — `STATUS_MAP` holds both `pending` and `"Order Placed"` (`src/app/api/orders/[id]/route.ts:5-20`).
  - **65** `.catch(() =>` chains and **32** empty `catch` blocks in `src/`, vs **0** `@ts-ignore` and **0** `TODO/FIXME` markers.
  - **30** `as any` / **45** `any` annotations (e.g. `src/lib/db.ts:12`).
  - Duplicated rate-limit implementations: the shared `checkRateLimit` (`src/lib/rate-limit.ts:20`) plus an inline one in the track route (`src/app/api/orders/track/[token]/route.ts:26`).
  - A feature written then reverted then rewritten in git: stock decrement on delivery (`1d8d9e1`) → reserve on creation (`16a05c3`, `44c1976`, `afdf6b2`).
- **Verifiable velocity as context:** 476 commits in 25 days; `src/app/products/page.tsx` touched by 45 commits and **2,838 changed lines**, `src/lib/invoice-pdf.ts` 1,680, `src/app/product/[id]/page.tsx` 1,489. Honest framing: that pace is why the bugs in Q3 existed.

---

## Additional likely questions (12)

1. **Why one admin only?** — Enforced in two places: a Prisma `$extends` hook that throws `SECURITY: Only one admin account is permitted.` on `create`/`upsert` (`src/lib/db.ts:22-41`) and an integrity check that refuses login if `admin.count() !== 1` (`src/app/api/auth/login/route.ts:29-35`), plus seed-time guards (`prisma/seed.ts:18`, `:22`).
2. **How is the admin password stored?** — bcrypt (cost 12) over a SHA-256 *peppered* password: `pepperPassword()` then `bcrypt.hash(peppered, 12)` (`src/lib/auth.ts:26-32`). The pepper literal is hardcoded in two files — see `## Security findings`.
3. **What happens on JWT expiry?** — Cookie `maxAge` is 24 h (`src/app/api/auth/login/route.ts:61`) and `expiresIn: "1d"` (`src/lib/auth.ts:45`). The README says **7-day** expiry (`README.md:188`, `README.md:281`) — cite the code, not the README.
4. **How do you stop SQL injection / XSS?** — Prisma parameterises (`db.order.findMany`, and the two raw `client.execute` calls use `args: []` — `middleware.ts:47-48`); output is React-escaped; zod validates bodies (`src/lib/validation.ts`). CSP, HSTS and `X-Frame-Options: DENY` are set globally (`next.config.ts:41-49`).
5. **Is there rate limiting everywhere?** — No: login and the track lookup only (`src/app/api/auth/login/route.ts:19`, `src/app/api/orders/track/[token]/route.ts:26`). **NOT FOUND IN CODE:** rate limits on `/api/orders`, `/api/razorpay/order`, `/api/reviews`, `/api/enquiries`.
6. **How are migrations managed?** — Three migrations exist (`prisma/migrations/20260828120330_add_razorpay_tables`, `20260828144027_add_customer_email`, `20260903115515_add_offers`) but the npm script is `db:push` (`package.json:11`) and CI runs **no** migration step (`.github/workflows/ci.yml:23-29`) — **NOT FOUND IN CODE:** `prisma migrate deploy` anywhere.
7. **How do you handle concurrent stock?** — Read-check-decrement inside `db.$transaction` (`src/app/api/orders/route.ts:63-100`), restore on cancel (`src/app/api/orders/[id]/action/route.ts:81-86`). But restore and status write are **not** in the same transaction, so a mid-loop crash can restore stock without cancelling.
8. **What's the test strategy?** — Pure functions and contexts: 173 tests across `gst` (13), `pricing` (17), `validation` (23), `middleware` (20), `auth` (15), five React contexts (35), plus `rate-limit`, `security-logger`, `seo`, `tags`, `pincodes`, `api-fetch`. **API-route tests: NOT FOUND IN CODE**, despite `README.md:305` claiming *"Integration tests: API routes, middleware"*.
9. **How does the tracking link stay secret?** — 32-hex token, validated by regex `^[a-f0-9]{32}$`, unique-indexed (`src/app/api/orders/track/[token]/cancel/route.ts:10`, `prisma/schema.prisma:122`). Cancel is possible by anyone holding the token and has no rate limit.
10. **Where does SEO come from?** — Server components + `generateMetadata` on product pages (`src/app/product/[id]/page.tsx:55`), FAQ/OG/JSON-LD in `src/app/page.tsx:6-34`, helpers in `src/lib/seo`.
11. **What would you do first in week one of the contract?** — Rotate the leaked keys (`## Security findings`), move price validation server-side, replace `Float` with `Decimal`, and reconcile revenue to exclude cancelled orders (`src/app/api/admin/reports/route.ts:86-98`).
12. **Tell me about a time AI output was wrong.** — `[FILL IN: your example]`. Repo-side candidates you can honestly describe as observed: the retailer-tier pricing that was *above* MRP (`8c00e69`) and the silent `catch` blocks fixed in `a9513eb` *"replace all 27 silent catch blocks with error toasts"* (14 files, 60 insertions) — both classic symptoms of generated code that "works" on the happy path.

---

## Weaknesses and honest framing

Say these plainly; each is verifiable and the interviewer may have already found them.

1. **Client-trusted money.** Order `price` is optional in the schema (`src/lib/validation.ts:13`) and falls back with `item.price || dbProduct.price` (`src/app/api/orders/route.ts:87`); `/api/razorpay/order` charges the browser's `amount` (`src/app/api/razorpay/order/route.ts:8-30`). **Frame:** "I trusted the client for speed; the fix is to price entirely server-side and pass only a price *version*."
2. **`Float` for money.** `prisma/schema.prisma:28-32`, `:116`, `:225-229`. **Frame:** "Correct for display, wrong for audit; `Decimal` is the migration I'd schedule."
3. **Revenue and stats include cancelled orders.** `src/app/api/dashboard/route.ts:29`, `src/app/api/admin/reports/route.ts:86-98`, `src/lib/db.ts:78-83`. **Frame:** "I fixed the stale-column symptom, not the definition of revenue."
4. **Mixed status vocabulary.** Creation writes `"Order Placed"` (`src/app/api/orders/route.ts:178`), the admin dropdown writes lowercase (`src/app/admin/orders/page.tsx:35`, stored raw at `src/app/api/orders/[id]/route.ts:93`), history writes Title Case (`:129`, `:152`). The track page compares `order.status` to Title-Case stage keys (`src/app/track/[token]/page.tsx:18-25`, `:144`), so once an admin changes the status the **progress bar resets to 0 %** (`:170-174`) and the current-step highlight never matches (`:236`). Cancel guards compare lowercase (`src/app/api/orders/track/[token]/cancel/route.ts:23`) while the admin idempotency guard compares Title Case (`src/app/api/orders/[id]/route.ts:156`) — mixing the two can **double-restore stock**. **Frame:** "One enum, written by one function, on every path — that's the fix."
5. **Silent failure as a design habit.** 65 `.catch(() => …)` chains, including `.catch(() => ({ _sum: { total: 0 } }))` (`src/app/api/dashboard/route.ts:29`) and `.catch(() => {})` around `recomputeCustomerStats` (`src/app/api/orders/[id]/route.ts:116`). **Frame:** "Errors became zeros; I'd let them fail loudly."
6. **In-memory state on a serverless runtime.** `src/lib/rate-limit.ts:6`, `src/lib/security-logger.ts:12`, `src/lib/festival-cache.ts:1-2`, `middleware.ts:23-24`.
7. **Security logging has no reader.** `securityLogger.getRecent()` (`src/lib/security-logger.ts:61`) is never called by any route, and `priceManipulationAttempt` is never called at all (`:45`). **Frame:** "I instrumented it but never surfaced it — dead code until there's an endpoint or a sink."
8. **Invoice numbers are count-based.** `src/app/api/admin/invoices/route.ts:53-54` — concurrent creation can collide; no unique constraint (**NOT FOUND IN CODE**).
9. **Ledger running balance is read-modify-write.** `src/app/api/admin/ledger/route.ts:39-58` — two concurrent entries compute the same `prevBalance`.
10. **Tests don't touch the API.** 173 unit tests, 0 route tests, despite `README.md:305`. Badge at `README.md:10`/`:303` says 174/17 suites — stale by one.
11. **`npx tsc --noEmit` fails** with 4 test-file errors while `next build` passes. **Frame:** "I'd fix the four lines and make CI run `tsc --noEmit` explicitly."
12. **Docs drift.** README claims 7-day JWT (`README.md:188`), `/admin/analytics` (`README.md:108`), env-based-only credentials (`README.md:190`) — code says 1 day (`src/lib/auth.ts:45`), analytics merged into dashboard (`c623723`), and a hardcoded pepper (`src/lib/auth.ts:6`, `prisma/seed.ts:5`).

---

## Security findings

All secrets below are shown as `<REDACTED>`; **no value from `.env`, `.env.local`, `.env.vercel` or `PROJECT_BLACKBOOK.md` was read or printed.** Those files are gitignored: `.env*` (`.gitignore:19`, exception `!.env.example:20`), `PROJECT_BLACKBOOK.md` (`.gitignore:37`), `prisma/dev.db` (`.gitignore:29`), `scripts/` (`.gitignore:42`).

**Finding 1 — Live Turso auth token hardcoded in working-tree scripts (HIGH).**
`scripts/assign-prices.mjs:5`, `scripts/fix-tier-prices.mjs:4` and `scripts/check-zero-prices.ps1` contain a literal `authToken`. Values: `<REDACTED>`. These files are untracked, so they're not in the repo — but they're on this disk and were shared in tooling.

**Finding 2 — The same class of token was committed to git history (HIGH, needs rotation).**
`git show 24e6278:scripts/migrate-isactive.js` contains a **literal** Turso token (`LITERAL: <REDACTED>`); also in `git show 24e6278:scripts/fix-corrupted.js` and `git show 24e6278:scripts/fix-to-iso.js`. They were purged from the tree in `18634e0 cleanup - remove dead code, secrets…` and untracked in `82bd6d7 remove scripts from git tracking (gitignored, contain secrets)`, but **history still holds them**. Action: rotate the Turso token regardless of the purge.

**Finding 3 — NIM (NVIDIA) API keys in history (HIGH, needs rotation).**
`91c39bd` removed hardcoded keys, `6994983` *"Revert: restore hardcoded API keys (repo is private)"* put them back, `82bd6d7` untracked the scripts. Values: `<REDACTED>`. Present in history; `.env.example:35` only carries a placeholder.

**Finding 4 — Hardcoded pepper / "secret" literals in committed source (MEDIUM).**
`const PEPPER = "shreegurudevplastics"` at `src/lib/auth.ts:6` and `prisma/seed.ts:5` (used at `:8`, `:27`). It is a pepper, not a password — but it is in a public-looking repo and it makes `JWT_SECRET` the only real secret. Also `JWT_ISSUER`/`JWT_AUDIENCE` literals (`src/lib/auth.ts:40-41`). Secrets referenced by name only: `JWT_SECRET`, `NEXTAUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CLOUDINARY_API_SECRET`, `TURSO_AUTH_TOKEN` — all `<REDACTED>`; their *names* are documented in `.env.example:2-35` (values are placeholders, e.g. `.env.example:35`).

**Finding 5 — Client-controlled charge amount (MEDIUM).**
`src/app/api/razorpay/order/route.ts:8-30` takes `amount` from the body; `src/app/api/razorpay/verify/route.ts:14-35` verifies the signature but never compares to `Order.total`. `securityLogger.priceManipulationAttempt` exists (`src/lib/security-logger.ts:45`) and is never called.

**Finding 6 — In-memory security controls (MEDIUM).**
Rate limit is a per-instance `Map` (`src/lib/rate-limit.ts:6`) applied to 2 of the 64 API routes; security logs are a 1000-entry in-memory array with no read endpoint (`src/lib/security-logger.ts:12`, `:61`).

**Finding 7 — Unauthenticated state-changing endpoint (MEDIUM).**
`POST /api/orders/track/[token]/cancel` has no auth, no rate limit, and restores stock (`src/app/api/orders/track/[token]/cancel/route.ts:23-43`). Protection is only token secrecy + regex; it also allows cancelling a `paid` order with no refund path (`paymentStatus` is never touched).

**Finding 8 — Unverified deletes (LOW).**
`DELETE /api/products/[id]` hard-deletes with no dependency check (`src/app/api/products/[id]/route.ts:100-122`), and `OrderItem.product` is a required relation with no `onDelete` (`prisma/schema.prisma:199-200`) — so the first product that has ever been ordered fails the delete and the handler swallows it into a generic 500 (`:116-121`).

**Positive controls worth mentioning:** admin JWT with issuer/audience claims (`src/lib/auth.ts:40-47`), httpOnly+secure+sameSite cookie (`src/app/api/auth/login/route.ts:56-62`), registration endpoints blocked in middleware (`middleware.ts:105-111`), single-admin invariant (`src/lib/db.ts:22-41`, `src/app/api/auth/login/route.ts:29-35`), global security headers (`next.config.ts:41-49`), zod validation on every body I checked, Cloudinary/upload and all `/api/admin/*` behind `getAuthUser()` (`src/app/api/upload/route.ts:9`).

---

## The actual role: AI Engineer | Vantrock Intelligence | Mumbai

Added after the file was written — the JD was supplied by the user (pasted this session, 2026-10-09), so the claims below are **external, not repo-verified**. Quotes verbatim, trimmed. *(An earlier draft of this section described a different seat — the Founder's Office posting — and was replaced; do not reuse that content.)*

**The brief in their words**

- "A builder who ships. You will create the internal tools that make the whole company faster and build features on our core product, learning directly under our Lead AI Engineer in a small, senior team."
- "Vantrock Intelligence is building an AI-native operating system for the real estate asset lifecycle, spanning capital raising, land acquisition, development and leasing… starting inside a live real estate development fund where we solve real problems, with the ambition of turning it into a product for real asset companies everywhere."
- "You will split your time between internal tools and product work, with real ownership from the start."
- Must-haves: "You have built and shipped software that real people use… and you can show us." / "You understand the code you ship, including the code AI tools help you write." / "You use AI coding tools every week as a normal part of how you build." / "You take direction well and own outcomes without needing heavy structure."
- Experience: "Around 1 to 4 years of experience… Strong internships and serious personal projects count. We care far more about what you have built than how long you have been working."
- Nice to have: "Full-stack range." / "Exposure to real estate, fintech or data-heavy products."
- Why join: "Learn directly under a senior engineer, work on real product from day one."

**What this repo proves against this brief**

| JD line | Evidence in this repo |
|---|---|
| "built and shipped software that real people use… and you can show us" | Production B2B storefront + admin ERP; **476 commits in 25 days** (`08b3769` → `5e1c22b`, `git rev-list --count HEAD`); you must confirm a live URL before citing it |
| "you understand the code you ship, **including the code AI tools help you write**" | Three audited failure stories: **27 silent `.catch(() => …)` blocks** replaced with error toasts (commit `a9513eb`, 14 files — cited in `## Additional likely questions` item 12); retailer tier prices written **15% above MRP** (commit `8c00e69`, root cause `scripts/assign-prices.mjs:80`); placeholder seed shipping `Math.random()` price/stock (commit `8d55cb9`, `git show 8d55cb9:scripts/seed-placeholder.ts:84-85`) |
| Diagnosing, not just patching | Stale customer aggregates — commit `c8a40a8` *"showing 34 orders (actual: 1)"* → `recomputeCustomerStats()` (`src/lib/db.ts:77-92`) |
| "Full-stack range" (nice-to-have) | Server components + **64 route-handler files** (`src/app/api/**/route.ts`) → Prisma/Turso (`prisma/schema.prisma:6-9`) → two auth systems (`src/lib/auth.ts:44-47`, `src/lib/auth-config.ts:12`) → GST/pricing (`src/lib/gst.ts:58-62`, `src/lib/pricing.ts:37-61`) → Razorpay (`src/app/api/razorpay/*`) → 173 Vitest tests → CI + Vercel (`.github/workflows/ci.yml:23-29`) |
| "fintech or data-heavy products" (nice-to-have) | Fintech-adjacent: CGST/SGST vs IGST split, invoice numbering (`src/app/api/admin/invoices/route.ts:53-54`), running-balance ledger (`src/app/api/admin/ledger/route.ts:39-58`); data-heavy: orders, stock, offers, reports across 22 admin sections (`src/app/admin/layout.tsx:33-54`) |
| "take direction well… own outcomes without needing heavy structure" | Client-contract delivery: brief → decision → shipped → verified. Frame every story that way — who asked, what you chose, how you proved it |
| "use AI coding tools every week" | **`[FILL IN: which tools, for what, one concrete example]`** — git has **zero** `Co-authored-by` / `Generated with` trailers (`git log --grep='Co-authored-by' --grep='Generated with'` = 0 commits), so the repo proves nothing here; you must own this claim personally |
| "understand the code you ship" (falsifiable) | Be ready to walk any line live: the stock transaction (`src/app/api/orders/route.ts:63-100`), the GST rounding (`src/lib/gst.ts:58-62`), the MRP ceiling guard (`src/lib/pricing.ts:56-60`) |

**What this repo does NOT prove:** no RAG, vector store or embeddings exist anywhere **(NOT FOUND IN CODE)**. This repo is the *"I ship real software and I audit what AI writes for me"* card; the deployed RAG pipeline is the *"I can build LLM application features"* card. Note: this JD does **not** name retrieval/embeddings/evaluation/MCP — that language belongs to the sibling Founder's Office posting — but the product is an *AI-native operating system*, so lead with the RAG pipeline as your product-facing sample and use this repo as proof of fundamentals.

**Strategy shift for this seat:** it is a learning-under-the-Lead, 1–4-year seat. Every answer should show (a) you execute a brief without heavy structure, (b) you can explain any line you ship, including AI-written lines, (c) you'd rather find the bug than defend it. Name who directed you and how you verified the result — this JD rewards "takes direction well" as much as initiative.

**Questions to ask them:** (1) How does the Lead AI Engineer hand work down — what did the first-week ticket look like, and what does PR review look like here? (2) Internal tools vs core product: one concrete example of each as they stand today. (3) What is live inside the fund today — which workflow would I own first? (4) What is the core product's stack, and does this site's Next.js/Prisma/TypeScript world transfer? (5) How do you judge "understands the code AI wrote" in practice — walkthroughs, tests, or on-call?

**Actions before the interview:** (1) Confirm a live URL for this site — the JD says *"you can show us"*; if it does not resolve, lead with the RAG pipeline and offer a code walkthrough of this repo. (2) Pick **one** audited-bug story (`a9513eb` silent catches or `8c00e69` MRP) and rehearse it explicitly as an *AI-code audit* — it answers "including the code AI tools help you write" better than any claim about tools. (3) Memorise the 30-second summary from `## 0. Reality check` and end it with one honest limitation from `## Weaknesses and honest framing`.

---

## Verification log (commands re-run in this session)

| Command | Result |
|---|---|
| `npm test` | `Test Files 16 passed (16)` · `Tests 173 passed (173)` · exit 0 · 15.68s |
| `npm run lint` | exit 0, no findings |
| `npx tsc --noEmit` | **exit 1** — 4 errors: `__tests__/contexts/LanguageContext.test.tsx(55,17)` `Cannot find name 'vi'`; `__tests__/contexts/RecentlyViewedContext.test.tsx(79,17)`; `__tests__/contexts/WishlistContext.test.tsx(87,17)`; `__tests__/lib/api-fetch.test.ts(41,19)` `Cannot assign to 'NODE_ENV' because it is a read-only property` |
| `npx next build` | Compiled successfully; lint + type validity step passes (earlier run this session, exit 0) |
| `git status --short` | ` M package-lock.json`, ` M package.json` (pre-existing: `@vitest/coverage-v8`), plus `?? INTERVIEW_INTEL_SGP.md` — this file. **Nothing else was modified.** |
| `git rev-list --count HEAD` | 476 |
| `git log --reverse -1` / `git log -1` | `2026-08-14 08b3769 Initial commit` → `2026-09-07 5e1c22b docs: complete 26-screenshot gallery in README` |
| `git show 8d55cb9:scripts/seed-placeholder.ts` | lines 57-58 `deleteMany()`, 84 `price: Math.floor(Math.random() * 1800) + 200`, 85 `stock: Math.floor(Math.random() * 100) + 10` |

**Do not claim:** per-commit authorship of specific lines, which AI tool produced which file, "174 tests / 17 suites", "7-day JWT", "API integration tests", or `/admin/analytics`, `/admin/subscriptions`, `/admin/recurring-orders` — all either stale or **NOT FOUND IN CODE**.

---

## Production hardening (2026-10-09)

Supersedes earlier test counts (`npm test` is now **203 passed / 21 files**) and the claim that all `/api/admin/*` routes were behind `getAuthUser` � five were not. Nine commits `0ebaa04..edb788d`, all pushed to `main` (Vercel auto-deployed).

**Findings fixed (plan: `docs/superpowers/plans/2026-10-09-admin-security-hardening.md`):**

1. **Dead middleware** � `middleware.ts` sat at repo root while the app is under `src/`, so Next.js never loaded it (prod manifest: `{"middleware": {}}`). Moved to `src/middleware.ts` (`0ebaa04`). Production proof: garbage-cookie `/api/admin/analytics` went **200 ? 401**.
2. **Unauthenticated admin routes** � `offers` GET/POST and `offers/[id]` GET/PUT/DELETE called `await getAuthUser()` and **discarded the result**; `offers/products` GET, `enquiries` GET, `enquiries/[id]` PATCH had no auth at all. Anonymous offer-create was exploited live during the audit (record deleted). Fixed `f23df6e` + `fed58e6`; prod re-check: all six now **401** anon.
3. **Edge/JWT landmine found by the re-verification** � middleware verified tokens with `jsonwebtoken`, a Node-only lib, on the Edge runtime; the error was swallowed by `try/catch` ? **every** valid admin cookie got 401 once middleware went live (admin UI broken in prod for ~10 min). Fixed in `edb788d` with a Web Crypto HS256 verifier (`src/lib/jwt-edge.ts`, 6 unit tests), same secret/issuer/audience, tokens interoperable.
4. **No input validation on product create** � zod schema + brand FK check, invalid ? **400** not 500 (`eddb3ab`).
5. **`parseInt("probe")` ? NaN ? 500** � shared `parseId`/`isNotFound` (P2025) helpers (`src/lib/http.ts`) applied across 10 route files; invalid id ? **400**, missing record ? **404** (`20a1818`, `df77893`).
6. **`/admin` was a 404** � now redirects to `/admin/dashboard` (`d435066`). Login rate limit re-keyed `login:<username>:<ip>` so distributed password-spray shares one bucket per account (`3ce4caa`).

**Production verification (live, after deploy):** 30/30 automated checks passed � gated routes, forged tokens, public surface intact, login + cookie through middleware, 400/404 mapping, product validation, full supplier CRUD round-trip, `/admin` redirect, login limiter 429 on 6th failure, track limiter 5�429/25 req. Browser pass: login ? dashboard (orders + revenue render) ? orders page, no redirect loop, only console noise is the known blocked `checkout.razorpay.com` script.

**Known limitations kept (documented, not fixed):** rate limiters are per-serverless-instance in-memory Maps (track showed 5/25 requests hitting 429 � real but porous; shared-store upgrade is backlog); track-cancel has no OTP; enquiries have no DELETE API (2 audit rows remain); festival POST still write-unexercised on prod.

**Demo rules unchanged:** enter via `/admin/login`; Products page loads slowly (~4�5 s, real data); do not click Festival Save or create/delete real records mid-demo.
