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
    console.log('Login OK, token len:', token?.length);

    // Test measurements list (Ninja async)
    const r2 = await fetch('http://127.0.0.1:8001/api/v1/ninja/measurements/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Ninja measurements status:', r2.status);
    const d2 = await r2.text();
    console.log('Ninja measurements resp:', d2.substring(0, 300));

    // Scan initiate
    const r3 = await fetch('http://127.0.0.1:8001/api/v1/measurements/scan/initiate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ device_type: 'web' }),
    });
    const d3 = await r3.json();
    const sid = d3.session_id || d3.data?.session_id;
    console.log('Scan initiate status:', r3.status, 'session_id:', sid);

    // Test scan status at correct URL
    const r4 = await fetch(`http://127.0.0.1:8001/api/v1/ninja/measurements/scan/${sid}/status/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Scan status (measurements path):', r4.status);
    const d4 = await r4.text();
    console.log('Scan status resp:', d4.substring(0, 300));

    // Also test old URL
    const r5 = await fetch(`http://127.0.0.1:8001/api/v1/ninja/ai/scan/${sid}/status/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Scan status (ai path):', r5.status);

  } catch (e) {
    console.error('ERR:', e.message);
  }
})();
