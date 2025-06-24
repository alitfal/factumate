# 📦 FactuMate

**FactuMate** es una aplicación de escritorio construida con **Electron** y **React**, diseñada para extraer datos clave desde facturas en PDF y generar automáticamente un archivo Excel con la información estructurada.

---

## 🚀 Características

* Interfaz moderna con soporte para tema claro/oscuro.
* Subida de archivos PDF locales.
* Extracción automática de campos como número de factura, fechas, CUPS, importe, bono social.
* Generación de archivo Excel dinámico sin necesidad de plantilla.
* Compatible con **macOS**, **Windows** y **Linux**.
* Funciona como app de escritorio (Electron) o en modo demo (navegador).

---

## 📁 Estructura del proyecto

```
factumate/
├── main.js                 # Lógica principal de Electron
├── preload.js              # Exposición segura de API a React
├── procesar_factura.js     # Extracción y generación Excel
├── public/
│   └── index.html
└── src/
    ├── App.jsx             # Interfaz React
    └── index.js            # Punto de entrada
```

---

## 🛠 Requisitos previos

* Node.js ≥ 18
* Git

---

## 🔧 Instalación

```bash
# Clona el repositorio
git clone git@github.com:TU_USUARIO/factumate.git
cd factumate

# Instala las dependencias
npm install
```

---

## ▶️ Ejecución del proyecto

```bash
# Ejecuta React + Electron
REACT_PORT=3001 PORT=3001 npm start
```

Esto iniciará:

* React en `localhost:3001`
* Una ventana de Electron que carga esa interfaz.

---

## 🧪 Modo demo (navegador)

También puedes abrir `http://localhost:3001` directamente en tu navegador:

* El botón mostrará una alerta simulada.
* No se podrá procesar PDFs, pero puedes probar la interfaz.

---

## 🧾 Exportación Excel

* Los datos extraídos se exportan en un archivo `factura_actualizada.xlsx` en el escritorio.
* Archivos de depuración (`factura_debug_texto.txt`, `factumate_log.txt`) se guardan en:
  * macOS: `~/Library/Application Support/FactuMate/txt`
  * Windows: `C:\Users\TU_USUARIO\AppData\Roaming\FactuMate\txt`
  * Linux: `~/.config/FactuMate/txt`

---

## 🛡 Seguridad

Esta app funciona **localmente**, sin conexión a Internet ni carga de archivos externos. No se transmiten datos a servidores.

---

## 📌 Futuras mejoras

* Vista previa del PDF.
* Procesamiento por lotes (multi-factura).
* Carga manual de archivos en modo navegador.
* Configuración editable de campos y salidas.

---

## 📃 Licencia

Este proyecto está licenciado bajo **MIT**.

---

## 🤝 Autor

Desarrollado por [alitfal].
