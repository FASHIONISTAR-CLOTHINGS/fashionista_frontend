(async () => {
  try {
    // Login
    const r1 = await fetch('http://127.0.0.1:8001/api/v1/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_or_phone: 'email-reset.1779305773712.a8cot8@playwright.fashionistar.io', password: '@Deoxy4oxide' }),
    });
    const d1 = await r1.json();
    const p = d1.data || d1;
    const token = p.access;
    console.log('Token:', token?.substring(0, 50));

    // Decode JWT payload
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('JWT payload:', JSON.stringify(payload, null, 2));

    // Test DRF measurements (sync)
    const r2 = await fetch('http://127.0.0.1:8001/api/v1/measurements/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('DRF measurements status:', r2.status);
    const d2 = await r2.text();
    console.log('DRF measurements resp:', d2.substring(0, 200));

  } catch (e) {
    console.error('ERR:', e.message);
  }
})();
