(async () => {
  try {
    const r1 = await fetch('http://127.0.0.1:8002/api/v1/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_or_phone: 'email-reset.1779305773712.a8cot8@playwright.fashionistar.io', password: '@Deoxy4oxide' }),
    });
    const d1 = await r1.json();
    const p = d1.data || d1;
    const token = p.access;
    console.log('Login OK');

    // Initiate scan
    const r2 = await fetch('http://127.0.0.1:8002/api/v1/measurements/scan/initiate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ device_type: 'web' }),
    });
    const d2 = await r2.json();
    const sid = d2.data?.session_id || d2.session_id;
    console.log('Scan initiated, session:', sid);

    // Generate synthetic landmarks (33 points)
    const landmarks = Array.from({ length: 33 }, (_, i) => ({
      x: 0.5 + (i % 11) * 0.01,
      y: 0.1 + Math.floor(i / 11) * 0.3,
      z: -0.1 + (i % 5) * 0.02,
      visibility: 0.9,
    }));

    // Submit landmarks
    const r3 = await fetch(`http://127.0.0.1:8002/api/v1/measurements/scan/${sid}/submit-landmarks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        user_height_cm: 175.5,
        user_age: 28,
        front_landmarks: landmarks,
        device_type: 'web',
      }),
    });
    const d3 = await r3.json();
    console.log('Landmarks submitted:', d3.success, d3.data?.status);

    // Poll for 60 seconds
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const r4 = await fetch(`http://127.0.0.1:8002/api/v1/ninja/measurements/scan/${sid}/status/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d4 = await r4.json();
      console.log(`Poll ${i + 1}: status=${d4.status}`, d4.error_message ? `error=${d4.error_message}` : '');
      if (d4.status === 'completed' || d4.status === 'failed') {
        console.log('Final result:', JSON.stringify(d4).substring(0, 500));
        break;
      }
    }
  } catch (e) {
    console.error('ERR:', e.message);
  }
})();
