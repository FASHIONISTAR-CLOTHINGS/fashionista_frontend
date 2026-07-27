# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: global.setup.ts >> seed: vendor auth
- Location: e2e\global.setup.ts:40:1

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED 127.0.0.1:8001
Call log:
  - → POST http://127.0.0.1:8001/api/v1/auth/login/
    - user-agent: Playwright/1.62.0 (x64; windows 10.0) node/24.14
    - accept: application/json,text/html,*/*
    - accept-encoding: gzip,deflate,br
    - X-E2E-Test: 1
    - content-type: application/json
    - content-length: 75

```

# Test source

```ts
  1  | /**
  2  |  * e2e/global.setup.ts
  3  |  * Global setup — runs ONCE before all Playwright tests.
  4  |  * Seeds test users and captures auth state for fixtures.
  5  |  */
  6  | import { test as setup } from "@playwright/test";
  7  | import path from "path";
  8  | import { fileURLToPath } from "url";
  9  | 
  10 | const __filename = fileURLToPath(import.meta.url);
  11 | const __dirname = path.dirname(__filename);
  12 | 
  13 | const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";
  14 | 
  15 | // State files — saved once, reused by all test workers
  16 | export const CLIENT_AUTH_FILE   = path.join(__dirname, ".auth/client.json");
  17 | export const VENDOR_AUTH_FILE   = path.join(__dirname, ".auth/vendor.json");
  18 | export const ADMIN_AUTH_FILE    = path.join(__dirname, ".auth/admin.json");
  19 | 
  20 | // ── Seed client user ──────────────────────────────────────────────────────────
  21 | setup("seed: client auth", async ({ request }) => {
  22 |   // Register or login a test client
  23 |   const loginRes = await request.post(`${API}/api/v1/auth/login/`, {
  24 |     data: {
  25 |       email_or_phone: process.env.E2E_CLIENT_EMAIL ?? "e2e_client@fashionistar.ng",
  26 |       password: process.env.E2E_CLIENT_PASSWORD ?? "E2EClient!2026",
  27 |     },
  28 |   });
  29 | 
  30 |   if (loginRes.ok()) {
  31 |     await request.storageState({ path: CLIENT_AUTH_FILE });
  32 |     // Store tokens in localStorage via a page context
  33 |     console.log("✅ Client auth seeded");
  34 |   } else {
  35 |     console.warn("⚠️  Client auth setup failed — tests requiring auth will be skipped");
  36 |   }
  37 | });
  38 | 
  39 | // ── Seed vendor user ──────────────────────────────────────────────────────────
  40 | setup("seed: vendor auth", async ({ request }) => {
> 41 |   const loginRes = await request.post(`${API}/api/v1/auth/login/`, {
     |                                  ^ Error: apiRequestContext.post: connect ECONNREFUSED 127.0.0.1:8001
  42 |     data: {
  43 |       email_or_phone: process.env.E2E_VENDOR_EMAIL ?? "e2e_vendor@fashionistar.ng",
  44 |       password: process.env.E2E_VENDOR_PASSWORD ?? "E2EVendor!2026",
  45 |     },
  46 |   });
  47 | 
  48 |   if (loginRes.ok()) {
  49 |     await request.storageState({ path: VENDOR_AUTH_FILE });
  50 |     console.log("✅ Vendor auth seeded");
  51 |   } else {
  52 |     console.warn("⚠️  Vendor auth setup failed");
  53 |   }
  54 | });
  55 | 
```