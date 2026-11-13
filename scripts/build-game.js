// Setzt game/schichtwerk.html aus den Modulen in src/ zusammen (Reihenfolge: src/manifest.json).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const teile = JSON.parse(fs.readFileSync(path.join(root, 'src', 'manifest.json'), 'utf8'));
const html = teile.map((t) => fs.readFileSync(path.join(root, 'src', t), 'utf8')).join('');
fs.mkdirSync(path.join(root, 'game'), { recursive: true });
fs.writeFileSync(path.join(root, 'game', 'schichtwerk.html'), html);
console.log(`game/schichtwerk.html aus ${teile.length} Modulen gebaut (${(html.length / 1e6).toFixed(2)} MB)`);
