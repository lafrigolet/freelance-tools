import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress
} from "@mui/material";
import { createOrder } from './getnet';

const CheckoutForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call Firebase Function with the amount
      const result = await createOrder({
        amount: formData.amount,
        // you can also send an orderId if you generate one client-side
      });

      const data = result.data;

      // Build hidden form with TPV parameters
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.redirectUrl;

      form.innerHTML = `
        <input type="hidden" name="Ds_SignatureVersion" value="${data.signatureVersion}" />
        <input type="hidden" name="Ds_MerchantParameters" value="${data.merchantParams}" />
        <input type="hidden" name="Ds_Signature" value="${data.signature}" />
      `;

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
      alert("Something went wrong with the payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, margin: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Checkout
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Amount (€)"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Pay with Getnet"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CheckoutForm;
