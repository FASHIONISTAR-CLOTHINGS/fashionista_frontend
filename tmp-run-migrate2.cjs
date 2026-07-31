const { execSync } = require('child_process');
try {
  const output = execSync('uv run python manage.py migrate --noinput --skip-checks', {
    cwd: 'c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\fashionistar_backend',
    env: { ...process.env, UV_LINK_MODE: 'copy' },
    encoding: 'utf8',
    timeout: 120000,
  });
  console.log('Migrate output:', output.substring(0, 2000));
} catch (e) {
  console.log('Migrate STDOUT:', e.stdout?.substring(0, 2000));
  console.log('Migrate STDERR:', e.stderr?.substring(0, 2000));
}
