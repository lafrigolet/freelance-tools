import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import {
  useStripe,
  useElements,
  PaymentElement,
  Elements
} from "@stripe/react-stripe-js";

import {
  stripePromise,
  listPaymentMethods,
  setDefaultPaymentMethod,
  createSetupIntent,
  deletePaymentMethod,
} from "./stripe";

import { cardBrandLogo } from './cardBrandLogo';

import { useAuthContext } from "../auth/AuthContext";

export default function AddPaymentMethod({ onComplete }) {
  const [adding, setAdding] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const { userData } = useAuthContext();
  
  // Start add flow
  const startAddPaymentMethod = async () => {
    const res = await createSetupIntent({ stripeUID: userData.stripeUID });
    setClientSecret(res.data.clientSecret);
    setAdding(true);
  };

  return (
    <>
      {adding && clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <AddPaymentMethodForm
            stripeUID={userData.stripeUID}
            onComplete={async () => {
              setAdding(false);
              setClientSecret(null);
              onComplete?.();
            }}
          />
        </Elements>
      ) : (
        <Box mt={2}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={startAddPaymentMethod}
          >
            Add Payment Method
          </Button>
        </Box>
      )
      }
    </>
  );
}

// Sub-component for adding
function AddPaymentMethodForm({ stripeUID, onComplete }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = React.useState(null);
  const [loading, setLoading] = useState(false);

  // Get client_secret from Firebase function
  useEffect(() => {
    async function fetchSetupIntent() {
      const res = await createSetupIntent({ stripeUID });
      setClientSecret(res.data.clientSecret);
    }
    fetchSetupIntent();
  }, [stripeUID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    try {
      // ✅ First validate the PaymentElement inputs
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Validation error:", submitError.message);
        return;
      }
      
      // ✅ Then confirm setup
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        redirect: "if_required", // avoids full page redirect unless needed
      });
      
      if (error) {
        console.error("Confirmation error:", error.message);
      } else {
        console.log("Saved payment method:", setupIntent.payment_method);
        onComplete?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6">Add New Payment Method</Typography>
        <form onSubmit={handleSubmit}>
          <Box mt={2} mb={2}>
            {clientSecret && <PaymentElement />}
          </Box>
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <Button type="submit" variant="contained" disabled={!stripe || !clientSecret}>
              Save
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
