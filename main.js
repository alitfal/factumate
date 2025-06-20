const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { procesarPDF } = require('./procesar_factura');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

ipcMain.handle('seleccionar-pdf', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  return result.filePaths[0];
});

ipcMain.handle('procesar-pdf', async (event, pdfPath) => {
  const outputPath = await procesarPDF(pdfPath);
  return outputPath;
});
