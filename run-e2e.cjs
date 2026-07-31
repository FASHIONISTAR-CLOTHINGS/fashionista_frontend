// Wrapper to run E2E test with proper output
const { spawn } = require('child_process');
const path = require('path');

const child = spawn('node', ['tmp-measurement-workflow.cjs'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, FORCE_COLOR: '1' },
});

child.stdout?.on('data', (d) => process.stdout.write(d));
child.stderr?.on('data', (d) => process.stderr.write(d));

child.on('exit', (code) => {
  console.log(`\n[E2E Runner] Exit code: ${code}`);
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('[E2E Runner] Spawn error:', err.message);
  process.exit(1);
});
