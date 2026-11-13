/** Kern von Schichtwerk: Module ohne Bezug zu DOM-Aufbau und Three.js-Szene. Im Spiel als `SW` verfügbar. */
import { Ereignisse } from './ereignisse';
import { ablageWaehlen, type NativBruecke } from './speicher';

export { Ereignisse } from './ereignisse';
export { Simulationsschleife, Bildtakt } from './simulationsschleife';
export { InstanzPuffer } from './instanzen';
export { DateiAblage, ablageWaehlen } from './speicher';
export * from './spielstand';

const nativ: NativBruecke | undefined = (globalThis as { swNativ?: NativBruecke }).swNativ;

/** Brücke zur Desktop-Fassung (Dateien, Steam); im Browser nicht vorhanden */
export const desktop = nativ;
/** Ablage für Spielstände und Einstellungen */
export const speicher = ablageWaehlen(nativ);
/** Gemeinsamer Ereignis-Bus des Spiels */
export const ereignisse = new Ereignisse();
