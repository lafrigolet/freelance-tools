import React, { useEffect, useState } from "react";

import { Button, Paper, Typography, Box } from "@mui/material";

import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";

import { stripePromise, createPaymentIntent } from './stripe';


export default function Stripe() {
  const [clientSecret, setClientSecret] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/success" },
    });

    if (error) {
      console.error("Payment failed:", error.message);
    }
  };

  useEffect(() => {
    const makePaymentIntent = async () => {
      try {
        const res = await createPaymentIntent({ amount: 500, currency: "eur" }); // example: €5.00
        console.log(res);
        setClientSecret(res.data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    };
    
    makePaymentIntent();
  }, []);

  if (!clientSecret) return <p>Loading checkout…</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <Paper
        elevation={3}
        sx={{ maxWidth: 600, minWidth: 400, mx: "auto", mt: 4, p: 3, borderRadius: 2 }}
      >
        <Typography variant="h6" gutterBottom>
        Choose a payment method
        </Typography>
        
        <Box mb={3}>
          <PaymentElement />
        </Box>
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!stripe}
          onClick={handleSubmit}
        >
          Pay
        </Button>
      </Paper>
    </Elements>
  );
}
