const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { procesarMultiplesPDFs } = require('./procesar_factura');

function createWindow() {
  const isDev = !app.isPackaged;

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: path.join(__dirname, 'assets', 'FactuMate.icns'),
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

// Solo selección múltiple de PDFs
ipcMain.handle('seleccionar-pdfs', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  return result.filePaths;
});

// Procesar múltiples PDFs
ipcMain.handle('procesar-multiples-pdf', async (event, pdfPaths) => {
  const outputPath = await procesarMultiplesPDFs(pdfPaths);
  return outputPath;
});
