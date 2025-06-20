# 📦 FactuMate

**FactuMate** es una aplicación de escritorio construida con **Electron** y **React**, diseñada para extraer datos clave desde facturas en PDF y generar automáticamente un archivo Excel con la información estructurada.

---

## 🚀 Características

* Interfaz moderna con soporte para tema claro/oscuro
* Subida de archivos PDF locales
* Extracción automática de campos como número de factura, fechas, CUPS, importe, bono social
* Generación de archivo Excel a partir de una plantilla existente
* Funciona como app de escritorio (Electron) o en modo demo (navegador)

---

## 📁 Estructura del proyecto

```
factumate/
├── main.js                 # Lógica principal de Electron
├── preload.js              # Exposición segura de API a React
├── procesar_factura.js     # Extracción y generación Excel
├── plantilla.xlsx          # Plantilla base para completar
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
* Tener un archivo `plantilla.xlsx` con una hoja llamada `0003`

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
# Ejecuta en puerto 3001
REACT_PORT=3001 PORT=3001 npm start
```

Esto iniciará:

* React en `localhost:3001`
* Una ventana de Electron que carga esa interfaz

---

## 🧪 Modo demo (navegador)

También puedes abrir `http://localhost:3001` directamente en tu navegador:

* El botón mostrará una alerta simulada
* No se podrá procesar PDFs, pero puedes ver la interfaz

---

## 🧾 Exportación Excel

Los datos extraídos del PDF se insertan en la plantilla `plantilla.xlsx` en la fila 3, y se guarda un nuevo archivo `factura_actualizada.xlsx` en la raíz del proyecto.

---

## 🛡 Seguridad

Esta app funciona localmente, sin conexión a Internet ni carga de archivos externos. No se transmiten datos a servidores.

---

## 📌 Futuras mejoras

* Vista previa del PDF
* Modo multi-factura (procesamiento por lotes)
* Carga manual de archivo en modo navegador
* Configuración editable de campos

---

## 📃 Licencia

Este proyecto está licenciado bajo MIT.

---

## 🤝 Autor

Desarrollado por \[alitfal].
