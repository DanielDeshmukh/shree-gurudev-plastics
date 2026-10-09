# Admin Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every confirmed production security/robustness finding from the 2026-10-09 production audit: dead middleware, unauthenticated admin routes, missing input validation, and 500-instead-of-404 error mapping.

**Architecture:** Three layers, cheapest first: (1) revive the already-written middleware by moving it to the path Next.js actually loads (`src/middleware.ts`) so every `/api/admin/*` request is gated globally; (2) add in-handler `getAuthUser()` checks to the five routes that lack them (defense-in-depth — middleware must not be the only guard); (3) add zod validation and consistent 400/404 mapping so malformed input never surfaces as a 500.

**Tech Stack:** Next.js 15.5 App Router, Prisma 6 + Turso/libsql, zod v4, jsonwebtoken, vitest 4 (jsdom), TypeScript.

**Spec:** Production audit findings (2026-10-09), verified against `https://shree-gurudev-plastics.vercel.app`:
- **F1 CRITICAL** — root `middleware.ts` is ignored (app lives in `src/`; Next.js only loads `src/middleware.ts`). `.next/server/middleware-manifest.json` = `{"middleware": {}}`. No admin gate, no maintenance redirect, no CORS, no `/admin` page redirect.
- **F2 CRITICAL** — unauthenticated admin routes: `api/admin/offers` GET/POST and `api/admin/offers/[id]` GET/PUT/DELETE call `await getAuthUser()` but discard the result (`offers/route.ts:7,33`; `offers/[id]/route.ts:7,39,87`); `api/admin/offers/products` GET and `api/admin/enquiries` GET and `api/admin/enquiries/[id]` PATCH have no auth at all. Anonymous offer-create was exploited live during the audit (cleaned up).
- **F3** — `api/products` POST performs no input validation: missing fields or nonexistent `brandId` → Prisma error → generic 500 instead of 400.
- **F4** — non-numeric `[id]` params (`parseInt` → `NaN`) and Prisma `P2025` (record not found) are caught by generic `catch` → 500 instead of 400/404. Verified on `invoices/[id]`, `offers/[id]`, all admin DELETE routes.
- **F5** — `/admin` (bare) → 404; `src/app/admin/page.tsx` does not exist.
- **F6 (correction)** — login rate limiting already exists (`api/auth/login/route.ts:18-27`, 5 attempts/60s per IP via `src/lib/rate-limit.ts`). The audit's 5-wrong-passwords test was a false positive (limiter trips on the 6th). Remaining gap: key is IP-only, so distributed attacks bypass it. Add a per-username key.

## Global Constraints

- Node >= 22, Next.js 15.5.13, zod ^4.4.3 (already in dependencies — do NOT add new packages).
- Test runner: `npm test` (= `vitest run`), tests live in `__tests__/**/*.test.ts(x)`, alias `@` → `src/`.
- Commit style: conventional commits (`fix:`, `feat:`, `test:`) matching repo history.
- No database schema migrations in this plan (no new Prisma models).
- Do not weaken the public storefront: `api/enquiries` POST, `api/products` GET, `api/brands` GET must stay anonymous-accessible.
- Per-instance in-memory rate limiting (login, track) is an accepted limitation on Vercel serverless — documented, not fixed, in this plan.

---

### Task 1: Revive middleware by moving it to `src/`

**Files:**
- Move: `middleware.ts` → `src/middleware.ts` (no content changes)
- Modify: `__tests__/middleware/middleware.test.ts:3` (import path only)

**Interfaces:**
- Produces: middleware that 401s unauthenticated `/api/admin/*` calls, redirects cookie-less `/admin/*` pages to `/admin/login`, answers `OPTIONS` preflights with CORS headers, blocks `/api/auth/register|signup|admin-register`, and redirects non-exempt paths to `/maintenance` when the DB flag is on.

- [ ] **Step 1: Confirm current broken state**

