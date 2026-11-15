// Setzt game/schichtwerk.html zusammen: Kern (build/kern.js, von Vite gebaut) + Module in src/ (Reihenfolge: src/manifest.json).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function simcode() {
  const p = path.join(root, 'build', 'sim.js');
  if (!fs.existsSync(p)) throw new Error('build/sim.js fehlt – bitte „npm run build“ ausführen.');
  return fs.readFileSync(p, 'utf8');
}

function bauen() {
  const kernPfad = path.join(root, 'build', 'kern.js');
  if (!fs.existsSync(kernPfad)) throw new Error('build/kern.js fehlt – bitte „npm run build“ ausführen.');
  const kern = fs.readFileSync(kernPfad, 'utf8').trim();
  if (kern.includes('</script')) throw new Error('Kern enthält </script');
  const teile = JSON.parse(fs.readFileSync(path.join(root, 'src', 'manifest.json'), 'utf8'));
  const html = teile
    .map((t) => {
      if (t === '@kern') return `<script>${kern}</script>\n`;
      // Simulationspaket für den Simulations-Thread, als Text eingebettet (der Hauptstrang startet daraus den Worker)
      if (t === '@simcode') return `<script type="text/plain" id="simcode">${simcode().replace(/<\/(script)/gi, '<\\/$1')}</script>\n`;
      return fs.readFileSync(path.join(root, 'src', t), 'utf8');
    })
    .join('');
  // Jeden Skriptblock auf Syntaxfehler prüfen, bevor die Datei geschrieben wird
  const vm = require('vm');
  for (const [, code] of html.matchAll(/<script(?: type="text\/plain" id="simcode")?>([\s\S]*?)<\/script>/g)) {
    try { new vm.Script(code, { filename: 'schichtwerk.html' }); } catch (e) { throw new Error('Syntaxfehler in der Spieldatei: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 3).join('\n')); }
  }
  fs.mkdirSync(path.join(root, 'game'), { recursive: true });
  fs.writeFileSync(path.join(root, 'game', 'schichtwerk.html'), html);
  console.log(`game/schichtwerk.html aus ${teile.length} Teilen gebaut (${(html.length / 1e6).toFixed(2)} MB)`);
}

module.exports = { bauen };
if (require.main === module) bauen();
