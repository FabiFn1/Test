// Brücke zwischen Spiel und Desktop-Fassung: Spielstände als Dateien, Steam-Erfolge.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('swNativ', {
  alleLesen: () => ipcRenderer.sendSync('ablage:alle'),
  schreiben: (k, v) => ipcRenderer.send('ablage:schreiben', k, v),
  loeschen: (k) => ipcRenderer.send('ablage:loeschen', k),
  erfolg: (id) => ipcRenderer.send('steam:erfolg', id),
  steam: ipcRenderer.sendSync('steam:aktiv'),
});
