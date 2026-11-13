import { describe, it, expect } from 'vitest';
import { Ereignisse } from '../src/kern/ereignisse';
import { Simulationsschleife, Bildtakt } from '../src/kern/simulationsschleife';
import { InstanzPuffer } from '../src/kern/instanzen';
import { DateiAblage } from '../src/kern/speicher';
import { neuerSpielstand, istVeraltet, platzInfo, platzVon, platzSchluessel, SPIELSTAND_VERSION } from '../src/kern/spielstand';

describe('Simulationsschleife', () => {
  it('rechnet unabhängig von der Bildrate gleich viele Schritte', () => {
    const zaehle = (fps: number) => {
      let n = 0;
      const s = new Simulationsschleife({ hz: 30, maxSchritte: 8, schritt: () => n++ });
      for (let i = 0; i < fps * 10; i++) s.vor(1 / fps);
      return n;
    };
    for (const fps of [30, 60, 144, 240]) expect(Math.abs(zaehle(fps) - 300)).toBeLessThanOrEqual(1);
  });
  it('verwirft Rückstand nach einem Hänger', () => {
    let n = 0;
    const s = new Simulationsschleife({ hz: 30, maxSchritte: 8, schritt: () => n++ });
    expect(s.vor(5)).toBe(8);
    expect(s.rest).toBe(0);
  });
  it('alpha liegt zwischen 0 und 1', () => {
    const s = new Simulationsschleife({ hz: 30, maxSchritte: 8, schritt: () => {} });
    s.vor(1 / 60);
    expect(s.alpha).toBeCloseTo(0.5, 5);
  });
});

describe('Bildtakt', () => {
  it('begrenzt auf die gewünschte Bildrate', () => {
    const t = new Bildtakt();
    let n = 0;
    for (let ms = 0; ms < 1000; ms += 1000 / 240) if (t.faellig(ms, 60)) n++;
    expect(n).toBeGreaterThanOrEqual(58);
    expect(n).toBeLessThanOrEqual(62);
  });
  it('lässt ohne Grenze jedes Bild durch', () => {
    const t = new Bildtakt();
    expect(t.faellig(0, 0) && t.faellig(1, 0)).toBe(true);
  });
});

describe('Ereignisse', () => {
  it('ruft Hörer nach Rang auf und meldet ab', () => {
    const e = new Ereignisse();
    const r: string[] = [];
    const ab = e.an('x', () => r.push('b'), 2);
    e.an('x', () => r.push('a'), 1);
    e.melde('x');
    ab();
    e.melde('x');
    expect(r).toEqual(['a', 'b', 'a']);
  });
  it('ein fehlerhafter Hörer hält die anderen nicht auf', () => {
    const e = new Ereignisse();
    let ok = false;
    const alt = console.error;
    console.error = () => {};
    e.an('x', () => { throw new Error('kaputt'); });
    e.an('x', () => { ok = true; });
    e.melde('x');
    console.error = alt;
    expect(ok).toBe(true);
  });
});

describe('InstanzPuffer', () => {
  it('zählt Instanzen und verwirft Überlauf', () => {
    const netz = { count: 0, gesetzt: [] as number[], setMatrixAt(i: number) { this.gesetzt.push(i); }, instanceMatrix: { needsUpdate: false } };
    const p = new InstanzPuffer(netz, 2);
    p.beginne();
    expect([p.setze(0), p.setze(0), p.setze(0)]).toEqual([true, true, false]);
    p.abschliessen();
    expect(netz.count).toBe(2);
    expect(p.verworfen).toBe(1);
    expect(netz.instanceMatrix.needsUpdate).toBe(true);
  });
});

describe('Spielstand', () => {
  it('legt einen neuen Stand mit Optionen an, ohne das Startlager zu verändern', () => {
    const start = { eisenplatte: 30 };
    const g = neuerSpielstand(start, { schw: 'schwer', seed: 7 });
    g.stock.eisenplatte = 0;
    expect(start.eisenplatte).toBe(30);
    expect(g.v).toBe(SPIELSTAND_VERSION);
    expect(g.schw).toBe('schwer');
    expect(platzInfo(g, 5)).toEqual({ ms: 0, t: 0, schw: 'schwer', frei: undefined, seed: 7, d: 5 });
  });
  it('erkennt veraltete Stände und Platznummern', () => {
    expect(istVeraltet({ v: 4 })).toBe(true);
    expect(istVeraltet({ v: SPIELSTAND_VERSION })).toBe(false);
    expect(platzVon(platzSchluessel(3))).toBe(3);
  });
});

describe('DateiAblage', () => {
  it('übernimmt beim ersten Start die Stände aus der alten Ablage und schreibt Dateien', () => {
    const dateien: Record<string, string> = {};
    const nativ = { alleLesen: () => ({ ...dateien }), schreiben: (k: string, v: string) => { dateien[k] = v; }, loeschen: (k: string) => { delete dateien[k]; } };
    const alt = { a: ['schichtwerk-1', 'fremd'], length: 2, key(i: number) { return this.a[i]; }, getItem: (k: string) => 'inhalt-' + k, setItem() {}, removeItem() {} };
    const s = new DateiAblage(nativ, alt);
    expect(s.getItem('schichtwerk-1')).toBe('inhalt-schichtwerk-1');
    expect(s.getItem('fremd')).toBe(null);
    s.setItem('schichtwerk-2', 'x');
    s.removeItem('schichtwerk-1');
    expect(dateien).toEqual({ 'schichtwerk-2': 'x' });
  });
});
