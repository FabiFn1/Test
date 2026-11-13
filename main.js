const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Bildrate nicht auf 60 begrenzen: Das Spiel regelt sie selbst (Einstellungen > Grafik > Bildrate begrenzen)
app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');

/* ---- Spielstände als Dateien (Ordner wird von Steam Cloud abgeglichen) ---- */
const ordner = () => path.join(app.getPath('userData'), 'Spielstaende');
const gueltig = (k) => typeof k === 'string' && /^schichtwerk[a-z0-9-]*$/.test(k);
const datei = (k) => path.join(ordner(), k + '.json');

ipcMain.on('ablage:alle', (ev) => {
  const r = {};
  try {
    fs.mkdirSync(ordner(), { recursive: true });
    for (const f of fs.readdirSync(ordner())) {
      if (!f.endsWith('.json')) continue;
      const k = f.slice(0, -5);
      if (gueltig(k)) r[k] = fs.readFileSync(path.join(ordner(), f), 'utf8');
    }
  } catch (e) {
    console.error('Spielstände konnten nicht gelesen werden', e);
  }
  ev.returnValue = r;
});
// Erst in eine Nebendatei schreiben, dann umbenennen: Ein Absturz mitten im Schreiben zerstört keinen Stand.
const warteschlange = new Map();
function schreiben(k, v) {
  const vorher = warteschlange.get(k) || Promise.resolve();
  const p = vorher
    .then(async () => {
      await fs.promises.mkdir(ordner(), { recursive: true });
      const tmp = datei(k) + '.tmp';
      await fs.promises.writeFile(tmp, v, 'utf8');
      await fs.promises.rename(tmp, datei(k));
    })
    .catch((e) => console.error('Speichern fehlgeschlagen', k, e));
  warteschlange.set(k, p);
}
ipcMain.on('ablage:schreiben', (_ev, k, v) => { if (gueltig(k) && typeof v === 'string') schreiben(k, v); });
ipcMain.on('ablage:loeschen', (_ev, k) => {
  if (!gueltig(k)) return;
  const vorher = warteschlange.get(k) || Promise.resolve();
  warteschlange.set(k, vorher.then(() => fs.promises.rm(datei(k), { force: true })).catch(() => {}));
});

/* ---- Steam: nur aktiv, wenn das Spiel über Steam läuft (steam_appid.txt oder Start durch Steam) ---- */
let steam = null;
function steamStarten() {
  const idDatei = path.join(path.dirname(app.getPath('exe')), 'steam_appid.txt');
  const id = process.env.SteamAppId || (fs.existsSync(idDatei) ? fs.readFileSync(idDatei, 'utf8').trim() : '');
  if (!/^\d+$/.test(id)) return;
  try {
    const sw = require('steamworks.js');
    steam = sw.init(Number(id));
    sw.electronEnableSteamOverlay();
  } catch (e) {
    console.error('Steam nicht verfügbar', e.message);
    steam = null;
  }
}
ipcMain.on('steam:aktiv', (ev) => { ev.returnValue = !!steam; });
ipcMain.on('steam:erfolg', (_ev, id) => {
  if (!steam || typeof id !== 'string') return;
  try {
    const name = 'ERF_' + id.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    if (!steam.achievement.isActivated(name)) steam.achievement.activate(name);
  } catch (e) {
    console.error('Steam-Erfolg fehlgeschlagen', id, e.message);
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    title: 'Schichtwerk',
    backgroundColor: '#1d2a30',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, 'preload.js') },
  });
  Menu.setApplicationMenu(null);
  win.maximize();
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  // F11 = Vollbild, F12 = Entwicklerwerkzeuge
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.key === 'F12') { win.webContents.toggleDevTools(); e.preventDefault(); }
  });
}

app.whenReady().then(() => { steamStarten(); createWindow(); });
// Offene Schreibvorgänge abwarten, bevor das Programm endet
let beendet = false;
app.on('before-quit', (e) => {
  if (beendet) return;
  e.preventDefault();
  beendet = true;
  Promise.allSettled([...warteschlange.values()]).then(() => app.quit());
});
app.on('window-all-closed', () => app.quit());
