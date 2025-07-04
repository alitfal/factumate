import React, { useMemo, useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Box,
  Paper,
  Divider,
  Fade,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Brightness4, Brightness7, PictureAsPdf } from "@mui/icons-material";

function App() {
  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const [mode, setMode] = useState(prefersDarkMode ? "dark" : "light");
  const isElectron = typeof window !== "undefined" && !!window.electronAPI;

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        typography: {
          fontFamily: '"Segoe UI", Roboto, sans-serif',
          h4: { fontWeight: 700 },
          subtitle1: { color: mode === "dark" ? "#bbb" : "#555" },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 20,
                padding: "2.5rem",
                boxShadow: "0px 12px 36px rgba(0,0,0,0.12)",
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const handleSelectMultiplePDFs = async () => {
    setMensaje(null);
    setError(null);

    if (!isElectron) {
      alert(
        "Simulación: seleccionarías múltiples PDFs (solo en app de escritorio)."
      );
      return;
    }

    try {
      setLoading(true);
      const rutas = await window.electronAPI.seleccionarPDFs();
      if (rutas && rutas.length > 0) {
        const output = await window.electronAPI.procesarMultiplesPDF(rutas);
        setMensaje(`✅ Excel generado con múltiples facturas:\n${output}`);
      } else {
        setError("No se seleccionaron archivos.");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Error al procesar los PDFs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Fade in timeout={600}>
          <Paper elevation={4}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box
                component="img"
                src="logo_inytel.png"
                alt="Inytel logo"
                sx={{ width: 180 }}
              />
              <FormControlLabel
                control={
                  <Switch checked={mode === "dark"} onChange={toggleTheme} />
                }
                label={mode === "dark" ? <Brightness4 /> : <Brightness7 />}
              />
            </Box>

            <Container maxWidth="sm" sx={{ textAlign: "center" }}>
              <Box
                component="img"
                src="LogoFactuMate.png"
                alt="FactuMate logo"
                sx={{ width: 100, mb: 1 }}
              />
              <Typography variant="h4" gutterBottom>
                FactuMate
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Extrae datos de facturas PDF y genera Excel automáticamente
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PictureAsPdf />}
                onClick={handleSelectMultiplePDFs}
                sx={{
                  px: 5,
                  py: 1.7,
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 3,
                }}
                disabled={loading}
              >
                Procesar varios PDFs
              </Button>

              {loading && (
                <Box sx={{ mt: 3 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Procesando archivos...
                  </Typography>
                </Box>
              )}

              {mensaje && (
                <Alert
                  severity="success"
                  sx={{ mt: 3, whiteSpace: "pre-line" }}
                >
                  {mensaje}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              )}
              {/* 
              <Typography variant="caption" sx={{ mt: 4, display: 'block', color: 'text.secondary' }}>
                Modo: {isElectron ? 'Electron (App de escritorio)' : 'Navegador (modo demo)'}
              </Typography> */}
              <Typography
                variant="caption"
                sx={{
                  mt: 4,
                  display: "block",
                  textAlign: "center",
                  color: "text.disabled",
                }}
              >
                © {new Date().getFullYear()} Inytel - Todos los derechos
                reservados
              </Typography>
            </Container>
          </Paper>
        </Fade>
      </Box>
    </ThemeProvider>
  );
}

export default App;
