import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

// Die Simulation (build/sim.js) muss ohne Fenster, Grafik und Oberfläche laufen: Grundlage für den Simulations-Thread.
let ctx: vm.Context;
// Jeder Aufruf in einer eigenen Funktion, damit sich Variablen der Testfälle nicht in die Quere kommen
const run = <T = unknown>(code: string): T => vm.runInContext(`(()=>{${code}})()`, ctx) as T;

beforeAll(() => {
  ctx = vm.createContext({ console, performance, Math, Date, JSON, Object, Array, Map, Set, WeakMap, Uint8Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, Int8Array, setTimeout, clearTimeout });
  (ctx as { globalThis: unknown }).globalThis = ctx;
  vm.runInContext(readFileSync(resolve(__dirname, '../build/sim.js'), 'utf8'), ctx, { filename: 'sim.js' });
});

describe('Simulation ohne Grafik', () => {
  it('legt ein neues Spiel an und liefert Eisenplatten in die Zentrale', () => {
    const r = run<{ n: number; vor: number; nach: number; schritte: number }>(
      `fresh();const vor=G.total.eisenplatte||0;for(let i=0;i<60*60;i++)simTakt(1/60);return {n:E.size,vor,nach:G.total.eisenplatte||0,schritte:SIM.schritte}`,
    );
    expect(r.n).toBe(9);
    expect(r.schritte).toBeGreaterThanOrEqual(1799);
    expect(r.nach).toBeGreaterThan(r.vor + 10);
  });

  it('baut, reißt ab und bezahlt dabei', () => {
    const r = run<{ gebaut: boolean; nachBau: number; nachAbriss: number; vorher: number }>(
      `G.stock.eisenplatte=100;const vorher=G.stock.eisenplatte;const z=byKind.zentrale[0];const x=z.x-6,y=z.y+10;const gebaut=place('band',x,y,0,true);const nachBau=G.stock.eisenplatte;remove(at(x,y));return {gebaut,nachBau,nachAbriss:G.stock.eisenplatte,vorher}`,
    );
    expect(r.gebaut).toBe(true);
    expect(r.nachBau).toBe(r.vorher - 1);
    expect(r.nachAbriss).toBe(r.vorher);
  });

  it('gibt den Spielstand heraus und übernimmt ihn wieder', () => {
    const r = run<{ vorher: number; nachher: number; stock: number; stockVorher: number }>(
      `const d=JSON.parse(JSON.stringify(standDaten()));const vorher=E.size,stockVorher=G.stock.eisenplatte;fresh();standAnwenden(d);return {vorher,nachher:E.size,stock:G.stock.eisenplatte,stockVorher}`,
    );
    expect(r.nachher).toBe(r.vorher);
    expect(r.stock).toBe(r.stockVorher);
  });
});
