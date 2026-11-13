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

Der Quellcode liegt in `src/` und wird in der Reihenfolge aus `src/manifest.json` zu einer Datei zusammengesetzt.

- `src/sim/` – Simulation: Daten, Karte, Zustand, Betrieb, Züge, Mitarbeiter, Träger
- `src/render/` – 3D: Szene, Gebäudemodelle, Gelände-Kacheln, Wasser, Wetter, Figuren
- `src/ui/` – Oberfläche: Bedienung, Leitwarte, Menüs, Maschinenfenster, Blaupausen
- `src/save/` – Spielstände, Karten, Schwierigkeit
- `src/core/` – Vorspann, Hauptschleife, Start
- `src/assets/` – eingebettete Modelle und Texturen
- `game/schichtwerk.html` – erzeugt mit `npm run build:game` (wird auch als Claude-Artifact veröffentlicht)
- `app/index.html` – Offline-Version für Electron und Android (`npm run prepare-assets`)
- `main.js` – Electron-Fenster
