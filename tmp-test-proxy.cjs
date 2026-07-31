(async () => {
  // Login via the Next.js proxy to get a token that works through the proxy
  const r1 = await fetch('http://127.0.0.1:3000/api/v1/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_or_phone: 'email-reset.1779305773712.a8cot8@playwright.fashionistar.io', password: '@Deoxy4oxide' }),
  });
  console.log('Proxy login status:', r1.status);
  const d1 = await r1.json();
  const p = d1.data || d1;
  const token = p.access;
  console.log('Proxy token len:', token?.length);

  if (!token) {
    console.log('No token, full response:', JSON.stringify(d1).substring(0, 300));
    return;
  }

  // Test Ninja measurements through proxy
  const r2 = await fetch('http://127.0.0.1:3000/api/v1/ninja/measurements/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Proxy Ninja measurements:', r2.status);
  const d2 = await r2.text();
  console.log('Proxy Ninja measurements resp:', d2.substring(0, 300));

  // Test scan initiate through proxy
  const r3 = await fetch('http://127.0.0.1:3000/api/v1/measurements/scan/initiate/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ device_type: 'web' }),
  });
  console.log('Proxy scan initiate:', r3.status);
  const d3 = await r3.json();
  console.log('Proxy scan initiate resp:', JSON.stringify(d3).substring(0, 300));

})();
