const { execSync } = require('child_process');
try {
  // Add is_deleted column to kyc_kycsubmission table
  const sql = `
    ALTER TABLE kyc_kycsubmission ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false NOT NULL;
    ALTER TABLE kyc_kycsubmission ADD COLUMN IF NOT EXISTS deleted_at timestamp NULL;
  `;
  const output = execSync(`uv run python manage.py shell -c "import django;django.db.connection.cursor().execute('''${sql.replace(/'/g, "\\'")}''')"`, {
    cwd: 'c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\fashionistar_backend',
    env: { ...process.env, UV_LINK_MODE: 'copy' },
    encoding: 'utf8',
    timeout: 30000,
  });
  console.log('SQL executed:', output.substring(0, 500));
} catch (e) {
  console.log('STDOUT:', (e.stdout || '').substring(0, 500));
  console.log('STDERR:', (e.stderr || '').substring(0, 500));
}
