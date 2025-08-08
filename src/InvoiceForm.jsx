import React, { useMemo, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Button,
  Paper,
  FormHelperText,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material";
import { Add, Delete, InfoOutlined } from "@mui/icons-material";

// Utilidades
const IVA_OPTIONS = [
  { label: "21%", value: 21 },
  { label: "10%", value: 10 },
  { label: "4%", value: 4 },
  { label: "Exento (0%)", value: 0 },
];

const TIPO_OPERACION = [
  { label: "IVA repercutido (ventas)", value: "repercutido" },
  { label: "IVA soportado (compras)", value: "soportado" },
];

const CATEGORIA_OPERACION = [
  { label: "Interior", value: "interior" },
  { label: "Intracomunitaria", value: "intracomunitaria" },
  { label: "Importación", value: "importacion" },
  { label: "Exportación", value: "exportacion" },
  { label: "Inversión del sujeto pasivo", value: "isp" },
];

const emptyLinea = () => ({ tipoIva: 21, base: "", iva: 0 });

export default function InvoiceForm({ onSubmit }) {
  const [emisor, setEmisor] = useState({ nombre: "", nif: "", direccion: "" });
  const [receptor, setReceptor] = useState({ nombre: "", nif: "", direccion: "" });
  const [doc, setDoc] = useState({ numero: "", fecha: "" });
  const [operacion, setOperacion] = useState({ tipo: "soportado", categoria: "interior" });
  const [lineas, setLineas] = useState([emptyLinea()]);
  const [notas, setNotas] = useState("");
  const [tags, setTags] = useState([]);

  const errores = useMemo(() => {
    const errs = {};
    if (!doc.numero) errs.numero = "Obligatorio";
    if (!doc.fecha) errs.fecha = "Obligatoria";
    if (!emisor.nif) errs.emisorNif = "Obligatorio";
    if (!emisor.nombre) errs.emisorNombre = "Obligatorio";
    if (!receptor.nif) errs.receptorNif = "Obligatorio";
    if (!receptor.nombre) errs.receptorNombre = "Obligatorio";
    const anyBase = lineas.some((l) => parseFloat(l.base || 0) > 0);
    if (!anyBase) errs.base = "Añade al menos una base imponible";
    return errs;
  }, [doc, emisor, receptor, lineas]);

  const totales = useMemo(() => {
    const basesPorTipo = {};
    let baseTotal = 0;
    let ivaTotal = 0;
    lineas.forEach((l) => {
      const base = parseFloat(l.base || 0) || 0;
      const iva = Math.round((base * (l.tipoIva / 100)) * 100) / 100;
      basesPorTipo[l.tipoIva] = (basesPorTipo[l.tipoIva] || 0) + base;
      baseTotal += base;
      ivaTotal += iva;
    });
    const totalFactura = Math.round((baseTotal + ivaTotal) * 100) / 100;
    return { basesPorTipo, baseTotal, ivaTotal, totalFactura };
  }, [lineas]);

  const actualizarLinea = (idx, patch) => {
    setLineas((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    );
  };

  const agregarLinea = () => setLineas((prev) => [...prev, emptyLinea()]);
  const eliminarLinea = (idx) => setLineas((prev) => prev.filter((_, i) => i !== idx));

  const normalizarPayload = () => {
    // Agrupar por tipo de IVA para encajar con el 303
    const desgloses = IVA_OPTIONS.map(({ value }) => ({
      tipoIva: value,
      base: Math.round(((totales.basesPorTipo[value] || 0) + Number.EPSILON) * 100) / 100,
      cuota: Math.round((((totales.basesPorTipo[value] || 0) * (value / 100)) + Number.EPSILON) * 100) / 100,
    }))
      .filter((d) => d.base > 0 || d.tipoIva === 0); // mantenemos 0% si hay base

    return {
      emisor,
      receptor,
      documento: { numero: doc.numero, fecha: doc.fecha },
      operacion, // { tipo: repercutido|soportado, categoria }
      lineas: lineas.map((l) => ({ tipoIva: l.tipoIva, base: parseFloat(l.base || 0) || 0 })),
      desgloses,
      totales,
      notas,
      tags,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errores).length > 0) return;
    const payload = normalizarPayload();
    if (onSubmit) onSubmit(payload);
    else console.log("Factura payload", payload);
  };

  const chipsHelp = "Usa etiquetas para filtrar o buscar (p.ej., 'proveedor:XYZ', 'Q3-2025').";

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 1100, mx: "auto", my: 3 }}>
      <form onSubmit={handleSubmit} noValidate>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Factura – Datos para Modelo 303</Typography>
          <Tooltip title="Captura los datos mínimos para calcular IVA repercutido/soportado.">
            <InfoOutlined fontSize="small" />
          </Tooltip>
        </Stack>

        {/* Datos del emisor y receptor */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Emisor</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Nombre / Razón social" fullWidth required value={emisor.nombre}
                  error={!!errores.emisorNombre}
                  helperText={errores.emisorNombre || ""}
                  onChange={(e) => setEmisor((s) => ({ ...s, nombre: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="NIF / CIF" fullWidth required value={emisor.nif}
                  error={!!errores.emisorNif}
                  helperText={errores.emisorNif || ""}
                  onChange={(e) => setEmisor((s) => ({ ...s, nif: e.target.value.toUpperCase() }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Dirección fiscal" fullWidth value={emisor.direccion}
                  onChange={(e) => setEmisor((s) => ({ ...s, direccion: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Receptor</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Nombre / Razón social" fullWidth required value={receptor.nombre}
                  error={!!errores.receptorNombre}
                  helperText={errores.receptorNombre || ""}
                  onChange={(e) => setReceptor((s) => ({ ...s, nombre: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="NIF / CIF" fullWidth required value={receptor.nif}
                  error={!!errores.receptorNif}
                  helperText={errores.receptorNif || ""}
                  onChange={(e) => setReceptor((s) => ({ ...s, nif: e.target.value.toUpperCase() }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Dirección fiscal" fullWidth value={receptor.direccion}
                  onChange={(e) => setReceptor((s) => ({ ...s, direccion: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Datos del documento */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField label="Número de factura" fullWidth required value={doc.numero}
              error={!!errores.numero}
              helperText={errores.numero || ""}
              onChange={(e) => setDoc((s) => ({ ...s, numero: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Fecha de emisión" type="date" fullWidth required InputLabelProps={{ shrink: true }}
              value={doc.fecha} error={!!errores.fecha} helperText={errores.fecha || ""}
              onChange={(e) => setDoc((s) => ({ ...s, fecha: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="tipo-op-label">Tipo de operación</InputLabel>
              <Select labelId="tipo-op-label" label="Tipo de operación" value={operacion.tipo}
                onChange={(e) => setOperacion((s) => ({ ...s, tipo: e.target.value }))}
              >
                {TIPO_OPERACION.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="cat-op-label">Categoría</InputLabel>
              <Select labelId="cat-op-label" label="Categoría" value={operacion.categoria}
                onChange={(e) => setOperacion((s) => ({ ...s, categoria: e.target.value }))}
              >
                {CATEGORIA_OPERACION.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Usado para ubicar la casilla en el 303</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Desglose de bases por tipo de IVA */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Bases imponibles por tipo de IVA</Typography>
        <FormHelperText sx={{ mb: 2 }}>
          Si la factura tiene varios tipos de IVA, añade varias líneas. La cuota se calcula automáticamente.
        </FormHelperText>

        {lineas.map((l, idx) => {
          const base = parseFloat(l.base || 0) || 0;
          const cuota = Math.round((base * (l.tipoIva / 100)) * 100) / 100;
          return (
            <Grid key={idx} container spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id={`iva-${idx}`}>Tipo IVA</InputLabel>
                  <Select labelId={`iva-${idx}`} label="Tipo IVA" value={l.tipoIva}
                    onChange={(e) => actualizarLinea(idx, { tipoIva: Number(e.target.value) })}
                  >
                    {IVA_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Base imponible (€)" type="number" inputProps={{ step: "0.01", min: 0 }}
                  fullWidth value={l.base} error={!!errores.base && !l.base}
                  onChange={(e) => actualizarLinea(idx, { base: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Cuota IVA (€)" fullWidth value={cuota.toFixed(2)} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={1}>
                <IconButton aria-label="Eliminar línea" onClick={() => eliminarLinea(idx)} disabled={lineas.length === 1}>
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          );
        })}

        <Button startIcon={<Add />} variant="outlined" onClick={agregarLinea} sx={{ mb: 2 }}>
          Añadir línea
        </Button>
        {errores.base && <FormHelperText error sx={{ mb: 2 }}>{errores.base}</FormHelperText>}

        <Divider sx={{ my: 3 }} />

        {/* Totales */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField label="Base total (€)" value={totales.baseTotal.toFixed(2)} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="IVA total (€)" value={totales.ivaTotal.toFixed(2)} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Total factura (€)" value={totales.totalFactura.toFixed(2)} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Notas y tags */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField label="Notas" fullWidth multiline minRows={3} value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title={chipsHelp}>
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Etiquetas (tags) <InfoOutlined fontSize="inherit" />
              </Typography>
            </Tooltip>
            <TagInput value={tags} onChange={setTags} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button type="button" variant="outlined" onClick={() => {
            setEmisor({ nombre: "", nif: "", direccion: "" });
            setReceptor({ nombre: "", nif: "", direccion: "" });
            setDoc({ numero: "", fecha: "" });
            setOperacion({ tipo: "soportado", categoria: "interior" });
            setLineas([emptyLinea()]);
            setNotas("");
            setTags([]);
          }}>
            Limpiar
          </Button>
          <Button type="submit" variant="contained" size="large" disabled={Object.keys(errores).length > 0}>
            Guardar factura
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

function TagInput({ value = [], onChange }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const t = input.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...(value || []), t]);
    setInput("");
  };

  const removeTag = (t) => onChange((value || []).filter((x) => x !== t));

  return (
    <Box>
      <Grid container spacing={1}>
        <Grid item xs={8}>
          <TextField size="small" label="Nueva etiqueta" value={input}
            onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <Button fullWidth variant="outlined" onClick={addTag}>Añadir</Button>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(value || []).map((t) => (
              <Chip key={t} label={t} onDelete={() => removeTag(t)} />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
