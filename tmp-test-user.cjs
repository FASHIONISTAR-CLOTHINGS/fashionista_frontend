(async () => {
  // Login
  const r1 = await fetch('http://127.0.0.1:8001/api/v1/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_or_phone: 'email-reset.1779305773712.a8cot8@playwright.fashionistar.io', password: '@Deoxy4oxide' }),
  });
  const d1 = await r1.json();
  const p = d1.data || d1;
  const token = p.access;
  console.log('User from login:', JSON.stringify(p.user || {}, null, 2).substring(0, 500));

  // Try DRF auth/me endpoint
  const r2 = await fetch('http://127.0.0.1:8001/api/v1/auth/me/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('DRF auth/me:', r2.status);
  const d2 = await r2.text();
  console.log('DRF auth/me resp:', d2.substring(0, 300));

  // Try DRF client profile
  const r3 = await fetch('http://127.0.0.1:8001/api/v1/client/profile/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('DRF client profile:', r3.status);
  const d3 = await r3.text();
  console.log('DRF client profile resp:', d3.substring(0, 300));
})();
