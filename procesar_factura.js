const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const PDFParser = require("pdf2json");
const XLSX = require("xlsx");
const pathToSave = path.join(app.getPath("userData"), "txt");
if (!fs.existsSync(pathToSave)) {
  fs.mkdirSync(pathToSave, { recursive: true });
}

function logLinea(logStream, clave, linea, valor) {
  logStream.write(`CLAVE: ${clave}\n`);
  logStream.write(`LÍNEA: ${linea}\n`);
  logStream.write(`VALOR: ${valor}\n`);
  logStream.write(`---------------------------\n`);
}

function extraerValor(linea, regex) {
  const match = linea.match(regex);
  return match ? match[1].replace(",", ".").trim() : "";
}

async function procesarPDF(pdfPath) {
  const pdfParser = new PDFParser();

  const json = await new Promise((resolve, reject) => {
    pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
    pdfParser.on("pdfParser_dataReady", (pdfData) => resolve(pdfData));
    pdfParser.loadPDF(pdfPath);
  });

  const page = json.Pages[0];

  const textosOrdenados = page.Texts.map((t) => ({
    text: decodeURIComponent(t.R[0].T),
    x: t.x,
    y: t.y,
  })).sort((a, b) => a.y - b.y || a.x - b.x);

  let lineaActualY = null;
  let lineas = [];
  let bufferLinea = [];

  textosOrdenados.forEach((t) => {
    if (lineaActualY === null) {
      lineaActualY = t.y;
    }

    if (Math.abs(t.y - lineaActualY) > 0.5) {
      lineas.push(bufferLinea.join(" "));
      bufferLinea = [t.text];
      lineaActualY = t.y;
    } else {
      bufferLinea.push(t.text);
    }
  });

  if (bufferLinea.length) {
    lineas.push(bufferLinea.join(" "));
  }

  // Guardar texto plano para referencia
  const txtPath = path.join(pathToSave, "factura_debug_texto.txt");
  fs.writeFileSync(txtPath, lineas.join("\n"));

  // Preparar log
  const logPath = path.join(pathToSave, "factumate_log.txt");
  const logStream = fs.createWriteStream(logPath, { flags: "w" });

  const datos = {};

  // Factura nº
  const lineaFactura = lineas.find((l) => l.includes("Factura nº:")) || "";
  datos["Factura Fiscal"] = extraerValor(
    lineaFactura,
    /Factura (?:nº|n°):\s*([A-Z0-9]+)/i
  );
  logLinea(logStream, "Factura Fiscal", lineaFactura, datos["Factura Fiscal"]);

  // Fecha Factura
  const lineaFecha = lineas.find((l) => l.includes("Fecha Factura:")) || "";
  datos["Fecha Factura"] = extraerValor(
    lineaFecha,
    /Fecha Factura:\s*([0-9]{2} de [a-z]+ de [0-9]{4})/i
  );
  logLinea(logStream, "Fecha Factura", lineaFecha, datos["Fecha Factura"]);

  // Periodo facturación
  const lineaPeriodo =
    lineas.find((l) => l.includes("Periodo facturación:")) || "";
  const periodoMatch = lineaPeriodo.match(
    /Periodo facturación:\s*(?:del\s*)?([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s*al\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i
  );
  datos["Periodo Desde"] = periodoMatch ? periodoMatch[1] : "";
  datos["Periodo Hasta"] = periodoMatch ? periodoMatch[2] : "";
  logLinea(
    logStream,
    "Periodo facturación",
    lineaPeriodo,
    `${datos["Periodo Desde"]} al ${datos["Periodo Hasta"]}`
  );

  // CUPS
  const lineaCUPS = lineas.find((l) => l.includes("CUPS:")) || "";
  datos["Cups Ext"] = extraerValor(lineaCUPS, /CUPS:\s*([A-Z0-9]+)/i);
  logLinea(logStream, "CUPS", lineaCUPS, datos["Cups Ext"]);

  // Total Factura
  const lineaTotal = lineas.find((l) => l.includes("Total Factura")) || "";
  datos["Impor Final"] = extraerValor(
    lineaTotal,
    /Total Factura\s*([0-9.,]+)/i
  );
  logLinea(logStream, "Total Factura", lineaTotal, datos["Impor Final"]);

  // Financiación Bono Social
  const lineaBono =
    lineas.find((l) => l.includes("Financiación Bono Social")) || "";
  datos["Financ. Bono Social"] = extraerValor(
    lineaBono,
    /Financiación Bono Social.*?([0-9.,]+)$/i
  );
  logLinea(
    logStream,
    "Financiación Bono Social",
    lineaBono,
    datos["Financ. Bono Social"]
  );

  logStream.end();

  // Generar Excel dinámico
  const rows = [
    ["Clave", "Valor"],
    ["Factura Fiscal", datos["Factura Fiscal"]],
    ["Fecha Factura", datos["Fecha Factura"]],
    ["Periodo Desde", datos["Periodo Desde"]],
    ["Periodo Hasta", datos["Periodo Hasta"]],
    ["CUPS", datos["Cups Ext"]],
    ["Importe Final", datos["Impor Final"]],
    ["Financiación Bono Social", datos["Financ. Bono Social"]],
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Factura");

  const outputPath = path.join(
    app.getPath("desktop"),
    "factura_actualizada.xlsx"
  );
  XLSX.writeFile(workbook, outputPath);
  console.log(`Factura generada en: ${outputPath}`);
  console.log(`Texto debug generado en: ${txtPath}`);
  console.log(`Log generado en: ${logPath}`);

  return outputPath;
}

module.exports = { procesarPDF };
