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

- `game/schichtwerk.html` – das Spiel (Quelle, wird auch als Claude-Artifact veröffentlicht)
- `app/index.html` – daraus erzeugte Offline-Version (`npm run prepare-assets`)
- `main.js` – Electron-Fenster
- `scripts/prepare-assets.js` – kopiert three.js und Schriften nach `app/vendor/`

## Android

Die Android-App wird mit Capacitor gebaut (Ordner `android/`). Bei jedem Push baut
GitHub Actions die Datei `Schichtwerk.apk`: Tab **Actions** → „Android-APK bauen“ →
Artifact `Schichtwerk-Android` herunterladen, entpacken und die APK auf dem Handy öffnen.
Dafür muss „Apps aus unbekannten Quellen installieren“ für den Browser bzw. Dateimanager erlaubt sein.

Selbst bauen (Android-SDK und Java 21 nötig): `npm run android:apk`.

Steuerung auf dem Handy: ein Finger bewegt die Karte bzw. baut, zwei Finger verschieben,
zoomen und drehen. Die Knöpfe rechts unten drehen Bauwerke, legen Werkzeuge ab usw.
