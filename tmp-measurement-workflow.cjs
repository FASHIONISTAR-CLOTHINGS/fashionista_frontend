const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://127.0.0.1:8001';
const EVIDENCE_DIR = path.join(__dirname, 'test-evidence', 'e2e');

const EMAIL = 'email-reset.1779305773712.a8cot8@playwright.fashionistar.io';
const PASSWORD = '@Deoxy4oxide';

function log(...args) {
  console.log('[E2E]', ...args);
}

async function apiPost(url, body, token = null) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`API POST ${url} failed ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function apiGet(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`API GET ${url} failed ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function login() {
  log('Logging in via API...');
  const data = await apiPost(`${API_URL}/api/v1/auth/login/`, { email_or_phone: EMAIL, password: PASSWORD });
  const payload = data.data ?? data;
  log('Login success, user_id:', payload.user_id);
  return payload;
}

function makeLandmarks() {
  const lm = Array.from({ length: 33 }, (_, i) => ({ x: 0, y: 0, z: 1, visibility: 1 }));
  const set = (i, x, y, z = 1, vis = 1) => { lm[i] = { x, y, z, visibility: vis }; };

  set(0, 0.00, 1.75);
  set(1, -0.04, 1.78);
  set(2, -0.06, 1.78);
  set(3, -0.08, 1.78);
  set(4, 0.04, 1.78);
  set(5, 0.06, 1.78);
  set(6, 0.08, 1.78);
  set(7, -0.10, 1.74);
  set(8, 0.10, 1.74);
  set(9, -0.03, 1.72);
  set(10, 0.03, 1.72);
  set(11, -0.25, 1.45);
  set(12, 0.25, 1.45);
  set(13, -0.50, 1.20);
  set(14, 0.50, 1.20);
  set(15, -0.75, 0.95);
  set(16, 0.75, 0.95);
  set(17, -0.78, 0.92);
  set(18, 0.78, 0.92);
  set(19, -0.76, 0.94);
  set(20, 0.76, 0.94);
  set(21, -0.74, 0.96);
  set(22, 0.74, 0.96);
  set(23, -0.12, 0.95);
  set(24, 0.12, 0.95);
  set(25, -0.12, 0.55);
  set(26, 0.12, 0.55);
  set(27, -0.12, 0.05);
  set(28, 0.12, 0.05);
  set(29, -0.12, 0.00);
  set(30, 0.12, 0.00);
  set(31, -0.12, -0.05);
  set(32, 0.12, -0.05);

  return lm;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function screenshot(page, name) {
  try {
    const fp = path.join(EVIDENCE_DIR, `${name}.png`);
    await page.screenshot({ path: fp, fullPage: true, timeout: 10000 });
    log('Screenshot:', fp);
  } catch (e) {
    log('Screenshot failed for', name, ':', e.message);
  }
}

(async () => {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

  const loginPayload = await login();
  const accessToken = loginPayload.access;
  const refreshToken = loginPayload.refresh;
  const user = {
    id: loginPayload.user_id,
    email: loginPayload.identifying_info?.includes('@') ? loginPayload.identifying_info : undefined,
    first_name: 'Test',
    last_name: 'Client',
    role: loginPayload.role || 'client',
    is_verified: true,
    is_staff: false,
    has_client_profile: loginPayload.has_client_profile ?? true,
    has_vendor_profile: loginPayload.has_vendor_profile ?? false,
    client_profile: null,
    vendor_profile: null,
    avatar: null,
    date_joined: new Date().toISOString(),
  };

  log('Launching Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: EVIDENCE_DIR, size: { width: 1280, height: 720 } },
  });

  await context.addInitScript(({ token, refresh, userData }) => {
    const envelope = {
      state: {
        accessToken: token,
        refreshToken: refresh,
        user: userData,
        isAuthenticated: true,
      },
    };
    window.sessionStorage.setItem('fashionistar-auth', JSON.stringify(envelope));
  }, { token: accessToken, refresh: refreshToken, userData: user });

  const page = await context.newPage();

  try {
    // 1. Visit Get Measured marketing page
    log('Navigating to /get-measured');
    await page.goto(`${BASE_URL}/get-measured`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(5000);

    // Remove preloader overlay immediately (load event may not fire in headless)
    await page.evaluate(() => {
      const pre = document.getElementById('fs-preloader');
      if (pre) pre.remove();
    });
    await sleep(1000);

    await screenshot(page, '01-get-measured');

    // 2. Open modal and fill entry form
    const cta = page.locator('#get-measured-cta, #get-measured-inline-cta').first();
    await cta.waitFor({ state: 'visible', timeout: 10000 });
    await cta.click();
    log('CTA clicked, waiting for modal...');
    await sleep(1500);

    // Fill age input (placeholder contains "e.g. 28")
    const ageInput = page.locator('input[type=number][placeholder*="28"]').first();
    await ageInput.waitFor({ state: 'visible', timeout: 10000 });
    await ageInput.fill('28');
    log('Age filled, waiting for height prediction...');
    await sleep(1000);
    await screenshot(page, '02-measurement-modal');

    // Submit button has text "Continue to Scan"
    const submitBtn = page.getByText('Continue to Scan', { exact: false }).first();
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
    await submitBtn.click();
    log('Submit clicked, waiting for redirect to scan entry...');

    // 3. Wait for QR gateway (ScanEntryClient auto-initiates and redirects to QR page)
    await page.waitForURL('**/scan/qr**', { timeout: 30000 });
    await sleep(2000);
    const qrUrl = page.url();
    log('QR gateway URL:', qrUrl);
    await screenshot(page, '03-qr-gateway');

    const qrParams = new URLSearchParams(new URL(qrUrl).search);
    const sessionId = qrParams.get('session_id');
    const measurementUrl = qrParams.get('murl');
    if (!sessionId) throw new Error('session_id missing from QR URL');
    log('Session ID:', sessionId);
    log('Measurement URL:', measurementUrl);

    // Verify QR image visible
    const qrImg = page.locator('#qr-code-image');
    await qrImg.waitFor({ state: 'visible', timeout: 8000 });
    const qrSrc = await qrImg.getAttribute('src');
    if (!qrSrc || !qrSrc.startsWith('data:image/png;base64,')) {
      throw new Error('QR code image not rendered as base64 data URI');
    }
    log('QR code image rendered (base64 length', qrSrc.length, ')');

    // 4. Submit landmarks via API to simulate mobile scan
    log('Submitting landmarks for session', sessionId);
    const frontLandmarks = makeLandmarks();
    const submitRes = await apiPost(
      `${API_URL}/api/v1/measurements/scan/${sessionId}/submit-landmarks/`,
      {
        user_height_cm: 175,
        user_weight_kg: 70,
        user_age: 28,
        device_type: 'web',
        front_landmarks: frontLandmarks,
        landmarks: frontLandmarks,
      },
      accessToken,
    );
    log('Landmark submission response:', submitRes);

    // 5. Poll status until completed/failed
    let statusData;
    for (let i = 0; i < 45; i++) {
      await sleep(2000);
      const poll = await apiGet(`${API_URL}/api/v1/ninja/ai/scan/${sessionId}/status/`, accessToken);
      statusData = poll.data ?? poll;
      log(`Poll ${i + 1}: status=${statusData.status}`);
      if (statusData.status === 'completed' || statusData.status === 'failed') break;
    }
    if (!statusData) throw new Error('No status data after polling');
    if (statusData.status !== 'completed') {
      throw new Error(`Scan did not complete: ${JSON.stringify(statusData)}`);
    }
    log('Scan completed, profile_id:', statusData.measurement_profile_id);
    log('Measurements:', JSON.stringify(statusData.extracted_measurements || statusData.measurements_cm));

    // 6. Verify saved profile via API
    const profilesRes = await apiGet(`${API_URL}/api/v1/ninja/measurements/`, accessToken);
    const profiles = profilesRes.data || [];
    if (!profiles.length) throw new Error('No measurement profiles returned');
    log('Profiles count:', profiles.length);
    const latest = profiles[0];
    log('Latest profile id:', latest.id);

    // 7. Navigate to dashboard measurements page
    log('Navigating to /client/dashboard/measurements');
    await page.goto(`${BASE_URL}/client/dashboard/measurements`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);
    await screenshot(page, '04-dashboard-measurements');

    // 8. Navigate to measurement details page
    if (latest.id) {
      log('Navigating to /client/dashboard/measurements/' + latest.id);
      await page.goto(`${BASE_URL}/client/dashboard/measurements/${latest.id}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(3000);
      await screenshot(page, '05-measurement-details');
    }

    log('E2E measurement workflow PASSED');
  } catch (err) {
    log('ERROR:', err.message);
    await screenshot(page, '99-error');
    process.exitCode = 1;
  } finally {
    await context.close();
    await browser.close();
  }
})();
