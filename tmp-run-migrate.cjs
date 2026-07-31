const { execSync } = require('child_process');
try {
  const output = execSync('uv run python manage.py migrate kyc --noinput', {
    cwd: 'c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\fashionistar_backend',
    env: { ...process.env, UV_LINK_MODE: 'copy' },
    encoding: 'utf8',
    timeout: 60000,
  });
  console.log('KYC migrate output:', output);
} catch (e) {
  console.log('KYC migrate STDOUT:', e.stdout?.substring(0, 500));
  console.log('KYC migrate STDERR:', e.stderr?.substring(0, 500));
}

try {
  const output2 = execSync('uv run python manage.py migrate client --noinput', {
    cwd: 'c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\fashionistar_backend',
    env: { ...process.env, UV_LINK_MODE: 'copy' },
    encoding: 'utf8',
    timeout: 60000,
  });
  console.log('Client migrate output:', output2);
} catch (e) {
  console.log('Client migrate STDOUT:', e.stdout?.substring(0, 500));
  console.log('Client migrate STDERR:', e.stderr?.substring(0, 500));
}

try {
  const output3 = execSync('uv run python manage.py migrate --noinput', {
    cwd: 'c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\fashionistar_backend',
    env: { ...process.env, UV_LINK_MODE: 'copy' },
    encoding: 'utf8',
    timeout: 120000,
  });
  console.log('Full migrate output:', output3.substring(0, 1000));
} catch (e) {
  console.log('Full migrate STDOUT:', e.stdout?.substring(0, 1000));
  console.log('Full migrate STDERR:', e.stderr?.substring(0, 1000));
}
