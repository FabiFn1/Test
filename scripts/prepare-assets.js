// Kopiert three.js und die Schriften aus node_modules nach app/vendor,
// damit das Spiel komplett offline läuft.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'app', 'vendor');
fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });
fs.copyFileSync(path.join(root, 'node_modules/three/build/three.min.js'), path.join(out, 'three.min.js'));
const fonts = [
  ['Barlow Condensed', 'barlow-condensed', [500, 600, 700]],
  ['IBM Plex Mono', 'ibm-plex-mono', [400, 600]],
];
let css = '';
for (const [family, pkg, weights] of fonts) {
  for (const w of weights) {
    for (const sub of ['latin', 'latin-ext']) {
      const file = `${pkg}-${sub}-${w}-normal.woff2`;
      fs.copyFileSync(path.join(root, 'node_modules/@fontsource', pkg, 'files', file), path.join(out, 'fonts', file));
      css += `@font-face{font-family:"${family}";font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/${file}) format("woff2")}\n`;
    }
  }
}
fs.writeFileSync(path.join(out, 'fonts.css'), css);
console.log('Assets bereit in', out);
