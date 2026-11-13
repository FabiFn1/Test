/**
 * Ablage für Spielstände und Einstellungen.
 * Im Browser: localStorage. In der Desktop-Fassung: Dateien im Ordner „Spielstaende“
 * (über die Brücke `window.swNativ`), damit Steam Cloud sie abgleichen kann.
 * Die Schnittstelle ist synchron wie localStorage.
 */
export interface Ablage {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

export interface NativBruecke {
  /** Alle gespeicherten Dateien als { Schlüssel: Inhalt } */
  alleLesen(): Record<string, string>;
  schreiben(k: string, v: string): void;
  loeschen(k: string): void;
  erfolg?(id: string): void;
  steam?: boolean;
}

const PRAEFIX = 'schichtwerk';

class BrowserAblage implements Ablage {
  getItem(k: string) {
    try { return localStorage.getItem(k); } catch { return null; }
  }
  setItem(k: string, v: string) {
    localStorage.setItem(k, v);
  }
  removeItem(k: string) {
    try { localStorage.removeItem(k); } catch { /* Ablage gesperrt */ }
  }
}

/** Hält alles im Speicher und schreibt Änderungen in Dateien. */
export class DateiAblage implements Ablage {
  private daten: Map<string, string>;

  constructor(private nativ: NativBruecke, alt?: Ablage & { length?: number; key?(i: number): string | null }) {
    this.daten = new Map(Object.entries(nativ.alleLesen()));
    // Erster Start nach dem Umstieg: vorhandene Stände aus localStorage übernehmen
    if (this.daten.size === 0 && alt && typeof alt.key === 'function') {
      for (let i = 0; i < (alt.length ?? 0); i++) {
        const k = alt.key(i);
        if (!k || !k.startsWith(PRAEFIX)) continue;
        const v = alt.getItem(k);
        if (v !== null) this.setItem(k, v);
      }
    }
  }
  getItem(k: string) {
    return this.daten.has(k) ? this.daten.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.daten.set(k, v);
    this.nativ.schreiben(k, v);
  }
  removeItem(k: string) {
    if (this.daten.delete(k)) this.nativ.loeschen(k);
  }
}

export function ablageWaehlen(nativ: NativBruecke | undefined): Ablage {
  if (nativ) {
    try {
      return new DateiAblage(nativ, typeof localStorage !== 'undefined' ? localStorage : undefined);
    } catch (e) {
      console.error('Dateiablage nicht verfügbar, nutze localStorage', e);
    }
  }
  return new BrowserAblage();
}
