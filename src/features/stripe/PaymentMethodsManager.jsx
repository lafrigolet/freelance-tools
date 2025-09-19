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


function PaymentMethodsManager({ customerId }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultMethod, setDefaultMethod] = useState(null);
  const [adding, setAdding] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  // Load methods
  useEffect(() => {
    (async () => {
      const res = await listPaymentMethods({ customerId });
      setPaymentMethods(res.data.paymentMethods.data);
      // Extract default method
      // Ideally fetch from customer object, but simplified here
    })();
  }, [customerId]);

  // Start add flow
  const startAddPaymentMethod = async () => {
    const res = await createSetupIntent({ customerId });
    setClientSecret(res.data.clientSecret);
    setAdding(true);
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
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
                  onClick={() => setDefaultPaymentMethod({ customerId, paymentMethodId: pm.id })}
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
            customerId={customerId}
            onComplete={() => {
              setAdding(false);
              setClientSecret(null);
            }}
          />
        </Elements>
      )}
    </Box>
  );
}

// Sub-component for adding
function AddPaymentMethodForm({ customerId, onComplete }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (error) {
      console.error(error.message);
    } else {
      console.log("Saved:", setupIntent.payment_method);
      onComplete();
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6">Add New Payment Method</Typography>
        <form onSubmit={handleSubmit}>
          <Box mt={2} mb={2}>
            <PaymentElement />
          </Box>
          <Button type="submit" variant="contained" disabled={!stripe}>
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default PaymentMethodsManager;
