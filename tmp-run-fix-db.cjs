const { execSync } = require('child_process');
try {
  const output = execSync('uv run python tmp_fix_db.py 2>&1', {
    cwd: 'c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\fashionistar_backend',
    env: { ...process.env, UV_LINK_MODE: 'copy' },
    encoding: 'utf8',
    timeout: 60000,
  });
  // Filter out debug lines
  const lines = output.split('\n').filter(l => !l.includes('[DEBUG') && !l.includes('[INFO') && !l.includes('EventBus') && !l.includes('Provider') && !l.includes('Catalog'));
  console.log(lines.join('\n'));
} catch (e) {
  const output = (e.stdout || '') + (e.stderr || '');
  const lines = output.split('\n').filter(l => !l.includes('[DEBUG') && !l.includes('[INFO') && !l.includes('EventBus') && !l.includes('Provider') && !l.includes('Catalog'));
  console.log(lines.join('\n'));
}
