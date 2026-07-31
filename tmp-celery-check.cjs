const { execSync } = require('child_process');
try {
  const output = execSync('uv run celery -A backend inspect active 2>&1', {
    cwd: 'c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\fashionistar_backend',
    env: { ...process.env, UV_LINK_MODE: 'copy' },
    encoding: 'utf8',
    timeout: 15000,
  });
  const lines = output.split('\n').filter(l => !l.includes('[DEBUG') && !l.includes('[INFO') && !l.includes('EventBus') && !l.includes('Provider') && !l.includes('Catalog') && !l.includes('signal'));
  console.log(lines.join('\n'));
} catch (e) {
  const output = (e.stdout || '') + (e.stderr || '');
  const lines = output.split('\n').filter(l => !l.includes('[DEBUG') && !l.includes('[INFO') && !l.includes('EventBus') && !l.includes('Provider') && !l.includes('Catalog') && !l.includes('signal'));
  console.log(lines.join('\n'));
}
