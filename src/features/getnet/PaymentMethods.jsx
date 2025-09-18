import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  Star,
  StarBorder,
  Delete,
  Add,
  Visibility,
  VisibilityOff,
  InfoOutlined,
} from "@mui/icons-material";
import {
  getAllPaymentMethods, 
  addPaymentMethod,
  deletePaymentMethod,
  setPreferredPaymentMethod,
} from './paymentmethods';


const PaymentMethods = ({ uid }) => {
  const [methods, setMethods] = useState([]);
  const [open, setOpen] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
  });


  // === Cargar métodos al inicio ===
  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    const res = await getAllPaymentMethods({ uid });
    if (res.data.success) setMethods(res.data.methods);
  };

  // === Añadir tarjeta ===
  const handleAdd = async () => {
    const res = await addPaymentMethod({ uid, card: newCard });
    if (res.data.success) {
      setOpen(false);
      setNewCard({ number: "", exp_month: "", exp_year: "", cvv: "" });
      loadMethods();
    } else {
      alert("Error al añadir tarjeta: " + res.data.error);
    }
  };

  // === Eliminar tarjeta ===
  const handleDelete = async (id) => {
    await deletePaymentMethod({ uid, methodId: id });
    loadMethods();
  };

  // === Marcar como preferida ===
  const handleSetPreferred = async (id) => {
    await setPreferredPaymentMethod({ uid, methodId: id });
    loadMethods();
  };

  const handleCardNumber = (e) => {
    let value = e.target.value;
    
    // Quitar todo lo que no sean dígitos
    value = value.replace(/\D/g, "");
    
    // Limitar a 16 dígitos
    value = value.slice(0, 16);
    
    // Agrupar en bloques de 4
    const formatted = value.replace(/(.{4})/g, "$1 ").trim();
    
    setNewCard({
      ...newCard,
      number: formatted,
    });
  };
  
  const handleExpirationDate = (e) => {
    console.log('handleExpirationDate ');
    let value = e.target.value.replace(/\s+/g, "");
    
    // Solo números y "/"
    value = value.replace(/[^0-9/]/g, "");
    
    console.log(/^(0|1|0[0-9]|1[0-2])$/.test(value))
    // Auto insert "/" después de 2 dígitos (si aún no tiene "/")
    
    if (/^(0|1)$/.test(value))
      value = value;
    else if (/^(0[0-9]|1[0-2])$/.test(value))
      value = value + "/";
    else if (/^(0[1-9]|1[0-2])\/[0-9]$/.test(value))
      value = value;
    else if (/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(value))
      value = value;
    else
      value = value.slice(0, -1);
    
    
    // Limitar longitud máxima "MM/YY"
    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    const [month, year] = value.split("/");
    
    // Validar mes 01–12
    let validMonth = month || "";
    if (validMonth.length === 2) {
      const monthNum = parseInt(validMonth, 10);
      if (monthNum < 1 || monthNum > 12) {
        validMonth = ""; // reset si no válido
      }
    }
    
    setNewCard({
      ...newCard,
      exp_month: validMonth,
      exp_year: year || "",
    });
    
    // También actualizar el valor mostrado en el input
    e.target.value = value;
  };

  const handleCvvChange = (e) => {
    // Mantener sólo dígitos
    let value = e.target.value.replace(/\D/g, "");
    // Limitar a 3 dígitos
    value = value.slice(0, 3);
    
    setNewCard({
      ...newCard,
    cvv: value,
    });
  };
  
  return (
    <Card sx={{ maxWidth: 800, minWidth: 300, margin: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Métodos de pago
        </Typography>

        <List>
          {methods.map((m) => (
            <ListItem key={m.id} divider>
              <ListItemText
                primary={`${m.brand || "Tarjeta"} •••• ${m.last4}`}
                secondary={`Expira: ${m.expiry_month}/${m.expiry_year}`}
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleSetPreferred(m.id)}>
                  {m.preferred ? <Star color="primary" /> : <StarBorder />}
                </IconButton>
                <IconButton onClick={() => handleDelete(m.id)}>
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          
          {/* Fila para añadir nueva tarjeta */}
          <ListItem divider>
            <Grid container spacing={1}>
              <Grid size={{ xs: 5}}>
                <TextField
                  fullWidth
                  size="small"
                  label="Número de tarjeta"
                  value={newCard.number}
                  onChange={handleCardNumber}
                />
              </Grid>
              <Grid size={{ xs: 2}}>
                <TextField
                  fullWidth
                  size="small"
                  label="Expira"
                  placeholder="MM/YY"
                  onChange={handleExpirationDate}
                />
              </Grid>
              <Grid size={{ xs: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="CVV"
                  type={showCvv ? "text" : "password"}
                  value={newCard.cvv}
                  onChange={handleCvvChange}
                  inputProps={{ maxLength: 3, inputMode: "numeric", pattern: "[0-9]*" }}
                  InputProps={{
                    endAdornment: (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => setShowCvv(!showCvv)}
                          edge="end"
                        >
                          {showCvv ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 1 }}>
                <Tooltip
                  title="El CVV es un código de 3 dígitos que aparece en el reverso de tu tarjeta, junto a la firma."
                  arrow
                >
                  <IconButton size="small" edge="end">
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 2}}>
                <ListItemSecondaryAction>
                  <IconButton color="primary" onClick={handleAdd}>
                    <Add />
                  </IconButton>
                </ListItemSecondaryAction>
              </Grid>
            </Grid>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
