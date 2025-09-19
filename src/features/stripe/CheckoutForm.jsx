import React, { useState } from "react";
import { Button, Typography, Box, Paper } from "@mui/material";


import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { stripePromise, createPaymentIntent } from './stripe';

function CheckoutForm() {
  const stripe = useStripe();       // comes from <Elements>
  const elements = useElements();   // also comes from <Elements>
  const [clientSecret, setClientSecret] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await createPaymentIntent({ amount: 500, currency: "usd" });
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      data.clientSecret,
      { payment_method: { card } }
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 900,
        minWidth: 400,
        mx: "auto",
        mt: 4,
        p: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>

      <Box
        sx={{
          border: "1px solid",
          borderColor: "grey.400",
          borderRadius: 1,
          p: 2,
          mb: 3,
        }}
      >
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#32325d",
                fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
                "::placeholder": { color: "#a0aec0" },
              },
              invalid: { color: "#fa755a" },
            },
          }}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={!stripe}
      >
        Pay
      </Button>
    </Paper>
  );
}

export default function Stripe() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
