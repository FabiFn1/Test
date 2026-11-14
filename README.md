# Schichtwerk

Fabrik-Aufbauspiel in 3D (HTML + three.js), als Windows-Programm verpackt mit Electron.

## Die .exe bekommen

**Automatisch:** Bei jedem Push baut GitHub Actions die Datei `Schichtwerk.exe`.
Im Tab **Actions** → letzten Lauf von „Windows-EXE bauen“ öffnen → unten unter
**Artifacts** `Schichtwerk-Windows` herunterladen und entpacken.

**Selbst bauen** (Node.js 20+ nötig):

```bash
npm install
npm run dist        # erzeugt dist/Schichtwerk.exe
```

Zum Testen ohne Bauen: `npm run prepare-assets && npm start`.

## Hinweise

- `Schichtwerk.exe` ist eine portable Version. Sie muss nicht installiert werden, ein Doppelklick reicht.
- Die .exe ist nicht signiert. Windows SmartScreen zeigt deshalb beim ersten Start
  eine Warnung an: „Weitere Informationen“ → „Trotzdem ausführen“.
- Das Spiel läuft komplett offline, three.js und die Schriften sind eingebaut.
- F11 schaltet den Vollbildmodus um.
- Der Spielstand wird automatisch gespeichert (localStorage der App).

## Aufbau

Vite baut den Kern (`src/kern`, TypeScript) und setzt danach die Spieldatei aus den Modulen in `src/` zusammen (Reihenfolge: `src/manifest.json`).

- `src/kern/` – Kern ohne Grafik, im Spiel als `SW` verfügbar: Simulationstakt (`Simulationsschleife`, `Bildtakt`), Spielstand, Ablage, Ereignis-Bus, Instanz-Puffer
- `src/sim/` – Simulation: Daten, Karte, Zustand, Betrieb, Züge, Mitarbeiter, Träger
- `src/render/` – 3D: Szene, Gebäudemodelle, Gelände-Kacheln, Wasser, Wetter, Figuren, Werksgelände
- `src/ui/` – Oberfläche: Bedienung, Leitwarte, Menüs, Maschinenfenster, Blaupausen, Produktionshallen
- `src/save/` – Spielstände, Karten, Schwierigkeit, Schau-Fabrik
- `src/core/` – Vorspann, Hauptschleife, Start
- `src/assets/` – eingebettete Modelle und Texturen
- `tests/` – Tests für den Kern (Vitest)
- `game/schichtwerk.html` – erzeugt mit `npm run build` (wird auch als Claude-Artifact veröffentlicht)
- `app/index.html` – Offline-Version für Electron und Android (`npm run prepare-assets`)
- `main.js`, `preload.js` – Electron-Fenster, Spielstände als Dateien, Steam-Anbindung

Befehle: `npm run build` (Spieldatei), `npm run dev` (baut bei jeder Änderung neu), `npm test`, `npm run typecheck`, `npm start` (Desktop-Fassung), `npm run dist` (Windows-Paket).

Neue Module hängen sich über den Ereignis-Bus ein, statt Funktionen zu überschreiben: `EV.an('schritt', h => …)` (jeder Simulationsschritt), `'bild'` (jedes Bild), `'liste'` (Bauwerke geändert), `'gebaeude'` (Gebäudemodelle neu aufgebaut), `'erfolg'`.

## Steam

- Spielstände liegen in der Desktop-Fassung als Dateien unter `%APPDATA%/Schichtwerk/Spielstaende`. Für Steam Cloud diesen Ordner in Steamworks als Auto-Cloud-Pfad eintragen (`*.json`).
- Steam wird nur gestartet, wenn neben der .exe eine `steam_appid.txt` mit der App-ID liegt oder das Spiel über Steam läuft. Erfolge werden dann als `ERF_<KENNUNG>` gemeldet; die Kennungen stehen in `src/ui/28-erfolge.js`.
