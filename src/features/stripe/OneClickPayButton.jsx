import React, { useState } from "react";
import { Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { oneClickPayment } from "./stripe"; // your callable wrapper
import { useAuthContext } from "../auth/AuthContext";

export default function OneClickPayButton({ amount, currency = "eur" }) {
  const { userData } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await oneClickPayment({
        customerId: userData.stripeUID,
        amount,
        currency,
      });
      setMessage("Payment successful!");
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handlePay}
        disabled={loading}
        fullWidth
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Pay with Default Card"}
      </Button>
      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        onClose={() => setMessage(null)}
      >
        <Alert severity={message?.startsWith("Error") ? "error" : "success"}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
