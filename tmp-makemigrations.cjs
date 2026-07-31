const { execSync } = require('child_process');
try {
  const output = execSync('uv run python manage.py makemigrations kyc client --noinput --skip-checks 2>&1', {
    cwd: 'c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\fashionistar_backend',
    env: { ...process.env, UV_LINK_MODE: 'copy' },
    encoding: 'utf8',
    timeout: 60000,
  });
  console.log('MakeMigrations output:', output.substring(0, 2000));
} catch (e) {
  console.log('MakeMigrations output:', (e.stdout || '').substring(0, 2000));
  console.log('STDERR:', (e.stderr || '').substring(0, 500));
}