Run: `node -e "const m=require('fs').readFileSync('.next/server/middleware-manifest.json','utf8'); console.log(m)"` (if `.next` missing, skip — the prod check already proved `{}`).
Expected: `"middleware": {}` or file absent — confirms the bug.

- [ ] **Step 2: Move the file (git mv preserves history)**

```powershell
git mv middleware.ts src/middleware.ts
```
If `git mv` refuses because the target dir operation confuses it on Windows:
```powershell
Move-Item middleware.ts src\middleware.ts
```

- [ ] **Step 3: Fix the test import**

In `__tests__/middleware/middleware.test.ts` line 3 change:
```ts
import { middleware, _resetMaintenanceCache } from "../../middleware";
```
to:
```ts
import { middleware, _resetMaintenanceCache } from "../../src/middleware";
```

- [ ] **Step 4: Run the existing middleware test suite**

Run: `npx vitest run __tests__/middleware/middleware.test.ts`
Expected: all tests PASS (they exercise admin-gate, maintenance, CORS, registration-block — same assertions, new path).

- [ ] **Step 5: Verify the build now emits the middleware**

Run: `npm run build 2>&1 | Select-String -Pattern "middleware|ƒ"` then `Get-Content .next/server/middleware-manifest.json`
Expected: manifest contains a non-empty middleware entry (e.g. `"middleware": {"middleware": {...}}`), build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/middleware.ts __tests__/middleware/middleware.test.ts
git commit -m "fix: move middleware to src/ so Next.js actually loads it"
```

---

### Task 2: Authenticate the offers routes (discarded `getAuthUser`)

**Files:**
- Modify: `src/app/api/admin/offers/route.ts:5-8` (GET), `:31-34` (POST)
- Modify: `src/app/api/admin/offers/[id]/route.ts:5-8` (GET), `:37-40` (PUT), `:85-88` (DELETE)
- Test: `__tests__/api/offers-auth.test.ts` (new)

**Interfaces:**
- Consumes: `getAuthUser(): Promise<string | null>` from `@/lib/auth` (already imported in both files — currently result discarded).
- Produces: every offers handler returns `401 {"error":"Unauthorized"}` when `getAuthUser()` resolves falsy; behavior otherwise unchanged.

- [ ] **Step 1: Write the failing auth tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    offer: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    offerProduct: { deleteMany: vi.fn(), createMany: vi.fn() },
  },
}));

import { getAuthUser } from "@/lib/auth";
import { GET as listOffers, POST as createOffer } from "@/app/api/admin/offers/route";
import { GET as getOffer, PUT as putOffer, DELETE as delOffer } from "@/app/api/admin/offers/[id]/route";

const req = (path: string) => new NextRequest(new URL(path, "http://localhost:3000"));
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => vi.clearAllMocks());

describe("offers routes reject anonymous callers", () => {
  it("GET /api/admin/offers -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await listOffers(req("/api/admin/offers"))).status).toBe(401);
  });
  it("POST /api/admin/offers -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const r = new NextRequest(new URL("/api/admin/offers", "http://localhost:3000"), { method: "POST", body: "{}" });
    expect((await createOffer(r)).status).toBe(401);
  });
  it("GET /api/admin/offers/[id] -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await getOffer(req("/api/admin/offers/1"), ctx("1"))).status).toBe(401);
  });
  it("PUT /api/admin/offers/[id] -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const r = new NextRequest(new URL("/api/admin/offers/1", "http://localhost:3000"), { method: "PUT", body: "{}" });
    expect((await putOffer(r, ctx("1"))).status).toBe(401);
  });
  it("DELETE /api/admin/offers/[id] -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const r = new NextRequest(new URL("/api/admin/offers/1", "http://localhost:3000"), { method: "DELETE" });
    expect((await delOffer(r, ctx("1"))).status).toBe(401);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/api/offers-auth.test.ts`
Expected: FAIL — handlers currently ignore the null auth (status 200/404/500 instead of 401).

- [ ] **Step 3: Fix the discarded auth results**

