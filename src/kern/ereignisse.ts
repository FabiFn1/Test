/** Ereignis-Bus: Module melden Ereignisse, andere hängen sich an – ohne fremde Funktionen zu überschreiben. */
export type Hoerer<A extends unknown[] = unknown[]> = (...args: A) => void;

export class Ereignisse {
  private liste = new Map<string, { fn: Hoerer<any>; rang: number }[]>();

  /** Hängt einen Hörer an. Kleinere Ränge laufen zuerst. Gibt eine Funktion zum Abmelden zurück. */
  an<A extends unknown[]>(name: string, fn: Hoerer<A>, rang = 0): () => void {
    const l = this.liste.get(name) ?? [];
    l.push({ fn, rang });
    l.sort((a, b) => a.rang - b.rang);
    this.liste.set(name, l);
    return () => this.aus(name, fn);
  }

  aus(name: string, fn: Hoerer<any>): void {
    const l = this.liste.get(name);
    if (!l) return;
    const i = l.findIndex((h) => h.fn === fn);
    if (i >= 0) l.splice(i, 1);
  }

  /** Ruft alle Hörer auf. Ein Fehler in einem Hörer hält die anderen nicht auf. */
  melde(name: string, ...args: unknown[]): void {
    const l = this.liste.get(name);
    if (!l) return;
    for (const h of l.slice()) {
      try {
        h.fn(...args);
      } catch (e) {
        console.error(`Fehler im Hörer für „${name}“`, e);
      }
    }
  }

  anzahl(name: string): number {
    return this.liste.get(name)?.length ?? 0;
  }
}
