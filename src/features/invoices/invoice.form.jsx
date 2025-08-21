import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Add, Delete } from "@mui/icons-material";
import { useAuthContext } from "../auth/AuthContext";
import { db, auth } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function FacturaForm() {
  const { user, setUser } = useAuthContext();
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
    formaPago: "",
    iban: "",
    lineas: [
      { descripcion: "", cantidad: 1, precio: 0, tipoIVA: 21 },
    ],
  });

  // utils/nif.js
  const isValidNIF = (value) => {
    const nifRegex = /^([0-9]{8}[A-Z]|[A-Z][0-9]{7}[0-9A-Z])$/i;
    return nifRegex.test(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 🔹 Cambios en una línea
  const handleLineaChange = (index, field, value) => {
    const nuevas = [...formData.lineas];
    nuevas[index][field] =
      field === "cantidad" || field === "precio" ? Number(value) : value;
    setFormData({ ...formData, lineas: nuevas });
  };

  // 🔹 Añadir/eliminar líneas
  const addLinea = () => {
    setFormData({
      ...formData,
      lineas: [...formData.lineas, { descripcion: "", cantidad: 1, precio: 0, tipoIVA: 21 }],
    });
  };
  const removeLinea = (index) => {
    const nuevas = formData.lineas.filter((_, i) => i !== index);
    setFormData({ ...formData, lineas: nuevas });
  };

  // 🔹 Calcular totales agrupados por IVA
  const calcularTotales = () => {
    const resumen = {};
    formData.lineas.forEach((l) => {
      const base = l.cantidad * l.precio;
      if (!resumen[l.tipoIVA]) resumen[l.tipoIVA] = { base: 0, cuota: 0 };
      resumen[l.tipoIVA].base += base;
      resumen[l.tipoIVA].cuota += (base * l.tipoIVA) / 100;
    });
    return resumen;
  };

  const totales = calcularTotales();
  const totalFactura = Object.values(totales).reduce(
    (sum, t) => sum + t.base + t.cuota,
    0
  );

  const handleChangeIBAN = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    
    // --- IBAN strict validation (ES + 22 digits) ---
    if (name === "iban") {
      let raw = value.replace(/\s+/g, "").toUpperCase();
      
      // First two characters: only letters
      let prefix = raw.slice(0, 2).replace(/[^A-Z]/g, "");
      
      // Remaining characters: only digits, max 22
      let numbers = raw.slice(2).replace(/\D/g, "").slice(0, 22);
      
      // Combine back
      raw = prefix + numbers;
      
      // Insert space every 4 chars for readability
      const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
      
      newFormData.iban = formatted;
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para guardar facturas.");
      return;
    }

    try {
      // Use numeroFactura as invoiceId (or generate UUID)
      const invoiceId = formData.numeroFactura || Date.now().toString();

      await setDoc(doc(db, "invoices", user.uid, "userInvoices", invoiceId), {
        ...formData,
        createdAt: new Date().toISOString(),
        userId: user.uid,
        userEmail: user.email,
      });

      alert("Factura guardada con éxito 🚀");
      setFormData({ ...formData, numeroFactura: "", descripcion: "" }); // clear some fields
    } catch (error) {
      console.error("Error guardando la factura:", error);
      alert("Error al guardar la factura.");
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, margin: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Nueva Factura (Veri*Factu)
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Número y fecha */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="Número de factura"
              name="numeroFactura"
              fullWidth
              required
              value={formData.numeroFactura}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
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
          {/* Totales */}
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="h6">
              Total Factura: {totalFactura.toFixed(2)} €
            </Typography>
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
            <Grid size={{ xs: 12, sm: 2 }}>
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
            <Grid size={{ xs: 12, sm: 5 }}>
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
            <Grid size={{ xs: 12, sm: 2 }}>
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
            <Grid size={{ xs: 12, sm: 5 }}>
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

          {/* Conceptos */}
          <Grid size={12}>
            <Typography variant="h6">Conceptos</Typography>
          </Grid>
          {formData.lineas.map((linea, index) => (
            <Grid container spacing={2} size={12} key={index} alignItems="center">
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Descripción"
                  fullWidth
                  value={linea.descripcion}
                  onChange={(e) =>
                    handleLineaChange(index, "descripcion", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 1 }}>
                <TextField
                  label="Cantidad"
                  type="number"
                  fullWidth
                  value={linea.cantidad}
                  onChange={(e) =>
                    handleLineaChange(index, "cantidad", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="Precio €"
                  type="number"
                  fullWidth
                  value={linea.precio}
                  onChange={(e) =>
                    handleLineaChange(index, "precio", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 1 }}>
                <TextField
                  select
                  label="IVA %"
                  fullWidth
                  value={linea.tipoIVA}
                  onChange={(e) =>
                    handleLineaChange(index, "tipoIVA", e.target.value)
                  }
                >
                  <MenuItem value={21}>21%</MenuItem>
                  <MenuItem value={10}>10%</MenuItem>
                  <MenuItem value={4}>4%</MenuItem>
                  <MenuItem value={0}>0%</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 1 }}>
                <Typography>
                  {(linea.cantidad * linea.precio).toFixed(2)} €
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 1 }}>
                <IconButton onClick={() => removeLinea(index)} color="error">
                  <Delete />
                </IconButton>
            </Grid>
            </Grid>
          ))}
        <Grid size={{ xs: 12}}>
          <Button startIcon={<Add />} onClick={addLinea}>
            Añadir concepto
          </Button>
        </Grid>

        {/* Totales */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Totales</Typography>
          {Object.entries(totales).map(([iva, t]) => (
            <Typography key={iva}>
              IVA {iva}% → Base: {t.base.toFixed(2)} €, Cuota:{" "}
              {t.cuota.toFixed(2)} €
            </Typography>
          ))}
          <Typography variant="h6">
            Total Factura: {totalFactura.toFixed(2)} €
          </Typography>
        </Grid>

        {/* Forma de Pago */}
        <Grid size={3}>
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
          <Grid size={4}>
            <TextField
              label="Número de cuenta IBAN"
              name="iban"
              fullWidth
              required
              value={formData.iban}
              onChange={handleChangeIBAN}
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
