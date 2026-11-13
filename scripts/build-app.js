// Erzeugt app/index.html (Offline-Version für Electron und Android) aus game/schichtwerk.html.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
require('./build-game.js');
let s = fs.readFileSync(path.join(root, 'game', 'schichtwerk.html'), 'utf8');
const swap = (from, to) => { if (!s.includes(from)) throw new Error('Nicht gefunden: ' + from); s = s.replace(from, to); };
swap('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap', 'vendor/fonts.css');
swap('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js', 'vendor/three.min.js');
const head = '<!doctype html><html lang="de"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">' +
  '<style>:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;padding:0;font:14px sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>' +
  '</head><body>\n';
fs.mkdirSync(path.join(root, 'app'), { recursive: true });
fs.writeFileSync(path.join(root, 'app', 'index.html'), head + s + '\n</body></html>\n');
console.log('app/index.html erzeugt');
