/**
 * Verwaltet die Belegung eines InstancedMesh, das jedes Bild neu gefüllt wird
 * (Material auf Bändern, Rohrinhalt, Figuren). Ein Zeichenaufruf je Puffer,
 * egal wie viele Teile unterwegs sind.
 */
export interface InstanzNetz {
  count: number;
  setMatrixAt(i: number, m: unknown): void;
  setColorAt?(i: number, c: unknown): void;
  instanceMatrix: { needsUpdate: boolean; array?: ArrayLike<number> & { [i: number]: number } };
  instanceColor?: { needsUpdate: boolean; array?: ArrayLike<number> & { [i: number]: number } } | null;
}

export interface Farbe {
  r: number;
  g: number;
  b: number;
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

  /**
   * Setzt die nächste Instanz nur mit Position und gleichmäßiger Größe, ohne Drehung.
   * Schreibt direkt in die Puffer, ohne Matrix-Objekt: bei zehntausenden Teilen je Bild deutlich schneller.
   */
  setzeDirekt(x: number, y: number, z: number, groesse: number, farbe?: Farbe): boolean {
    const m = this.netz.instanceMatrix.array;
    if (!m) throw new Error('Netz ohne instanceMatrix.array');
    if (this.n >= this.platz) {
      this.verworfen++;
      return false;
    }
    const o = this.n * 16;
    m[o] = groesse; m[o + 1] = 0; m[o + 2] = 0; m[o + 3] = 0;
    m[o + 4] = 0; m[o + 5] = groesse; m[o + 6] = 0; m[o + 7] = 0;
    m[o + 8] = 0; m[o + 9] = 0; m[o + 10] = groesse; m[o + 11] = 0;
    m[o + 12] = x; m[o + 13] = y; m[o + 14] = z; m[o + 15] = 1;
    const f = this.netz.instanceColor?.array;
    if (farbe && f) {
      const q = this.n * 3;
      f[q] = farbe.r; f[q + 1] = farbe.g; f[q + 2] = farbe.b;
    }
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
