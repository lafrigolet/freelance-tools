// src/components/AddressCard.js
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Button,
  Box,
  Divider,
} from "@mui/material";
import {
  Star,
  StarBorder,
  Delete,
  Save,
  Edit,
  Add,
  Close,
} from "@mui/icons-material";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "./addresses";

import { useAuthContext } from "../auth/AuthContext";

export default function AddressCard({ uid }) {
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [newAddress, setNewAddress] = useState(null); // 👈 dirección temporal
  const { userData } = useAuthContext();

  const loadAddresses = async () => {
    if (!userData.uid) return;
    const res = await getAddresses({uid});
    setAddresses(res.data.addresses || []);
  };

  useEffect(() => {
    loadAddresses();
  }, [userData]);

  const handleEdit = (id, field, value) => {
    setFormValues({
      ...formValues,
      [id]: { ...formValues[id], [field]: value },
    });
  };

  const handleSave = async (id) => {
    if (id === "new") {
      // Guardar la dirección nueva
      await addAddress(formValues[id], uid );
      setNewAddress(null);
    } else {
      // Actualizar una dirección existente
      await updateAddress({ addressId: id, address: formValues[id], uid });
      setEditingId(null);
    }
    setFormValues({});
    loadAddresses();
  };

  const handleDelete = async (id) => {
    await deleteAddress({ addressId: id, uid });
    loadAddresses();
  };

  const handleSetDefault = async (id) => {
    await setDefaultAddress({ addressId: id, uid });
    loadAddresses();
  };

  const handleAdd = () => {
    // Crea un formulario vacío en memoria
    setNewAddress({
      street: "",
      city: "",
      zip: "",
      country: "",
    });
    setFormValues({
      ...formValues,
      new: { street: "", city: "", zip: "", country: "" },
    });
    setEditingId("new");
  };

  return (
    <Card sx={{ maxWidth: 500, margin: "auto" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Mis direcciones
        </Typography>

        {/* Direcciones existentes */}
        {addresses.map((addr) => (
          <>
          <Box
            key={addr.id}
            sx={{ display: "flex", alignItems: "center", mb: 1 }}
          >
            <Box sx={{ flexGrow: 1 }}>
              {/* Street */}
              <TextField
                variant="standard"
                label="Street"
                value={
                  editingId === addr.id
                    ? formValues[addr.id]?.street ?? addr.street ?? ""
                    : addr.street ?? ""
                }
                onChange={(e) => handleEdit(addr.id, "street", e.target.value)}
                InputProps={{ readOnly: editingId !== addr.id }}
                sx={{ mr: 1, width: "200px" }}
                placeholder="Street"
              />

              {/* City */}
              <TextField
                variant="standard"
                label="City"
                value={
                  editingId === addr.id
                    ? formValues[addr.id]?.city ?? addr.city ?? ""
                    : addr.city ?? ""
                }
                onChange={(e) => handleEdit(addr.id, "city", e.target.value)}
                InputProps={{ readOnly: editingId !== addr.id }}
                sx={{ mr: 1, width: "120px" }}
                placeholder="City"
              />

              {/* Zip */}
              <TextField
                variant="standard"
                label="ZIP"
                value={
                  editingId === addr.id
                    ? formValues[addr.id]?.zip ?? addr.zip ?? ""
                    : addr.zip ?? ""
                }
                onChange={(e) => handleEdit(addr.id, "zip", e.target.value)}
                InputProps={{ readOnly: editingId !== addr.id }}
                sx={{ mr: 1, width: "80px" }}
                placeholder="ZIP"
              />

              {/* Country */}
              <TextField
                variant="standard"
                label="Country"
                value={
                  editingId === addr.id
                    ? formValues[addr.id]?.country ?? addr.country ?? ""
                    : addr.country ?? ""
                }
                onChange={(e) => handleEdit(addr.id, "country", e.target.value)}
                InputProps={{ readOnly: editingId !== addr.id }}
                sx={{ mr: 1, width: "120px" }}
                placeholder="Country"
              />
            </Box>

            {editingId === addr.id ? (
              <IconButton onClick={() => handleSave(addr.id)}>
                <Save />
              </IconButton>
            ) : (
              <IconButton onClick={() => setEditingId(addr.id)}>
                <Edit />
              </IconButton>
            )}
            <IconButton onClick={() => handleSetDefault(addr.id)}>
              {addr.isDefault ? <Star color="primary" /> : <StarBorder />}
            </IconButton>
            <IconButton onClick={() => handleDelete(addr.id)}>
              <Delete />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2 }} />
          </>
        ))}

        {/* Nueva dirección temporal */}
        {newAddress && (
          <Box
            key="new"
            sx={{ display: "flex", alignItems: "center", mb: 1 }}
          >
            <Box sx={{ flexGrow: 1 }}>
              {["street", "city", "zip", "country"].map((field) => (
                <TextField
                  key={field}
                  variant="standard"
                  value={formValues["new"]?.[field] ?? ""}
                  onChange={(e) => handleEdit("new", field, e.target.value)}
                  sx={{ mr: 1, width: "100px" }}
                  placeholder={field}
                  autoFocus={field === "street"} // foco en la primera
                />
              ))}
            </Box>
            <IconButton onClick={() => handleSave("new")}>
              <Save />
            </IconButton>
            <IconButton onClick={() => setNewAddress(null)}>
              <Close />
            </IconButton>
          </Box>
        )}


        {/* Botón para añadir dirección (solo visible si no hay form abierto) */}
        {!newAddress && (
          <Button
            startIcon={<Add />}
            variant="contained"
            fullWidth
            onClick={handleAdd}
          >
            Añadir dirección
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
