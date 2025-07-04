# 🧾 FactuMate

**FactuMate** es una aplicación de escritorio desarrollada con Electron + React + Material UI que permite extraer automáticamente los datos clave de facturas eléctricas en formato PDF y generar un Excel con todos los resultados consolidados.

---

## ✨ Funcionalidades principales

- ✅ Interfaz de usuario moderna con React + MUI (soporte para modo claro/oscuro)
- ✅ Selección de múltiples PDFs a la vez
- ✅ Extracción automática de campos clave desde el PDF:
  - Fechas, CUPS, importes, periodo
  - Datos por periodo (EA, ER, PER, Pot Cont, Pot Dem)
  - Importes: energía, potencia, reactiva
- ✅ Generación de un Excel con toda la información unificada
- ✅ Generación automática de logs y archivos `.txt` para debug
- ✅ Almacenamiento de los logs en la carpeta `userData/txt`
- ✅ Procesamiento robusto incluso con saltos de línea o cambios de posición de datos

---

## ⚙️ Modificaciones realizadas

### 📤 Extracción mejorada desde PDF

- [x] Lectura directa desde PDF → `.txt` intermedio
- [x] Regex adaptadas a valores en distintas líneas
- [x] Extracción de bloques `Periodo 1` a `6` de forma robusta
- [x] Corrección en la posición fija de potencia contratada y demandada
- [x] Captura de importes aunque estén en líneas separadas:
  - `Fact. Potencia Contratada`
  - `Término de Energía Variable`
  - `Fact. Energía Reactiva`

### 📊 Salida a Excel

- [x] Todas las variables se exportan en columnas ordenadas
- [x] Se sobreescribe el Excel `facturas_compiladas.xlsx` en Escritorio
- [x] Los valores no encontrados se rellenan como `"0"`

### 🧪 Logs y depuración

- [x] El `.txt` generado (debug) contiene el contenido plano del PDF
- [x] El `.log` muestra el resultado de cada campo y regex evaluada
- [x] Ambos archivos se sobrescriben en cada ejecución

### 🖥️ Interfaz

- [x] Botón único para procesar múltiples PDFs
- [x] Indicador de carga (`CircularProgress`)
- [x] Mensajes de éxito y error con `Alert`
- [x] Logo de empresa y copyright

---

## 🧰 Scripts útiles

### Instalar dependencias

```bash
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

### Empaquetar

```bash
npm run make
```

> ⚠️ Requiere `electron-forge` con `plugin-auto-unpack-natives`

---

## 📁 Estructura del proyecto

```
/public
  └── logo.png
/src
  ├── App.jsx
  ├── preload.js
  ├── procesar_factura.js
  └── main.js
```

---

## 🧑‍💻 Autor

Desarrollado por [alitfal].

---

## 📝 Licencia

MIT.