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

    // Test scan initiate (DRF sync endpoint)
    const r2 = await fetch('http://127.0.0.1:8001/api/v1/measurements/scan/initiate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ device_type: 'web' }),
    });
    console.log('Scan initiate status:', r2.status);
    const d2 = await r2.json();
    console.log('Scan initiate resp:', JSON.stringify(d2).substring(0, 300));

    if (d2.session_id || d2.data?.session_id) {
      const sid = d2.session_id || d2.data?.session_id;
      // Test scan status (Ninja async endpoint)
      const r3 = await fetch(`http://127.0.0.1:8001/api/v1/ninja/ai/scan/${sid}/status/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Scan status:', r3.status);
      const d3 = await r3.json();
      console.log('Scan status resp:', JSON.stringify(d3).substring(0, 200));
    }

    // Test client profile endpoint
    const r4 = await fetch('http://127.0.0.1:8001/api/v1/ninja/client-profile/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Client profile status:', r4.status);
    const d4 = await r4.json();
    console.log('Client profile resp:', JSON.stringify(d4).substring(0, 200));
  } catch (e) {
    console.error('ERR:', e.message);
  }
})();
