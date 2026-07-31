const { execSync } = require('child_process');
try {
  const output = execSync('uv run python manage.py showmigrations kyc', {
    cwd: 'c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\fashionistar_backend',
    env: { ...process.env, UV_LINK_MODE: 'copy' },
    encoding: 'utf8',
    timeout: 30000,
  });
  console.log(output);
} catch (e) {
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
}
