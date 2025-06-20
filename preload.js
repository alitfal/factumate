const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  seleccionarPDF: () => ipcRenderer.invoke('seleccionar-pdf'),
  procesarPDF: (path) => ipcRenderer.invoke('procesar-pdf', path)
});
