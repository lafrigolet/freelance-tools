import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const CookieConsent = () => {
  const [open, setOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const [preferences, setPreferences] = useState({
    necessary: true, // siempre activadas (no se pueden desactivar)
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(
      "cookieConsent",
      JSON.stringify({ ...preferences, analytics: true, marketing: true })
    );
    setOpen(false);
    setConfigOpen(false);
  };

  const handleReject = () => {
    localStorage.setItem(
      "cookieConsent",
      JSON.stringify({ necessary: true, analytics: false, marketing: false })
    );
    setOpen(false);
    setConfigOpen(false);
  };

  const handleSaveConfig = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    setOpen(false);
    setConfigOpen(false);
  };

  const togglePreference = (key) => {
    if (key !== "necessary") {
      setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <>
      {/* Banner inicial */}
      <Dialog open={open && !configOpen}>
        <DialogTitle>Uso de cookies</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Usamos cookies propias y de terceros para mejorar tu experiencia,
            elaborar estadísticas y mostrar publicidad personalizada. Puedes
            aceptar todas, rechazarlas o configurar tus preferencias.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReject}>Rechazar</Button>
          <Button onClick={() => setConfigOpen(true)}>Configurar</Button>
          <Button variant="contained" onClick={handleAccept}>
            Aceptar todas
          </Button>
        </DialogActions>
      </Dialog>

      {/* Configuración granular */}
      <Dialog open={configOpen}>
        <DialogTitle>Configurar cookies</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked disabled />}
              label="Necesarias (siempre activas)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={preferences.analytics}
                  onChange={() => togglePreference("analytics")}
                />
              }
              label="Analíticas"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={preferences.marketing}
                  onChange={() => togglePreference("marketing")}
                />
              }
              label="Marketing"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigOpen(false)}>Cancelar</Button>
          <Button onClick={handleReject}>Rechazar todas</Button>
          <Button variant="contained" onClick={handleSaveConfig}>
            Guardar preferencias
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CookieConsent;
