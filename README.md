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

- `app/index.html` – das Spiel
- `main.js` – Electron-Fenster
- `scripts/prepare-assets.js` – kopiert three.js und Schriften nach `app/vendor/`
