import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
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
  createSetupIntent
} from "./stripe";

import { useAuthContext } from "../auth/AuthContext";

function PaymentMethodsManager() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultMethod, setDefaultMethod] = useState(null);
  const [adding, setAdding] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const { userData } = useAuthContext();
  const stripeUID = userData.stripeUID;

  console.log("stripeUID---------------- ", stripeUID);
  // Load methods
  useEffect(() => {
    (async () => {
      console.log("stripeUID+++++++++++++++ ", stripeUID);
      const res = await listPaymentMethods({ stripeUID });
      setPaymentMethods(res.data.paymentMethods.data);
      // Extract default method
      // Ideally fetch from customer object, but simplified here
    })();
  }, [stripeUID]);

  // Start add flow
  const startAddPaymentMethod = async () => {
    const res = await createSetupIntent({ stripeUID });
    setClientSecret(res.data.clientSecret);
    setAdding(true);
  };

  return (
    <Card sx={{ maxWidth: 600, minWidth: 400, mx: "auto", mt: 4, borderRadius: 2, padding: 2}}>
      <Typography variant="h5" gutterBottom>
        My Payment Methods
      </Typography>

      <List>
        {paymentMethods.map((pm) => (
          <ListItem key={pm.id}>
            <ListItemText
              primary={`${pm.card.brand.toUpperCase()} •••• ${pm.card.last4}`}
              secondary={`Expires ${pm.card.exp_month}/${pm.card.exp_year}`}
            />
            <ListItemSecondaryAction>
              {pm.id === defaultMethod ? (
                <StarIcon color="primary" />
              ) : (
                <IconButton
                  edge="end"
                  aria-label="make default"
                  onClick={() => setDefaultPaymentMethod({ stripeUID, paymentMethodId: pm.id })}
                >
                  <StarIcon />
                </IconButton>
              )}
              <IconButton edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Box mt={2}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={startAddPaymentMethod}
        >
          Add Payment Method
        </Button>
      </Box>

      {adding && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <AddPaymentMethodForm
            stripeUID={stripeUID}
            onComplete={() => {
              setAdding(false);
              setClientSecret(null);
            }}
          />
        </Elements>
      )}
    </Card>
  );
}

// Sub-component for adding
function AddPaymentMethodForm({ stripeUID, onComplete }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = React.useState(null);

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
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6">Add New Payment Method</Typography>
        <form onSubmit={handleSubmit}>
          <Box mt={2} mb={2}>
            {clientSecret && <PaymentElement />}
          </Box>
          <Button type="submit" variant="contained" disabled={!stripe || !clientSecret}>
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default PaymentMethodsManager;
