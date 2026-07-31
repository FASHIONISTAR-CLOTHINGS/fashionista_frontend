(async () => {
  try {
    const r1 = await fetch('http://127.0.0.1:8001/api/v1/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_or_phone: 'email-reset.1779305773712.a8cot8@playwright.fashionistar.io', password: '@Deoxy4oxide' }),
    });
    const d1 = await r1.json();
    const p = d1.data || d1;
    console.log('access len:', p.access?.length || 0);
    console.log('refresh:', p.refresh?.substring(0, 30) || 'none');

    const r2 = await fetch('http://127.0.0.1:8001/api/v1/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: p.refresh }),
    });
    console.log('refresh status:', r2.status);
    const d2 = await r2.json();
    console.log('refresh resp:', JSON.stringify(d2).substring(0, 200));

    // Also test a protected endpoint with the access token
    const r3 = await fetch('http://127.0.0.1:8001/api/v1/ninja/measurements/', {
      headers: { Authorization: `Bearer ${p.access}` },
    });
    console.log('measurements status:', r3.status);
    const d3 = await r3.json();
    console.log('measurements resp:', JSON.stringify(d3).substring(0, 200));
  } catch (e) {
    console.error('ERR:', e.message);
  }
})();
