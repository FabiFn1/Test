import { defineConfig } from 'vite';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/** Setzt nach dem Bau des Kerns die Spieldatei zusammen und beobachtet die übrigen Module. */
function spieldatei() {
  return {
    name: 'schichtwerk-spieldatei',
    buildStart() {
      const teile = JSON.parse(readFileSync(resolve(root, 'src/manifest.json'), 'utf8'));
      this.addWatchFile(resolve(root, 'src/manifest.json'));
      for (const t of teile) this.addWatchFile(resolve(root, 'src', t));
    },
    closeBundle() {
      require('./scripts/build-game.js').bauen();
    },
  };
}

export default defineConfig({
  build: {
    outDir: 'build',
    emptyOutDir: true,
    target: 'es2020',
    minify: 'esbuild',
    lib: { entry: resolve(root, 'src/kern/index.ts'), name: 'SW', formats: ['iife'], fileName: () => 'kern.js' },
  },
  plugins: [spieldatei()],
  test: { include: ['tests/**/*.test.ts'] },
});
