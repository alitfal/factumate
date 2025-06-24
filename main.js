const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { procesarPDF } = require('./procesar_factura');

function createWindow() {
  const isDev = !app.isPackaged;

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: path.join(__dirname, 'assets', 'FactuMate.icns'), // O .ico para Windows
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    const reactPort = process.env.REACT_PORT || 3000;
    win.loadURL(`http://localhost:${reactPort}`);
  } else {
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
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
