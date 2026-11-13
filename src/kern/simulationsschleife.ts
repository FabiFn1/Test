/**
 * Fester Simulationstakt, entkoppelt von der Bildrate.
 * Die Simulation rechnet immer in gleich langen Schritten; das Rendering fragt `alpha`
 * (Anteil des angebrochenen Schritts) ab und interpoliert damit Bewegungen.
 */
export interface SchleifenOptionen {
  /** Simulationsschritte pro Sekunde */
  hz: number;
  /** Obergrenze je Bild, damit ein Hänger keine Lawine auslöst */
  maxSchritte: number;
  /** Ein Simulationsschritt der Länge `h` Sekunden */
  schritt: (h: number) => void;
}

export class Simulationsschleife {
  readonly h: number;
  /** Noch nicht simulierte Zeit in Sekunden (immer kleiner als ein Schritt) */
  rest = 0;
  /** Gesamtzahl gerechneter Schritte */
  schritte = 0;
  private readonly max: number;
  private readonly schritt: (h: number) => void;

  constructor(o: SchleifenOptionen) {
    if (!(o.hz > 0)) throw new Error('hz muss größer als 0 sein');
    this.h = 1 / o.hz;
    this.max = Math.max(1, o.maxSchritte | 0);
    this.schritt = o.schritt;
  }

  /** Rechnet die vergangene Spielzeit nach. Gibt die Zahl der Schritte in diesem Bild zurück. */
  vor(dtSpiel: number): number {
    if (!(dtSpiel > 0)) return 0;
    this.rest += dtSpiel;
    let n = 0;
    while (this.rest >= this.h && n < this.max) {
      this.schritt(this.h);
      this.rest -= this.h;
      n++;
    }
    // Rückstand verwerfen statt aufholen: lieber kurz langsamer als dauerhaft ruckeln
    if (n === this.max && this.rest >= this.h) this.rest = 0;
    this.schritte += n;
    return n;
  }

  /** 0..1: wie weit der nächste Schritt schon „angebrochen“ ist */
  get alpha(): number {
    return Math.min(1, this.rest / this.h);
  }

  zuruecksetzen(): void {
    this.rest = 0;
  }
}

/** Begrenzt die Bildrate. `faellig` sagt, ob zu diesem Zeitpunkt ein Bild gezeichnet werden soll. */
export class Bildtakt {
  private letzt = -Infinity;
  bilder = 0;

  faellig(jetztMs: number, grenzeFps: number): boolean {
    // 1,2 ms Toleranz, damit 144 Hz auf einem 144-Hz-Bildschirm nicht jedes zweite Bild verliert
    if (grenzeFps > 0 && jetztMs - this.letzt < 1000 / grenzeFps - 1.2) return false;
    this.letzt = jetztMs;
    this.bilder++;
    return true;
  }
}
