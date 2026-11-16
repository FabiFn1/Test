// Bettet die in Blender gebauten Modelle (blender/ausgabe/*.json und *_farbe.jpg, *_orm.jpg) als src/assets/16-blender-modelle.js ein.
// Aufruf nach den Blender-Skripten (blender/*.py): node scripts/modelle-einbetten.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const ein = path.join(root, 'blender', 'ausgabe');
const daten = {};
for (const f of fs.readdirSync(ein).filter((f) => f.endsWith('.json')).sort()) {
  const m = JSON.parse(fs.readFileSync(path.join(ein, f), 'utf8'));
  const bild = (n) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ein, `${m.name}_${n}.jpg`)).toString('base64');
  daten[m.name] = { teile: m.teile.map(({ p, n, u, i, m: mat, spin, piv }) => ({ p, n, u, i, m: mat, ...(spin ? { spin, piv } : {}) })), punkte: m.punkte || {}, farbe: bild('farbe'), orm: bild('orm') };
}
const js = '/* ====== In Blender gebaute Modelle (erzeugt von scripts/modelle-einbetten.js, nicht von Hand ändern) ====== */\nconst BLENDER=' + JSON.stringify(daten) + ';\n';
fs.writeFileSync(path.join(root, 'src', 'assets', '16-blender-modelle.js'), js);
console.log(`${Object.keys(daten).length} Modelle eingebettet (${(js.length / 1e6).toFixed(2)} MB): ${Object.keys(daten).join(', ')}`);
