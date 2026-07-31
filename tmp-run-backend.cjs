const { spawn } = require('child_process');
const http = require('http');

const backend = spawn('cmd', ['/c', 'cd /d c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\fashionistar_backend && set UV_LINK_MODE=copy&& uv run python -m uvicorn backend.asgi:application --host 0.0.0.0 --port 8002'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`[BACKEND] ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`[BACKEND ERR] ${data}`);
});

// Wait for backend to be ready
setTimeout(async () => {
  try {
    const r1 = await fetch('http://127.0.0.1:8002/api/v1/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_or_phone: 'email-reset.1779305773712.a8cot8@playwright.fashionistar.io', password: '@Deoxy4oxide' }),
    });
    const d1 = await r1.json();
    const p = d1.data || d1;
    const token = p.access;
    console.log('Login:', r1.status, 'token len:', token?.length);

    const r2 = await fetch('http://127.0.0.1:8002/api/v1/ninja/measurements/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Ninja measurements:', r2.status);
    const d2 = await r2.text();
    console.log('Ninja measurements resp:', d2.substring(0, 200));
  } catch (e) {
    console.error('Test error:', e.message);
  }
  
  setTimeout(() => {
    backend.kill();
    process.exit(0);
  }, 5000);
}, 20000);