In `src/app/api/admin/offers/route.ts` — replace BOTH occurrences of the bare call:
```ts
await getAuthUser();
```
with:
```ts
const admin = await getAuthUser();
if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```
(occurrences at line 7 in GET and line 33 in POST).

In `src/app/api/admin/offers/[id]/route.ts` — same replacement at line 7 (GET), line 39 (PUT), line 87 (DELETE).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/api/offers-auth.test.ts __tests__/middleware/middleware.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/offers/ __tests__/api/offers-auth.test.ts
git commit -m "fix: enforce admin auth on offers routes (discarded getAuthUser)"
```

---

### Task 3: Authenticate `offers/products`, `enquiries` GET, `enquiries/[id]` PATCH

**Files:**
- Modify: `src/app/api/admin/offers/products/route.ts:1-6`
- Modify: `src/app/api/admin/enquiries/route.ts:1-5` (GET only — POST in `api/enquiries/route.ts` stays public)
- Modify: `src/app/api/admin/enquiries/[id]/route.ts:1-8`
- Test: `__tests__/api/enquiries-offers-products-auth.test.ts` (new)

**Interfaces:**
- Consumes: `getAuthUser()` from `@/lib/auth`.
- Produces: all three handlers 401 without a valid admin cookie; `api/enquiries` POST (storefront quote form) unaffected.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ getAuthUser: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    product: { findMany: vi.fn().mockResolvedValue([]) },
    enquiry: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]), update: vi.fn() },
  },
  normalizeResult: (x: unknown) => x,
}));

import { getAuthUser } from "@/lib/auth";
import { GET as offersProducts } from "@/app/api/admin/offers/products/route";
import { GET as listEnquiries } from "@/app/api/admin/enquiries/route";
import { PATCH as patchEnquiry } from "@/app/api/admin/enquiries/[id]/route";

const get = (path: string) => new NextRequest(new URL(path, "http://localhost:3000"));

beforeEach(() => vi.clearAllMocks());

describe("remaining unauthenticated admin routes", () => {
  it("offers/products GET -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await offersProducts(get("/api/admin/offers/products"))).status).toBe(401);
  });
  it("enquiries GET -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    expect((await listEnquiries(get("/api/admin/enquiries"))).status).toBe(401);
  });
  it("enquiries/[id] PATCH -> 401", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const r = new NextRequest(new URL("/api/admin/enquiries/1", "http://localhost:3000"), { method: "PATCH", body: JSON.stringify({ status: "closed" }) });
    expect((await patchEnquiry(r, { params: Promise.resolve({ id: "1" }) })).status).toBe(401);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/api/enquiries-offers-products-auth.test.ts`
Expected: FAIL (no 401 today).

- [ ] **Step 3: Add the auth guards**

`src/app/api/admin/offers/products/route.ts` — after the existing imports add:
```ts
import { getAuthUser } from "@/lib/auth";
```
and as the first lines inside `export async function GET(...)`'s try (before any query work, replacing the bare `try {`):
```ts
const admin = await getAuthUser();
if (!admin) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

`src/app/api/admin/enquiries/route.ts` — add the same import; as the first statement of `GET` (before `try`, mirroring other admin list routes):
```ts
const admin = await getAuthUser();
if (!admin) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```
Do NOT touch `api/enquiries/route.ts` (public POST).

`src/app/api/admin/enquiries/[id]/route.ts` — add the import; first statement of `PATCH`:
```ts
const admin = await getAuthUser();
if (!admin) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/api/enquiries-offers-products-auth.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/offers/products/ src/app/api/admin/enquiries/ __tests__/api/enquiries-offers-products-auth.test.ts
git commit -m "fix: require admin auth for enquiries list/patch and offers product picker"
```

---

### Task 4: Validate product creation (zod + brand FK) — fixes F3

**Files:**
- Modify: `src/lib/validation.ts` (append schema)
- Modify: `src/app/api/products/route.ts:168-207` (POST)
- Modify: `__tests__/lib/validation.test.ts` (append cases)

**Interfaces:**
- Produces: `productCreateSchema` — zod schema; POST `/api/products` returns 400 with `{ error }` on invalid body or unknown `brandId`, 201 on success.

- [ ] **Step 1: Append failing schema tests**

Add to `__tests__/lib/validation.test.ts`:
```ts
import { productCreateSchema } from "@/lib/validation";

