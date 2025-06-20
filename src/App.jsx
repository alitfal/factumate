import React, { useMemo, useState } from 'react';
import {
  ThemeProvider, createTheme, CssBaseline, Container, Typography,
  Button, Switch, FormControlLabel, Box, Paper, Divider, Fade
} from '@mui/material';
import { Brightness4, Brightness7, PictureAsPdf } from '@mui/icons-material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

function App() {
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
  const theme = useMemo(() => createTheme({
    palette: { mode },
    typography: {
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      h4: { fontWeight: 700 },
      subtitle1: { color: mode === 'dark' ? '#bbb' : '#555' }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            padding: '2.5rem',
            boxShadow: '0px 12px 36px rgba(0,0,0,0.12)'
          }
        }
      }
    }
  }), [mode]);

  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handleSelectPDF = async () => {
    if (!isElectron) {
      alert("Simulación: subirías un PDF (solo disponible en la app de escritorio).")
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
      <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Fade in timeout={600}>
          <Paper elevation={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <FormControlLabel
                control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
                label={mode === 'dark' ? <Brightness4 /> : <Brightness7 />}
              />
            </Box>
            <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
              <InsertDriveFileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" gutterBottom>FactuMate</Typography>
              <Typography variant="subtitle1" gutterBottom>
                Extrae datos de facturas PDF y genera Excel automáticamente
              </Typography>
              <Divider sx={{ my: 3 }} />
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PictureAsPdf />}
                onClick={handleSelectPDF}
                sx={{ px: 5, py: 1.7, fontWeight: 600, textTransform: 'none', borderRadius: 3 }}
              >
                Seleccionar PDF
              </Button>
              <Typography variant="caption" sx={{ mt: 4, display: 'block', color: 'text.secondary' }}>
                Modo: {isElectron ? 'Electron (App de escritorio)' : 'Navegador (modo demo)'}
              </Typography>
            </Container>
          </Paper>
        </Fade>
      </Box>
    </ThemeProvider>
  );
}

export default App;
