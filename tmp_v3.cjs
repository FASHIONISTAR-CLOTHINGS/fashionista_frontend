const fs = require('fs');
const f = 'c:/Users/FASHIONISTAR/OneDrive/Documenti/FASHIONISTAR_ANTIGRAVITY/fashionista_frontend/src/app/(home)/_components/TrendingProductsRail.tsx';
const c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');
const out = [];
for (let i = 174; i < Math.min(182, lines.length); i++) {
  const line = lines[i];
  if (line.includes('View All')) {
    out.push('Line ' + (i+1) + ': ' + JSON.stringify(line));
    const idx = line.indexOf('View All');
    const sub = line.substring(idx);
    out.push('Codes: ' + [...sub].map(ch => ch.charCodeAt(0)).join(','));
  }
}
fs.writeFileSync('tmp_out.txt', out.join('\n'));
