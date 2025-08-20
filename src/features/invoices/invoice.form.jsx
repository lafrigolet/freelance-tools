import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
} from "@mui/material";
//import Grid from "@mui/material/Grid2";
import Grid from '@mui/material/Grid';

export default function FacturaForm() {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    numeroFactura: "",
    fecha: today,
    emisorNombre: "",
    emisorNIF: "",
    emisorDomicilio: "",
    receptorNombre: "",
    receptorNIF: "",
    receptorDomicilio: "",
    descripcion: "",
    baseImponible: "",
    tipoIVA: 21,
    cuotaIVA: "",
    importeTotal: "",
    formaPago: "",
    iban: "",   
  });

  // utils/nif.js
  const isValidNIF = (value) => {
    const nifRegex = /^([0-9]{8}[A-Z]|[A-Z][0-9]{7}[0-9A-Z])$/i;
    return nifRegex.test(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // cálculo automático de IVA y total
    if (name === "baseImponible" || name === "tipoIVA") {
      const base = parseFloat(newFormData.baseImponible) || 0;
      const iva = parseFloat(newFormData.tipoIVA) || 0;
      const cuota = (base * iva) / 100;
      newFormData.cuotaIVA = cuota.toFixed(2);
      newFormData.importeTotal = (base + cuota).toFixed(2);
    }

    setFormData(newFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Factura enviada:", formData);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, margin: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Nueva Factura (Veri*Factu)
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Número y fecha */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Número de factura"
              name="numeroFactura"
              fullWidth
              required
              value={formData.numeroFactura}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Fecha"
              type="date"
              name="fecha"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.fecha}
              onChange={handleChange}
            />
          </Grid>

          {/* Datos Emisor */}
          <Grid size={12}>
            <Typography variant="h6">Datos del Emisor</Typography>
          </Grid>
          <Grid container spacing={2} size={12}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                label="Nombre / Razón Social"
                name="emisorNombre"
                fullWidth
                required
                value={formData.emisorNombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="NIF"
                name="emisorNIF"
                fullWidth
                required
                value={formData.emisorNIF}
                onChange={handleChange}
                error={formData.emisorNIF !== "" && !isValidNIF(formData.emisorNIF)}
                helperText={
                  formData.emisorNIF !== "" && !isValidNIF(formData.emisorNIF)
                    ? "Introduce un NIF válido"
                    : " "
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Domicilio"
                name="emisorDomicilio"
                fullWidth
                required
                value={formData.emisorDomicilio}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Datos Receptor */}
          <Grid size={12}>
            <Typography variant="h6">Datos del Receptor</Typography>
          </Grid>
          <Grid container spacing={2} size={12}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                label="Nombre / Razón Social"
                name="receptorNombre"
                fullWidth
                required
                value={formData.receptorNombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="NIF"
                name="receptorNIF"
                fullWidth
                required
                value={formData.receptorNIF}
                onChange={handleChange}
                error={formData.receptorNIF !== "" && !isValidNIF(formData.receptorNIF)}
                helperText={
                  formData.receptorNIF !== "" && !isValidNIF(formData.receptorNIF)
                    ? "Introduce un NIF válido"
                    : " "
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Domicilio"
                name="receptorDomicilio"
                fullWidth
                required
                value={formData.receptorDomicilio}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Detalles de Factura */}
          <Grid size={12}>
            <Typography variant="h6">Detalles</Typography>
          </Grid>
          <Grid size={12}>
            <TextField
              label="Descripción de bienes/servicios"
              name="descripcion"
              fullWidth
              multiline
              rows={3}
              required
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Base Imponible (€)"
              name="baseImponible"
              type="number"
              fullWidth
              required
              value={formData.baseImponible}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              label="Tipo IVA (%)"
              name="tipoIVA"
              fullWidth
              required
              value={formData.tipoIVA}
              onChange={handleChange}
            >
              <MenuItem value={21}>21%</MenuItem>
              <MenuItem value={10}>10%</MenuItem>
              <MenuItem value={4}>4%</MenuItem>
              <MenuItem value={0}>0%</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="Cuota IVA (€)"
              name="cuotaIVA"
              fullWidth
              InputProps={{ readOnly: true }}
              value={formData.cuotaIVA}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="Total (€)"
              name="importeTotal"
              fullWidth
              InputProps={{ readOnly: true }}
              value={formData.importeTotal}
            />
          </Grid>

          {/* Forma de Pago */}
          <Grid size={12}>
            <TextField
              select
              label="Forma de pago"
              name="formaPago"
              fullWidth
              required
              value={formData.formaPago}
              onChange={handleChange}
            >
              <MenuItem value="transferencia">Transferencia bancaria</MenuItem>
              <MenuItem value="domiciliacion">Domiciliación bancaria</MenuItem>
              <MenuItem value="tarjeta">Tarjeta</MenuItem>
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="cheque">Cheque / pagaré</MenuItem>
              <MenuItem value="otros">Otros (Bizum, PayPal…)</MenuItem>
            </TextField>
          </Grid>

          {/* IBAN condicional */}
          {formData.formaPago === "transferencia" && (
            <Grid size={12}>
              <TextField
                label="Número de cuenta IBAN"
                name="iban"
                fullWidth
                required
                value={formData.iban}
                onChange={handleChange}
                placeholder="ES00 0000 0000 0000 0000 0000"
              />
            </Grid>
          )}

          {/* Leyenda VeriFactu */}
          <Grid size={12}>
            <Typography
              variant="body2"
              sx={{ mt: 2, fontStyle: "italic", color: "gray" }}
            >
              “Factura verificable en la sede electrónica de la AEAT (Veri*Factu)”
            </Typography>
          </Grid>

          {/* Botón Submit */}
          <Grid size={12}>
            <Button type="submit" variant="contained" color="primary">
              Guardar Factura
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
