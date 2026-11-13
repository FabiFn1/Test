// Setzt game/schichtwerk.html zusammen: Kern (build/kern.js, von Vite gebaut) + Module in src/ (Reihenfolge: src/manifest.json).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function bauen() {
  const kernPfad = path.join(root, 'build', 'kern.js');
  if (!fs.existsSync(kernPfad)) throw new Error('build/kern.js fehlt – bitte „npm run build“ ausführen.');
  const kern = fs.readFileSync(kernPfad, 'utf8').trim();
  if (kern.includes('</script')) throw new Error('Kern enthält </script');
  const teile = JSON.parse(fs.readFileSync(path.join(root, 'src', 'manifest.json'), 'utf8'));
  const html = teile
    .map((t) => (t === '@kern' ? `<script>${kern}</script>\n` : fs.readFileSync(path.join(root, 'src', t), 'utf8')))
    .join('');
  fs.mkdirSync(path.join(root, 'game'), { recursive: true });
  fs.writeFileSync(path.join(root, 'game', 'schichtwerk.html'), html);
  console.log(`game/schichtwerk.html aus ${teile.length} Teilen gebaut (${(html.length / 1e6).toFixed(2)} MB)`);
}

module.exports = { bauen };
if (require.main === module) bauen();
