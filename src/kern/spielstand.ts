/** Spielstand: Grundwerte, Version, Speicherplätze. Ohne Bezug zur Grafik. */
export const SPIELSTAND_VERSION = 5;
export const PLAETZE = 3;

export type Schwierigkeit = 'leicht' | 'normal' | 'schwer';

/** Der Teil des Zustands, der im Spielstand liegt (Objekt `G` im Spiel). */
export interface Spielstand {
  /** Lager der Zentrale: Stoff → Menge */
  stock: Record<string, number>;
  /** Index des aktuellen Meilensteins */
  ms: number;
  /** Für den aktuellen Meilenstein geliefert */
  del: Record<string, number>;
  /** Insgesamt geliefert */
  total: Record<string, number>;
  speed: number;
  won: boolean;
  help: boolean;
  cam: unknown;
  /** Version des Spielstand-Formats */
  v: number;
  /** Abgetragene Geländefelder */
  carve: number[];
  rockets: number;
  /** Credits */
  cr: number;
  /** Angestellte Arbeiter */
  arb: number;
  /** Spielzeit in Sekunden */
  t?: number;
  seed?: number;
  schw?: Schwierigkeit;
  frei?: boolean;
  [weiteres: string]: unknown;
}

export function neuerSpielstand(startLager: Record<string, number>, optionen?: Partial<Spielstand> | null): Spielstand {
  return {
    stock: { ...startLager },
    ms: 0,
    del: {},
    total: {},
    speed: 1,
    won: false,
    help: false,
    cam: null,
    v: SPIELSTAND_VERSION,
    carve: [],
    rockets: 0,
    cr: 500,
    arb: 3,
    ...(optionen ?? {}),
  };
}

/** Zu alt, um ihn sicher umzuwandeln: Der Stand wird beiseitegelegt und ein neues Spiel begonnen. */
export function istVeraltet(g: Pick<Spielstand, 'v'> | null | undefined): boolean {
  return !g || (g.v ?? 0) < SPIELSTAND_VERSION;
}

export const platzSchluessel = (n: number) => `schichtwerk-${n}`;
export const metaSchluessel = (n: number) => `schichtwerk-meta-${n}`;
export const altSchluessel = (n: number) => `schichtwerk-alt-${n}`;
export const platzVon = (schluessel: string) => +schluessel.split('-')[1] || 1;

/** Kurzangaben für die Liste der Spielstände */
export interface PlatzInfo {
  ms: number;
  t: number;
  schw?: Schwierigkeit;
  frei?: boolean;
  seed: number;
  /** Zeitpunkt des Speicherns (ms seit 1970) */
  d?: number;
}

export function platzInfo(g: Spielstand, jetzt?: number): PlatzInfo {
  const m: PlatzInfo = { ms: g.ms, t: g.t ?? 0, schw: g.schw, frei: g.frei, seed: g.seed ?? 0 };
  if (jetzt !== undefined) m.d = jetzt;
  return m;
}
