// Archivo: procesar_factura.js (versión final: potencias por posición fija tras bloques fiables)
const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const PDFParser = require("pdf2json");

function extraerValor(texto, regex, campo, logStream) {
  const match = texto.match(regex);
  const valor = match
    ? match[1].replace(/\./g, "").replace(",", ".").trim()
    : null;
  if (logStream) {
    logStream.write(
      `CAMPO: ${campo}\nREGEX: ${regex}\nVALOR: ${
        valor || "(no encontrado)"
      }\n---\n`
    );
  }
  return valor;
}

function obtenerCupsInt(cups) {
  const match = cups.match(/[0-9]{14}/);
  return match ? `UZZ${match[0].slice(-10)}` : "";
}

function parseFecha(fechaStr) {
  const match = fechaStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return "";
  const [_, d, m, y] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function parseFechaLarga(fechaLarga) {
  const meses = {
    enero: "01",
    febrero: "02",
    marzo: "03",
    abril: "04",
    mayo: "05",
    junio: "06",
    julio: "07",
    agosto: "08",
    septiembre: "09",
    octubre: "10",
    noviembre: "11",
    diciembre: "12",
  };
  const match = fechaLarga.match(/(\d{1,2}) de ([a-z]+) de (\d{4})/i);
  if (!match) return "";
  const [_, d, m, y] = match;
  return `${y}-${meses[m.toLowerCase()] || "01"}-${d.padStart(2, "0")}`;
}

function extractPeriodBlocks(texto, logStream) {
  const lineas = texto.split(/\r?\n/);
  const bloques = [];
  let bloque = [];
  let capturando = false;

  for (const linea of lineas) {
    const lineaLimpia = linea.trim();
    if (/^Periodo \d$/.test(lineaLimpia)) {
      if (bloque.length > 0) bloques.push(bloque);
      bloque = [lineaLimpia];
      capturando = true;
    } else if (capturando) {
      bloque.push(lineaLimpia);
    }
  }
  if (bloque.length > 0) bloques.push(bloque);

  const periodos = bloques.map((bloque, idx) => {
    const numeros = bloque
      .map((l) => [...l.matchAll(/\d+(?:\.\d{3})*,\d{2,3}/g)].map((m) => m[0]))
      .flat();

    const EA = numeros[0] || "0";
    const ER = numeros[1] || "0";
    const PER = numeros[2] || "0";
    const PC = numeros[5] || "0";
    const PD = numeros[6] || "0";

    if (logStream) {
      logStream.write(
        `PERIODO ${
          idx + 1
        }: EA=${EA}, ER=${ER}, PER=${PER}, PotCont=${PC}, PotDem=${PD}\n`
      );
    }

    return {
      ea: EA.replace(/\./g, "").replace(",", "."),
      er: ER.replace(/\./g, "").replace(",", "."),
      per: PER.replace(/\./g, "").replace(",", "."),
      potCont: PC.replace(/\./g, "").replace(",", "."),
      potDem: PD.replace(/\./g, "").replace(",", "."),
    };
  });

  while (periodos.length < 6)
    periodos.push({ ea: "0", er: "0", per: "0", potCont: "0", potDem: "0" });
  return periodos;
}

async function generarDebugDesdePDF(pdfPath) {
  const pdfParser = new PDFParser();
  const json = await new Promise((resolve, reject) => {
    pdfParser.on("pdfParser_dataReady", resolve);
    pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
    pdfParser.loadPDF(pdfPath);
  });

  const texto = json.Pages.map((p) =>
    p.Texts.map((t) => decodeURIComponent(t.R[0].T)).join("\n")
  ).join("\n\n");
  const txtPath = path.join(
    app.getPath("userData"),
    "txt",
    "factura_debug_texto.txt"
  );
  fs.writeFileSync(txtPath, texto, "utf-8");
}

async function procesarPDF(pdfPath) {
  const logPath = path.join(
    app.getPath("userData"),
    "txt",
    "factumate_log.txt"
  );
  const txtPath = path.join(
    app.getPath("userData"),
    "txt",
    "factura_debug_texto.txt"
  );

  await generarDebugDesdePDF(pdfPath);

  const logStream = fs.createWriteStream(logPath, { flags: "w" });
  logStream.write(`--- Procesando desde .txt: ${txtPath} ---\n`);

  const texto = fs.readFileSync(txtPath, "utf-8");

  const factura = extraerValor(
    texto,
    /Factura (?:n\u00ba|nº|n\u00b0|n°):\s*([A-Z0-9]+)/,
    "Factura Fiscal",
    logStream
  );
  const fechaEmision = parseFechaLarga(
    extraerValor(
      texto,
      /Fecha Factura:\s*([\w\s]+\d{4})/,
      "Fecha Emision",
      logStream
    )
  );
  const fecDesde = parseFecha(
    extraerValor(
      texto,
      /Periodo facturaci[oó]n:\s*\n*(\d{1,2}\/\d{1,2}\/\d{4})/,
      "Fec Desde",
      logStream
    )
  );
  const fecHasta = parseFecha(
    extraerValor(
      texto,
      /al\s*\n*(\d{1,2}\/\d{1,2}\/\d{4})/,
      "Fec Hasta",
      logStream
    )
  );
  const cupsExt = extraerValor(texto, /CUPS:\s*([A-Z0-9]+)/, "CUPS", logStream);
  const cupsInt = obtenerCupsInt(cupsExt || "");
  const imporFinal = parseFloat(
    extraerValor(
      texto,
      /Total Factura.*?([0-9.,]+)\s*€/i,
      "Importe Final",
      logStream
    ) || "0"
  );

  const periodos = extractPeriodBlocks(texto, logStream);
  const ea = periodos.map((p) => p.ea);
  const er = periodos.map((p) => p.er);
  const per = periodos.map((p) => p.per);
  const potCont = periodos.map((p) => p.potCont);
  const potDem = periodos.map((p) => p.potDem);

  const pea = [
    "0",
    extraerValor(
      texto,
      /P2:\s*[0-9.,]+\s*kWh\s*x\s*([0-9.,]+)\s*Eur\/kWh/i,
      "PEA P2",
      logStream
    ) || "0",
    extraerValor(
      texto,
      /P3:\s*[0-9.,]+\s*kWh\s*x\s*([0-9.,]+)\s*Eur\/kWh/i,
      "PEA P3",
      logStream
    ) || "0",
    "0",
    "0",
    extraerValor(
      texto,
      /P6:\s*[0-9.,]+\s*kWh\s*x\s*([0-9.,]+)\s*Eur\/kWh/i,
      "PEA P6",
      logStream
    ) || "0",
  ];

  const impReact =
    extraerValor(
      texto,
      /Fact\. Energ[ií]a Reactiva\s*\n([0-9.,]+)/i,
      "Tot Imp React",
      logStream
    ) || "0";
  const impTpot =
    extraerValor(
      texto,
      /Fact\. Potencia Contratada\s*\n([0-9.,]+)/i,
      "Tot Imp Tpot",
      logStream
    ) || "0";
  const impEnerg =
    extraerValor(
      texto,
      /T[eé]rmino de Energ[ií]a Variable\s*\n([0-9.,]+)/i,
      "Tot Imp Energ",
      logStream
    ) || "0";

  logStream.end();

  return [
    fechaEmision,
    factura,
    "",
    cupsExt,
    cupsInt,
    imporFinal,
    fecDesde,
    fecHasta,
    ...ea,
    ...pea,
    ...potCont,
    ...potDem,
    ...er,
    ...per,
    impReact,
    impTpot,
    impEnerg,
  ];
}

async function procesarMultiplesPDFs(pdfPaths) {
  const encabezados = [
    "Fech Emision",
    "Factura Fiscal",
    "Num Fact Agrupada",
    "Cups Ext",
    "Cups Int",
    "Impor Final",
    "Fec Desde",
    "Fec Hasta",
    "EA1",
    "EA2",
    "EA3",
    "EA4",
    "EA5",
    "EA6",
    "PEA1",
    "PEA2",
    "PEA3",
    "PEA4",
    "PEA5",
    "PEA6",
    "Pot Cont1",
    "Pot Cont2",
    "Pot Cont3",
    "Pot Cont4",
    "Pot Cont5",
    "Pot Cont6",
    "Pot Dem1",
    "Pot Dem2",
    "Pot Dem3",
    "Pot Dem4",
    "Pot Dem5",
    "Pot Dem6",
    "ER1",
    "ER2",
    "ER3",
    "ER4",
    "ER5",
    "ER6",
    "PER1",
    "PER2",
    "PER3",
    "PER4",
    "PER5",
    "PER6",
    "Tot Imp React",
    "Tot Imp Tpot",
    "Tot Imp Energ",
  ];

  const datos = [];
  for (const pdf of pdfPaths) {
    try {
      const fila = await procesarPDF(pdf);
      datos.push(fila);
    } catch (err) {
      console.error(`Error procesando PDF desde .txt:`, err);
    }
  }

  const hoja = XLSX.utils.aoa_to_sheet([encabezados, ...datos]);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Facturas");

  const salida = path.join(app.getPath("desktop"), "facturas_compiladas.xlsx");
  XLSX.writeFile(libro, salida);
  return salida;
}

module.exports = { procesarMultiplesPDFs };
