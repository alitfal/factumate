const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  seleccionarPDFs: () => ipcRenderer.invoke('seleccionar-pdfs'),
  procesarMultiplesPDF: (paths) => ipcRenderer.invoke('procesar-multiples-pdf', paths)
});
