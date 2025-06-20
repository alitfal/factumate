import React, { useMemo, useState } from 'react';
import {
  ThemeProvider, createTheme, CssBaseline, Container,
  Typography, Button, Switch, FormControlLabel
} from '@mui/material';
import { Brightness4, Brightness7, PictureAsPdf } from '@mui/icons-material';

function App() {
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  const handleSelectPDF = async () => {
    if (!isElectron) {
      alert("Simulación: subirías un PDF (solo disponible en la app de escritorio).");
      return;
    }

    const filePath = await window.electronAPI.seleccionarPDF();
    if (filePath) {
      const output = await window.electronAPI.procesarPDF(filePath);
      alert(`Excel generado en:\n${output}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>FactuMate</Typography>
        <Typography variant="subtitle1" gutterBottom>
          Extrae datos de facturas PDF y genera Excel automáticamente
        </Typography>
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={handleSelectPDF}
          sx={{ mt: 4 }}
        >
          Seleccionar PDF
        </Button>
        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
          label={mode === 'dark' ? <Brightness4 /> : <Brightness7 />}
          sx={{ mt: 3 }}
        />
        <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
          Modo: {isElectron ? 'Electron (App de escritorio)' : 'Navegador (modo demo)'}
        </Typography>
      </Container>
    </ThemeProvider>
  );
}

export default App;