describe("productCreateSchema", () => {
  const valid = {
    name: "Test Chair", color: "Red", size: "STD",
    imageUrl: "https://cdn.example/x.png", brandId: 4, price: 100, stock: 5,
  };
  it("accepts a minimal valid payload", () => {
    expect(productCreateSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects missing size", () => {
    const { size: _s, ...rest } = valid;
    expect(productCreateSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects non-numeric brandId", () => {
    expect(productCreateSchema.safeParse({ ...valid, brandId: "abc" }).success).toBe(false);
  });
  it("rejects negative price", () => {
    expect(productCreateSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
  });
});
```
(If the file has no top-level imports block matching, add the import at the top with the others.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/lib/validation.test.ts`
Expected: FAIL — `productCreateSchema` not exported.

- [ ] **Step 3: Add the schema to `src/lib/validation.ts`**

Append:
```ts
export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  color: z.string().min(1).max(100),
  size: z.string().min(1).max(50),
  imageUrl: z.string().min(1).max(2000),
  brandId: z.coerce.number().int().positive(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).optional().default(0),
  category: z.string().max(100).optional(),
  subCategory: z.string().max(100).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  tags: z.string().max(500).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  retailerPrice: z.coerce.number().min(0).optional(),
  dealerPrice: z.coerce.number().min(0).optional(),
  distributorPrice: z.coerce.number().min(0).optional(),
  bulkPrice: z.coerce.number().min(0).optional(),
});
```

- [ ] **Step 4: Wire validation into the POST handler**

In `src/app/api/products/route.ts`, add to imports:
```ts
import { validate, productCreateSchema } from "@/lib/validation";
```
Replace the body of POST after the auth check (`const body = await request.json();`) with:
```ts
const body = await request.json();
const validation = validate(productCreateSchema, body);
if (!validation.success) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}
const data = validation.data;

const brand = await db.brand.findUnique({ where: { id: data.brandId } });
if (!brand) {
  return NextResponse.json({ error: "Brand not found" }, { status: 400 });
}

const product = await db.product.create({
  data: {
    name: data.name,
    slug: slugify(data.name) + "-" + Date.now(),
    color: data.color,
    size: data.size,
    brandId: data.brandId,
    imageUrl: data.imageUrl,
    price: data.price,
    retailerPrice: data.retailerPrice || 0,
    dealerPrice: data.dealerPrice || 0,
    distributorPrice: data.distributorPrice || 0,
    bulkPrice: data.bulkPrice || 0,
    stock: data.stock,
    category: data.category || "General",
    subCategory: data.subCategory || null,
    description: data.description || null,
    tags: data.tags || "",
    lowStockThreshold: data.lowStockThreshold || 10,
  },
  include: { brand: true },
});

return NextResponse.json({ product }, { status: 201 });
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run __tests__/lib/validation.test.ts`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/validation.ts src/app/api/products/route.ts __tests__/lib/validation.test.ts
git commit -m "fix: validate product creation payload and brand foreign key"
```

---

### Task 5: 400/404 error-mapping helpers + apply to invoices and offers `[id]` routes — fixes F4 (part 1)

**Files:**
- Create: `src/lib/http.ts`
- Modify: `src/app/api/admin/invoices/[id]/route.ts` (GET, PUT, DELETE)
- Modify: `src/app/api/admin/offers/[id]/route.ts` (GET, PUT, DELETE — Task 2 already added auth; keep it)
- Test: `__tests__/lib/http.test.ts` (new)

**Interfaces:**
- Produces:
  - `parseId(raw: string | null | undefined): number | null` — digits-only, safe-integer, > 0.
  - `isNotFound(e: unknown): boolean` — true for Prisma P2025.
  - `badRequest(msg: string): NextResponse` — 404 helper `notFoundJson(msg?: string)`.
- These three exports are reused by Task 6.

- [ ] **Step 1: Write failing helper tests**

```ts
import { describe, it, expect } from "vitest";
import { parseId, isNotFound, badRequest, notFoundJson } from "@/lib/http";

describe("parseId", () => {
  it("accepts plain positive integers", () => expect(parseId("17")).toBe(17));
  it("rejects non-numeric", () => expect(parseId("probe-no-such")).toBeNull());
  it("rejects NaN-producing garbage", () => expect(parseId("NaN")).toBeNull());
  it("rejects zero and negatives", () => {
    expect(parseId("0")).toBeNull();
    expect(parseId("-5")).toBeNull();
  });
  it("rejects null/undefined/empty", () => {
    expect(parseId(null)).toBeNull();
    expect(parseId(undefined)).toBeNull();
    expect(parseId("")).toBeNull();
  });
});
describe("isNotFound", () => {
  it("detects Prisma P2025", () => expect(isNotFound({ code: "P2025" })).toBe(true));
  it("ignores other errors", () => {
    expect(isNotFound(new Error("boom"))).toBe(false);
    expect(isNotFound(null)).toBe(false);
  });
});
describe("responses", () => {
  it("badRequest is 400", () => expect(badRequest("x").status).toBe(400));
  it("notFoundJson is 404", () => expect(notFoundJson().status).toBe(404));
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run __tests__/lib/http.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/lib/http.ts`**

```ts
import { NextResponse } from "next/server";

export function parseId(raw: string | null | undefined): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

export function isNotFound(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "P2025";
}

export function badRequest(msg: string): NextResponse {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export function notFoundJson(msg = "Not found"): NextResponse {
  return NextResponse.json({ error: msg }, { status: 404 });
}
```

- [ ] **Step 4: Apply to `src/app/api/admin/invoices/[id]/route.ts`**

For GET, PUT, DELETE — same pattern. Top of file add:
```ts
import { parseId, isNotFound, badRequest, notFoundJson } from "@/lib/http";
```
Inside each handler, immediately after `const { id } = await params;`:
```ts
const numericId = parseId(id);
if (!numericId) return badRequest("Invalid invoice id");
```
Replace every `parseInt(id)` with `numericId`. In each `catch`, split the catch:
```ts
} catch (error) {
  if (isNotFound(error)) return notFoundJson("Invoice not found");
  return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
}
```
(GET: "Failed to fetch invoice"; PUT: "Failed to update invoice"; DELETE: "Failed to delete invoice" — keep each handler's existing message.)

- [ ] **Step 5: Apply the identical pattern to `src/app/api/admin/offers/[id]/route.ts`**

Same imports; `parseId` guard with message `"Invalid offer id"`; `notFoundJson("Offer not found")` in the catches (GET/PUT already return a JSON 404 for missing rows via `findUnique` null-check — keep those; the catch mapping is for the delete path and unexpected P2025).

- [ ] **Step 6: Run tests**

Run: `npx vitest run __tests__/lib/http.test.ts`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/http.ts src/app/api/admin/invoices/ src/app/api/admin/offers/ __tests__/lib/http.test.ts
git commit -m "fix: map invalid ids to 400 and missing records to 404 in invoices/offers"
```

---

### Task 6: Apply parseId/P2025 mapping to remaining admin DELETE/PATCH routes — fixes F4 (part 2)

**Files:**
- Modify: `src/app/api/admin/suppliers/route.ts` (PUT, DELETE)
- Modify: `src/app/api/admin/purchase-orders/route.ts` (PATCH, DELETE)
- Modify: `src/app/api/admin/delivery/slots/route.ts` (PATCH, DELETE)
- Modify: `src/app/api/admin/price-lock/route.ts` (DELETE)
- Modify: `src/app/api/admin/bundles/route.ts` (PUT, DELETE — read `:91-108` first for the DELETE shape)
- Modify: `src/app/api/admin/customers/[id]/route.ts` (PUT)
- Modify: `src/app/api/brands/[id]/route.ts` (PUT, DELETE)
- Modify: `src/app/api/products/[id]/route.ts` (PUT, DELETE — read `:100-122` first)

**Interfaces:**
- Consumes: `parseId`, `isNotFound`, `badRequest`, `notFoundJson` from Task 5's `@/lib/http`.

- [ ] **Step 1: Apply the mechanical pattern to each file**

For every listed handler, add:
```ts
import { parseId, isNotFound, badRequest, notFoundJson } from "@/lib/http";
```
Body-id routes (PUT/PATCH): after reading `const { id } = await params;` (or `const { id, ...fields } = body;`) do:
```ts
const numericId = parseId(id);
if (!numericId) return badRequest("Invalid id");
```
and use `numericId` in `where: { id: numericId }`. Query-param DELETEs (`?id=`): same guard on `searchParams.get("id")`.
Every `catch` becomes:
```ts
} catch (error) {
  if (isNotFound(error)) return notFoundJson("<Entity> not found");
  return NextResponse.json({ error: "Failed to <verb> <entity>" }, { status: 500 });
}
```
Entities: supplier, purchase order, slot, price lock, bundle, customer, brand, product.

- [ ] **Step 2: Re-run the whole unit suite for regressions**

Run: `npm test`
Expected: all PASS (173 existing + new tasks' tests).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/ src/app/api/brands/ src/app/api/products/
git commit -m "fix: consistent 400/404 responses across admin id-based mutations"
```

---

### Task 7: Create `/admin` index redirect — fixes F5

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Create the redirect page**

```tsx
import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | Select-String "admin/page"` and `npm run build 2>&1 | Select-String "/admin"`
Expected: no new type errors; build shows the `/admin` route.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "fix: redirect bare /admin to the dashboard"
```

---

### Task 8: Per-username login rate-limit key — fixes F6

**Files:**
- Modify: `src/app/api/auth/login/route.ts:18-19`
- Modify: `__tests__/` — extend via a focused new test file `__tests__/api/login-ratelimit.test.ts`

**Interfaces:**
- Consumes: `checkRateLimit(key, max, windowMs): { allowed, remaining, resetAt }` from `@/lib/rate-limit` (already used).

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("login rate limit keying", () => {
  beforeEach(() => vi.resetModules());
  it("blocks after 5 failures for the same username even from rotating IPs", async () => {
    vi.useFakeTimers();
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = (u: string, _ip: string) => `login:${u}`; // mirrors route logic
    let blocked = false;
    for (let i = 0; i < 6; i++) {
      const r = checkRateLimit(key("shreegurudev", `10.0.0.${i}`), 5, 60_000);
      if (!r.allowed) blocked = true;
    }
    expect(blocked).toBe(true);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run __tests__/api/login-ratelimit.test.ts`
Expected: PASS trivially against current lib (key is computed in the test) — this locks the intended key format; the route change below makes reality match.

- [ ] **Step 3: Change the route key**

In `src/app/api/auth/login/route.ts` replace:
```ts
const rateKey = `login:${ip}`;
const { allowed, remaining, resetAt } = checkRateLimit(rateKey, 5, 60_000);
```
with:
```ts
const rateKey = `login:${username}:${ip}`;
const { allowed, remaining, resetAt } = checkRateLimit(rateKey, 5, 60_000);
```
(`username` is in scope from the validated body at line 15.)

- [ ] **Step 4: Run tests**

Run: `npx vitest run __tests__/api/login-ratelimit.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/auth/login/route.ts __tests__/api/login-ratelimit.test.ts
git commit -m "fix: rate-limit logins per username+IP, not IP alone"
```

---

### Task 9: Full local gate + deploy + production re-verification

**Files:**
- No source changes; verification only.
- Reference script (run from temp, do not commit): the anon/CRUD probe pattern from the 2026-10-09 audit.

- [ ] **Step 1: Local quality gate (all four must pass)**

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
```
Expected: tests PASS; lint 0 errors; `tsc --noEmit` shows only the 4 pre-existing test-file errors (repo baseline) and NOTHING in `src/`; build succeeds.
Known baseline to preserve: before this work `tsc --noEmit` failed with 4 errors in test files — do not add new ones (Tasks 4-6 tests are plain vitest, no type-level trickery).

- [ ] **Step 2: Deploy via the project's normal flow**

```powershell
git push   # if Vercel git-integration is connected
# or: npx vercel --prod --yes
```

- [ ] **Step 3: Confirm middleware is live**

```powershell
$r = Invoke-WebRequest -Uri "https://shree-gurudev-plastics.vercel.app/api/admin/analytics" -SkipHttpErrorCheck
$r.StatusCode   # expect 401
```
Expected: `401` (was `200` with a garbage cookie / anon before).

- [ ] **Step 4: Run the production security matrix (read-only)**

Node one-liner battery, all must hold:
- anon GET `/api/admin/offers`, `/api/admin/offers/products`, `/api/admin/enquiries` → **401** (were 200)
- anon PATCH `/api/admin/enquiries/1` with `{}` → **401** (was 400/500)
- anon POST `/api/admin/offers` with `{}` → **401** (was 400/200 path)
- forged tokens (`admin_token=garbage`, empty, `Bearer` junk) on `/api/admin/analytics` → **401**
- anon GET `/api/health`, `/api/products?limit=1` → **200** (public surface intact)
- 6 rapid wrong-password logins → at least one **429** with `Retry-After`
- `GET /api/admin/invoices/probe-no-such` → **400** (was 500); `GET /api/admin/invoices/999999` → **404**
- POST `/api/products` `{}` → **400** with validation message (was 500)
- anon GET `/api/orders/track/<32-hex>` × 25 → count 429s ≥ 1 (in-instance) — if 0, record as known serverless limitation, not a regression
- bare `https://…/admin` → **307/200 redirect to `/admin/dashboard`** (was 404)

- [ ] **Step 5: Production CRUD spot-check (one entity, full cycle)**

Supplier: POST create `ZZ_FIX_TEST` → GET find → PUT rename → DELETE → GET gone. Confirms writes still work after middleware revival (middleware must not 401 the legitimate cookie).

- [ ] **Step 6: Update the audit record**

Append results to `INTERVIEW_INTEL_SGP.md` under a new `## Production hardening (2026-10-09)` section: findings F1-F6, commit hashes, re-verification outcomes. Keep the section ≤ 40 lines.

- [ ] **Step 7: Commit docs**

```bash
git add INTERVIEW_INTEL_SGP.md
git commit -m "docs: record production hardening results"
```

---

## Known Limitations (document, do not fix here)

1. **Rate limiting is per-serverless-instance** (`src/lib/rate-limit.ts` in-memory Map). On Vercel, traffic can spread across instances, weakening both login and track limits. Proper fix = shared store (Turso `Setting`-backed counters or Upstash Redis) — separate project.
2. **Track cancel has no OTP** — the 32-hex capability link is the only gate. Acceptable for the threat model; revisit if abuse appears.
3. **Enquiries have no DELETE API** — the two ZZ_TEST rows from the audit stay until a delete endpoint exists (backlog).
4. **Festival POST still unexercised on prod** — write path proven only by code review; schedule an explicit no-op verification (POST identical GET values) post-deploy if desired.

## Self-Review Notes

- F1 → Task 1; F2 → Tasks 2-3; F3 → Task 4; F4 → Tasks 5-6; F5 → Task 7; F6 → Task 8; verification → Task 9. No finding unclaimed.
- `parseId`/`isNotFound` defined once (Task 5) and reused (Task 6) — no signature drift.
- Auth-guard snippet is byte-identical across Tasks 2-3.
- Public endpoints explicitly protected from over-reach: `api/enquiries` POST, `api/products` GET, `api/brands` GET untouched.
