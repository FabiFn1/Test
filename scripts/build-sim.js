// Baut build/sim.js: die Simulation ohne Grafik und Oberfläche, für den Simulations-Thread (Web Worker) und für Tests in Node.
// Quelle sind dieselben Module wie für die Spieldatei (Reihenfolge: src/manifest.json):
//  - Dateien in src/sim/ kommen ganz hinein, außer Blöcken zwischen //@anzeige und //@/anzeige
//  - aus allen anderen Dateien nur Blöcke zwischen //@sim und //@/sim
// Davor steht src/sim/00-simvorspann.js (Ersatz für Oberfläche und Grafik), davor der Kern (build/kern.js).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');

function bloecke(text, start, ende) {
  const raus = [];
  let drin = false;
  for (const zeile of text.split('\n')) {
    const t = zeile.trim();
    if (t === start) { if (drin) throw new Error('Verschachteltes ' + start); drin = true; continue; }
    if (t === ende) { if (!drin) throw new Error(ende + ' ohne Anfang'); drin = false; continue; }
    raus.push({ drin, zeile });
  }
  if (drin) throw new Error(start + ' ohne Ende');
  return raus;
}

function bauen() {
  const teile = JSON.parse(fs.readFileSync(path.join(root, 'src', 'manifest.json'), 'utf8'));
  const kern = fs.readFileSync(path.join(root, 'build', 'kern.js'), 'utf8');
  let code = kern + '\n' + fs.readFileSync(path.join(root, 'src', 'sim', '00-simvorspann.js'), 'utf8') + '\n';
  for (const t of teile) {
    if (!t.endsWith('.js')) continue;
    const text = fs.readFileSync(path.join(root, 'src', t), 'utf8');
    if (t.startsWith('sim/')) {
      code += `/* --- ${t} --- */\n` + bloecke(text, '//@anzeige', '//@/anzeige').filter((z) => !z.drin).map((z) => z.zeile).join('\n') + '\n';
    } else {
      const l = bloecke(text, '//@sim', '//@/sim').filter((z) => z.drin).map((z) => z.zeile);
      if (l.length) code += `/* --- ${t} (Simulationsteil) --- */\n` + l.join('\n') + '\n';
    }
  }
  new vm.Script(code, { filename: 'sim.js' });
  fs.writeFileSync(path.join(root, 'build', 'sim.js'), code);
  console.log(`build/sim.js gebaut (${(code.length / 1e3).toFixed(0)} kB)`);
  return code;
}

module.exports = { bauen };
if (require.main === module) bauen();
