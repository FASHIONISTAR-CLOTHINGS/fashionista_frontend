/**
 * FASHIONISTAR — Vendor Dashboard Full E2E Test Suite v2
 * Date: 26th May 2026
 * Uses separate page contexts for API tests vs navigation
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ─────────────────────────────────────────────────────────
const BACKEND_NGROK  = 'https://aeration-scabby-navy.ngrok-free.dev';
const FRONTEND_NGROK = 'https://hydrographically-tawdrier-hayley.ngrok-free.dev';
const LOCAL_FE       = 'http://localhost:3000';
const LOCAL_BE       = 'http://localhost:8001';
const SHOTS_DIR      = join(__dirname, 'test-evidence', 'screenshots');
const RESULTS        = [];
let   VENDOR_TOKEN   = null;
let   VENDOR_EMAIL   = null;

function log(msg, status = 'INFO') {
  const ts = new Date().toISOString().substring(11,19);
  console.log(`[${ts}] [${status.padEnd(10)}] ${msg}`);
  RESULTS.push({ ts, status, msg });
}
function ensureDir(d) { if (!existsSync(d)) mkdirSync(d, { recursive: true }); }
async function shot(page, name, label) {
  ensureDir(SHOTS_DIR);
  const file = join(SHOTS_DIR, `${name}.png`);
  try { await page.screenshot({ path: file, fullPage: true }); } catch(e) { 
    await page.screenshot({ path: file, fullPage: false }).catch(() => {}); 
  }
  log(`📸 ${name}.png — ${label}`, 'SCREENSHOT');
  return file;
}
async function w(page, ms = 2000) { await page.waitForTimeout(ms); }

// ── HTTP helper via fetch in isolated blank page ────────────────────
async function apiFetch(browser, url, opts = {}) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'ngrok-skip-browser-warning': 'true' } });
  const p = await ctx.newPage();
  await p.goto('about:blank');
  const result = await p.evaluate(async ({ url, opts }) => {
    try {
      const r = await fetch(url, {
        method: opts.method || 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true', 'Accept': 'application/json', ...opts.headers },
        body: opts.body ? JSON.stringify(opts.body) : undefined
      });
      let body;
      try { body = await r.json(); } catch { body = await r.text(); }
      return { ok: r.ok, status: r.status, body };
    } catch(e) { return { ok: false, status: 0, body: null, error: String(e) }; }
  }, { url, opts });
  await ctx.close();
  return result;
}

// ── LAYER 1: Backend Health & Public API Smoke ──────────────────────
async function layer1_healthAndPublic(browser) {
  log('━━━ LAYER 1: Health Check & Public API Smoke Tests ━━━', 'SECTION');
  const tests = [
    { name: 'health_check',         url: `${LOCAL_BE}/health/`,                              expect: [200] },
    { name: 'health_ngrok',         url: `${BACKEND_NGROK}/health/`,                         expect: [200] },
    { name: 'swagger_docs',         url: `${LOCAL_BE}/swagger/?format=openapi`,              expect: [200] },
    { name: 'ninja_docs',           url: `${LOCAL_BE}/api/v1/ninja/docs`,                   expect: [200, 301, 302] },
    { name: 'public_catalog',       url: `${LOCAL_BE}/api/v1/ninja/catalog/collections/`,   expect: [200] },
    { name: 'public_products',      url: `${LOCAL_BE}/api/v1/ninja/products/`,              expect: [200] },
    { name: 'vendor_profile_unauth',url: `${LOCAL_BE}/api/v1/vendor/profile/`,              expect: [401, 403] },
    { name: 'vendor_dashboard_unauth', url: `${LOCAL_BE}/api/v1/ninja/vendor/dashboard/`,   expect: [401, 403] },
  ];
  const out = [];
  for (const t of tests) {
    const r = await apiFetch(browser, t.url);
    const pass = t.expect.includes(r.status);
    log(`  ${pass ? '✅' : '❌'} ${t.name}: HTTP ${r.status}`, pass ? 'PASS' : 'FAIL');
    out.push({ ...t, status: r.status, pass });
  }
  return out;
}

// ── LAYER 2: Vendor Account Creation & JWT Auth ─────────────────────
async function layer2_vendorAuth(browser) {
  log('━━━ LAYER 2: Vendor Account Registration & JWT Auth ━━━', 'SECTION');
  const email = `vendor.e2e.${Date.now()}@fashionistar.ng`;
  const password = 'VendorE2E@2026!';

  // Register
  const reg = await apiFetch(browser, `${LOCAL_BE}/api/v1/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email, password, confirm_password: password, role: 'vendor' }
  });
  log(`  Register: HTTP ${reg.status} — ${JSON.stringify(reg.body).substring(0, 120)}`, 
    reg.status < 500 ? 'INFO' : 'WARN');

  // Login
  const login = await apiFetch(browser, `${LOCAL_BE}/api/v1/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email, password }
  });

  if (login.ok && login.body?.access) {
    VENDOR_TOKEN = login.body.access;
    VENDOR_EMAIL = email;
    log(`  ✅ JWT Obtained for ${email} | Token: ${VENDOR_TOKEN.substring(0,20)}...`, 'PASS');
    log(`  ✅ Token type: ${login.body.token_type || 'bearer'} | Refresh: ${login.body.refresh?.substring(0,15)}...`, 'PASS');
  } else {
    log(`  ❌ Login failed: HTTP ${login.status} — ${JSON.stringify(login.body).substring(0, 200)}`, 'FAIL');
  }
  return { email, token: VENDOR_TOKEN, loginStatus: login.status };
}

// ── LAYER 3: Authenticated Vendor API Tests ─────────────────────────
async function layer3_vendorAPIAuth(browser) {
  log('━━━ LAYER 3: Authenticated Vendor API Endpoint Tests ━━━', 'SECTION');
  if (!VENDOR_TOKEN) { log('  ⚠️  No token — skipping', 'WARN'); return []; }

  const h = { 'Authorization': `Bearer ${VENDOR_TOKEN}`, 'Content-Type': 'application/json' };
  const endpoints = [
    { name: 'ninja_dashboard',       url: `${LOCAL_BE}/api/v1/ninja/vendor/dashboard/`,       expect: [200, 422] },
    { name: 'ninja_setup_state',     url: `${LOCAL_BE}/api/v1/ninja/vendor/setup/`,           expect: [200, 404, 422] },
    { name: 'drf_profile',           url: `${LOCAL_BE}/api/v1/vendor/profile/`,               expect: [200, 404] },
    { name: 'drf_analytics_summary', url: `${LOCAL_BE}/api/v1/vendor/analytics/`,             expect: [200, 404] },
    { name: 'drf_products',          url: `${LOCAL_BE}/api/v1/vendor/products/`,              expect: [200] },
    { name: 'drf_orders',            url: `${LOCAL_BE}/api/v1/vendor/orders/`,                expect: [200] },
    { name: 'drf_coupons',           url: `${LOCAL_BE}/api/v1/vendor/coupons/`,              expect: [200] },
    { name: 'drf_reviews',           url: `${LOCAL_BE}/api/v1/vendor/reviews/`,              expect: [200] },
    { name: 'drf_revenue_chart',     url: `${LOCAL_BE}/api/v1/vendor/analytics/revenue/`,     expect: [200, 404] },
    { name: 'drf_monthly_orders',    url: `${LOCAL_BE}/api/v1/vendor/analytics/orders/`,      expect: [200, 404] },
    { name: 'drf_top_categories',    url: `${LOCAL_BE}/api/v1/vendor/analytics/categories/`,  expect: [200, 404] },
    { name: 'drf_payment_dist',      url: `${LOCAL_BE}/api/v1/vendor/analytics/distribution/`,expect: [200, 404] },
    { name: 'drf_customers',         url: `${LOCAL_BE}/api/v1/vendor/analytics/customers/`,   expect: [200, 404] },
    { name: 'drf_low_stock',         url: `${LOCAL_BE}/api/v1/vendor/products/low-stock/`,   expect: [200] },
    { name: 'ninja_kyc_status',      url: `${LOCAL_BE}/api/v1/ninja/kyc/status/`,            expect: [200, 404, 422] },
    { name: 'ninja_kyc_documents',   url: `${LOCAL_BE}/api/v1/ninja/kyc/documents/`,         expect: [200, 404, 422] },
    { name: 'drf_order_status_counts',url:`${LOCAL_BE}/api/v1/vendor/orders/status-counts/`, expect: [200] },
    // ngrok versions of key endpoints
    { name: 'ngrok_dashboard',       url: `${BACKEND_NGROK}/api/v1/ninja/vendor/dashboard/`, expect: [200, 401, 403, 422] },
    { name: 'ngrok_products',        url: `${BACKEND_NGROK}/api/v1/vendor/products/`,        expect: [200, 401, 403] },
  ];

  const out = [];
  for (const ep of endpoints) {
    const r = await apiFetch(browser, ep.url, { headers: h });
    const pass = ep.expect.includes(r.status);
    const preview = typeof r.body === 'object' ? JSON.stringify(r.body).substring(0, 80) : String(r.body).substring(0, 80);
    log(`  ${pass ? '✅' : '❌'} [${r.status}] ${ep.name} | ${preview}`, pass ? 'PASS' : 'FAIL');
    out.push({ ...ep, status: r.status, pass, preview });
  }
  return out;
}

// ── LAYER 4: 403 Auth Denial Tests ────────────────────────────────
async function layer4_authDenials(browser) {
  log('━━━ LAYER 4: Auth Guard — 403 Denial Tests (Client vs Vendor) ━━━', 'SECTION');

  // Create a CLIENT role token
  const email = `client.deny.${Date.now()}@fashionistar.ng`;
  const password = 'ClientDeny@2026!';
  await apiFetch(browser, `${LOCAL_BE}/api/v1/auth/register/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: { email, password, confirm_password: password, role: 'client' }
  });
  const loginR = await apiFetch(browser, `${LOCAL_BE}/api/v1/auth/login/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: { email, password }
  });

  if (!loginR.ok || !loginR.body?.access) {
    log('  ⚠️  Could not create client token — skipping', 'WARN');
    return [];
  }
  const clientToken = loginR.body.access;
  log(`  CLIENT token obtained: ${email}`, 'INFO');

  const denialEndpoints = [
    { name: 'vendor_analytics_summary', url: `${LOCAL_BE}/api/v1/vendor/analytics/` },
    { name: 'vendor_products',          url: `${LOCAL_BE}/api/v1/vendor/products/` },
    { name: 'vendor_orders',            url: `${LOCAL_BE}/api/v1/vendor/orders/` },
    { name: 'vendor_coupons',           url: `${LOCAL_BE}/api/v1/vendor/coupons/` },
    { name: 'vendor_reviews',           url: `${LOCAL_BE}/api/v1/vendor/reviews/` },
    { name: 'ninja_vendor_dashboard',   url: `${LOCAL_BE}/api/v1/ninja/vendor/dashboard/` },
    { name: 'vendor_low_stock',         url: `${LOCAL_BE}/api/v1/vendor/products/low-stock/` },
    { name: 'vendor_order_status',      url: `${LOCAL_BE}/api/v1/vendor/orders/status-counts/` },
  ];

  const h = { 'Authorization': `Bearer ${clientToken}` };
  const out = [];
  for (const ep of denialEndpoints) {
    const r = await apiFetch(browser, ep.url, { headers: h });
    const pass = r.status === 403;
    log(`  ${pass ? '✅' : '❌'} CLIENT→VENDOR BLOCKED [${r.status}] ${ep.name}`, pass ? 'PASS' : 'FAIL');
    out.push({ ...ep, status: r.status, pass });
  }
  return out;
}

// ── LAYER 5: Input Validation (400 tests) ─────────────────────────
async function layer5_validation(browser) {
  log('━━━ LAYER 5: 400 Input Validation Tests ━━━', 'SECTION');
  const tests = [
    {
      name: 'register_empty_body',
      url: `${LOCAL_BE}/api/v1/auth/register/`,
      method: 'POST', body: {}, expect: [400]
    },
    {
      name: 'register_weak_password',
      url: `${LOCAL_BE}/api/v1/auth/register/`,
      method: 'POST', body: { email: 'test@t.com', password: '123', confirm_password: '123' }, expect: [400]
    },
    {
      name: 'register_invalid_email',
      url: `${LOCAL_BE}/api/v1/auth/register/`,
      method: 'POST', body: { email: 'notanemail', password: 'Good@Pass123', confirm_password: 'Good@Pass123' }, expect: [400]
    },
    {
      name: 'register_mismatched_passwords',
      url: `${LOCAL_BE}/api/v1/auth/register/`,
      method: 'POST', body: { email: 'ok@test.com', password: 'Pass@123', confirm_password: 'Diff@123' }, expect: [400]
    },
    {
      name: 'login_wrong_creds',
      url: `${LOCAL_BE}/api/v1/auth/login/`,
      method: 'POST', body: { email: 'nobody@nobody.com', password: 'wrong' }, expect: [400, 401]
    },
    {
      name: 'login_empty_body',
      url: `${LOCAL_BE}/api/v1/auth/login/`,
      method: 'POST', body: {}, expect: [400]
    },
  ];

  const out = [];
  for (const t of tests) {
    const r = await apiFetch(browser, t.url, {
      method: t.method, headers: { 'Content-Type': 'application/json' }, body: t.body
    });
    const pass = t.expect.includes(r.status);
    log(`  ${pass ? '✅' : '❌'} ${t.name}: HTTP ${r.status}`, pass ? 'PASS' : 'FAIL');
    out.push({ ...t, status: r.status, pass });
  }
  return out;
}

// ── LAYER 6: Idempotency & Concurrency Tests ───────────────────────
async function layer6_idempotency(browser) {
  log('━━━ LAYER 6: Idempotency & Concurrent Request Tests ━━━', 'SECTION');
  if (!VENDOR_TOKEN) { log('  ⚠️  No token — skipping', 'WARN'); return []; }

  const h = { 'Authorization': `Bearer ${VENDOR_TOKEN}` };
  const urls = [
    `${LOCAL_BE}/api/v1/vendor/products/`,
    `${LOCAL_BE}/api/v1/vendor/orders/`,
    `${LOCAL_BE}/api/v1/ninja/vendor/dashboard/`,
  ];

  // Sequential double-hit — check same status
  const out = [];
  for (const url of urls) {
    const [r1, r2] = await Promise.all([
      apiFetch(browser, url, { headers: h }),
      apiFetch(browser, url, { headers: h })
    ]);
    const pass = r1.status === r2.status;
    const name = url.split('/api/v1/')[1] || url;
    log(`  ${pass ? '✅' : '❌'} concurrent_consistency [${r1.status}==${r2.status}] ${name}`, pass ? 'PASS' : 'FAIL');
    out.push({ name, status1: r1.status, status2: r2.status, pass });
  }
  return out;
}

// ── LAYER 7: Full Frontend UI Screenshots ─────────────────────────
async function layer7_frontendUI(browser) {
  log('━━━ LAYER 7: Frontend UI Navigation & Screenshots ━━━', 'SECTION');

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: { 'ngrok-skip-browser-warning': 'true' }
  });
  const page = await ctx.newPage();

  const pages = [
    { url: `${LOCAL_FE}`,                     name: '01_homepage',            label: 'FASHIONISTAR Homepage' },
    { url: `${LOCAL_FE}/login`,               name: '02_login',               label: 'Auth — Login Page' },
    { url: `${LOCAL_FE}/register`,            name: '03_register',            label: 'Auth — Register Page' },
    { url: `${LOCAL_FE}/vendor/register`,     name: '04_vendor_register',     label: 'Vendor — Registration' },
    { url: `${LOCAL_FE}/vendor`,              name: '05_vendor_dashboard',    label: 'Vendor — Dashboard Home' },
    { url: `${LOCAL_FE}/vendor/products`,     name: '06_vendor_products',     label: 'Vendor — Products Catalog' },
    { url: `${LOCAL_FE}/vendor/orders`,       name: '07_vendor_orders',       label: 'Vendor — Orders' },
    { url: `${LOCAL_FE}/vendor/analytics`,    name: '08_vendor_analytics',    label: 'Vendor — Analytics & Charts' },
    { url: `${LOCAL_FE}/vendor/wallet`,       name: '09_vendor_wallet',       label: 'Vendor — Wallet Balance' },
    { url: `${LOCAL_FE}/vendor/payouts`,      name: '10_vendor_payouts',      label: 'Vendor — Payouts & Bank' },
    { url: `${LOCAL_FE}/vendor/kyc`,          name: '11_vendor_kyc',          label: 'Vendor — KYC Verification' },
    { url: `${LOCAL_FE}/vendor/catalog`,      name: '12_vendor_catalog',      label: 'Vendor — Catalog Collections' },
    { url: `${LOCAL_FE}/vendor/customers`,    name: '13_vendor_customers',    label: 'Vendor — Customers' },
    { url: `${LOCAL_FE}/vendor/reviews`,      name: '14_vendor_reviews',      label: 'Vendor — Reviews' },
    { url: `${LOCAL_FE}/vendor/settings`,     name: '15_vendor_settings',     label: 'Vendor — Settings' },
    { url: `${LOCAL_FE}/vendor/transactions`, name: '16_vendor_transactions', label: 'Vendor — Transactions' },
    { url: `${LOCAL_FE}/vendor/payments`,     name: '17_vendor_payments',     label: 'Vendor — Payments' },
    { url: `${LOCAL_BE}/swagger/`,            name: '18_swagger_ui',          label: 'Backend — Swagger UI' },
    { url: `${LOCAL_BE}/api/v1/ninja/docs`,   name: '19_ninja_docs',          label: 'Backend — Ninja API Docs' },
  ];

  // Also try the ngrok frontend URL
  const ngrokPages = [
    { url: `${FRONTEND_NGROK}`,              name: '20_ngrok_homepage',   label: 'Frontend via ngrok tunnel' },
    { url: `${FRONTEND_NGROK}/vendor`,       name: '21_ngrok_vendor',     label: 'Vendor Dashboard via ngrok' },
    { url: `${BACKEND_NGROK}/swagger/`,      name: '22_ngrok_swagger',    label: 'Backend Swagger via ngrok' },
  ];

  const uiResults = [];
  for (const p of [...pages, ...ngrokPages]) {
    try {
      await page.goto(p.url, { timeout: 30000, waitUntil: 'domcontentloaded' });
      await w(page, 2500);
      await shot(page, p.name, p.label);
      const finalUrl = page.url();
      log(`  ✅ ${p.label} | ${finalUrl}`, 'PASS');
      uiResults.push({ ...p, finalUrl, pass: true });
    } catch(e) {
      log(`  ❌ ${p.label}: ${e.message.substring(0, 80)}`, 'FAIL');
      uiResults.push({ ...p, error: e.message.substring(0, 80), pass: false });
    }
  }

  // Login flow with UI form interaction
  log('  Testing login form interaction...');
  try {
    await page.goto(`${LOCAL_FE}/login`, { timeout: 25000, waitUntil: 'networkidle' });
    await w(page, 1500);
    const emailIn = page.locator('input[type="email"], input[name="email"]').first();
    const passIn  = page.locator('input[type="password"]').first();
    if (await emailIn.isVisible({ timeout: 5000 })) {
      await emailIn.fill(VENDOR_EMAIL || 'vendor@fashionistar.test');
      await passIn.fill('VendorE2E@2026!');
      await shot(page, '23_login_form_filled', 'Login Form with Credentials Filled');
      const btn = page.locator('button[type="submit"]').first();
      if (await btn.isVisible()) {
        await btn.click();
        await w(page, 4000);
        await shot(page, '24_post_login_redirect', 'Post-Login Redirect / Dashboard');
        log(`  ✅ Login form submitted → ${page.url()}`, 'PASS');
      }
    }
  } catch(e) {
    log(`  ⚠️  Login form interaction: ${e.message.substring(0, 80)}`, 'WARN');
  }

  await ctx.close();
  return uiResults;
}

// ── Main Orchestrator ──────────────────────────────────────────────
async function main() {
  const startTime = Date.now();
  log('🚀 FASHIONISTAR Fullstack E2E Test Suite — 26th May 2026', 'START');
  log(`   📡 Backend  local:  ${LOCAL_BE}`);
  log(`   📡 Backend  ngrok:  ${BACKEND_NGROK}`);
  log(`   🌐 Frontend local:  ${LOCAL_FE}`);
  log(`   🌐 Frontend ngrok:  ${FRONTEND_NGROK}`);
  ensureDir(SHOTS_DIR);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox']
  });

  try {
    const L1 = await layer1_healthAndPublic(browser);
    const L2 = await layer2_vendorAuth(browser);
    const L3 = await layer3_vendorAPIAuth(browser);
    const L4 = await layer4_authDenials(browser);
    const L5 = await layer5_validation(browser);
    const L6 = await layer6_idempotency(browser);
    const L7 = await layer7_frontendUI(browser);

    const allAPI = [...L1, ...L3, ...L4, ...L5, ...L6];
    const passed = allAPI.filter(r => r.pass).length;
    const failed = allAPI.filter(r => !r.pass).length;
    const uiPassed = L7.filter(r => r.pass).length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    log('━━━ ✅ FINAL SUMMARY ━━━', 'SUMMARY');
    log(`  Backend API Tests:     ${allAPI.length}  (${passed} PASS / ${failed} FAIL)`);
    log(`  UI Page Screenshots:   ${L7.length}  (${uiPassed} loaded)`);
    log(`  Vendor JWT:            ${VENDOR_TOKEN ? '✅ Obtained' : '❌ Not obtained'}`);
    log(`  Vendor Email:          ${VENDOR_EMAIL || 'N/A'}`);
    log(`  Duration:              ${duration}s`);
    log(`  Screenshots saved to:  fashionista_frontend/test-evidence/screenshots/`);

    ensureDir(join(__dirname, 'test-evidence'));
    writeFileSync(join(__dirname, 'test-evidence', 'results.json'), JSON.stringify({
      timestamp: new Date().toISOString(),
      duration_seconds: parseFloat(duration),
      ngrok: { backend: BACKEND_NGROK, frontend: FRONTEND_NGROK },
      local: { backend: LOCAL_BE, frontend: LOCAL_FE },
      vendor_auth: { email: VENDOR_EMAIL, token_obtained: !!VENDOR_TOKEN },
      summary: { api_tests: allAPI.length, api_passed: passed, api_failed: failed, ui_pages: L7.length, ui_passed: uiPassed },
      layers: { L1, L2, L3, L4, L5, L6, L7 }
    }, null, 2));

    log('📄 Results saved to test-evidence/results.json', 'DONE');
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
