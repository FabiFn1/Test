/**
 * Verwaltet die Belegung eines InstancedMesh, das jedes Bild neu gefüllt wird
 * (Material auf Bändern, Rohrinhalt, Figuren). Ein Zeichenaufruf je Puffer,
 * egal wie viele Teile unterwegs sind.
 */
export interface InstanzNetz {
  count: number;
  setMatrixAt(i: number, m: unknown): void;
  setColorAt?(i: number, c: unknown): void;
  instanceMatrix: { needsUpdate: boolean };
  instanceColor?: { needsUpdate: boolean } | null;
}

export class InstanzPuffer<N extends InstanzNetz = InstanzNetz> {
  /** Zahl der in diesem Bild gesetzten Instanzen */
  n = 0;
  /** Instanzen, die in diesem Bild nicht mehr hineingepasst haben */
  verworfen = 0;

  constructor(readonly netz: N, readonly platz: number) {}

  beginne(): void {
    this.n = 0;
    this.verworfen = 0;
  }

  /** Setzt die nächste Instanz. Gibt false zurück, wenn der Puffer voll ist. */
  setze(matrix: unknown, farbe?: unknown): boolean {
    if (this.n >= this.platz) {
      this.verworfen++;
      return false;
    }
    this.netz.setMatrixAt(this.n, matrix);
    if (farbe !== undefined && this.netz.setColorAt) this.netz.setColorAt(this.n, farbe);
    this.n++;
    return true;
  }

  /** Überträgt die Belegung an die Grafikkarte. */
  abschliessen(): void {
    this.netz.count = this.n;
    this.netz.instanceMatrix.needsUpdate = true;
    if (this.netz.instanceColor) this.netz.instanceColor.needsUpdate = true;
  }
}
