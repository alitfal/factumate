const fs = require('fs');
const pdf = require('pdf-parse');
const XLSX = require('xlsx');
const path = require('path');

function extractValue(text, key, endChar = '\n') {
  const start = text.indexOf(key);
  if (start === -1) return '';
  const valueStart = start + key.length;
  const valueEnd = text.indexOf(endChar, valueStart);
  return text.substring(valueStart, valueEnd !== -1 ? valueEnd : undefined).trim();
}

async function procesarPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  const text = data.text;

  const datos = {
    "Factura Fiscal": extractValue(text, "Factura n°: "),
    "Fecha Factura": extractValue(text, "Fecha Factura: "),
    "Fec Desde": extractValue(text, "Periodo facturación: ").substring(0, 10),
    "Fec Hasta": extractValue(text, "Periodo facturación: ").slice(-10),
    "Cups Ext": extractValue(text, "CUPS: "),
    "Impor Final": extractValue(text, "Total Factura ", '€'),
    "Financ. Bono Social": extractValue(text, "Financiación Bono Social", '€')
  };

  const templatePath = path.join(__dirname, 'plantilla.xlsx');
  const workbook = XLSX.readFile(templatePath);
  const sheet = workbook.Sheets['0003'];

  const map = {
    "Fech Emision": "A3",
    "Factura Fiscal": "B3",
    "Cups Ext": "C3",
    "Impor Final": "D3",
    "Fec Desde": "E3",
    "Fec Hasta": "F3",
    "Financ. Bono Social": "G3"
  };

  for (const [campo, celda] of Object.entries(map)) {
    sheet[celda] = { t: 's', v: datos[campo] || '' };
  }

  const outputPath = path.join(__dirname, 'factura_actualizada.xlsx');
  XLSX.writeFile(workbook, outputPath);
  return outputPath;
}

module.exports = { procesarPDF };
