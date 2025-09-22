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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CreditCardIcon from "@mui/icons-material/CreditCard";

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

import { useAuthContext } from "../auth/AuthContext";

const cardBrandLogo = (brand) => {
  switch (brand) {
  case "visa":
    return <img src="/card-logos/visa.svg" alt="Visa" style={{ height: 24, marginRight: 12 }} />;
  case "mastercard":
    return <img src="/card-logos/mastercard.svg" alt="Mastercard" style={{ height: 24, marginRight: 12 }} />;
  case "amex":
    return <img src="/card-logos/amex.svg" alt="Amex" style={{ height: 24, marginRight: 12 }} />;
  default:
    return <CreditCardIcon fontSize="small" style={{ height: 24, marginRight: 12 }} />; // fallback to MUI icon
  }
};

function PaymentMethodsManager() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultMethod, setDefaultMethod] = useState(null);
  const [adding, setAdding] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, pmId: null });
  const { userData } = useAuthContext();
  const stripeUID = userData.stripeUID;
  
  // Load methods
  useEffect(() => {
    (async () => {
      const res = await listPaymentMethods({ stripeUID });
      setPaymentMethods(res.data.paymentMethods.data);
      setDefaultMethod(res.data.defaultPaymentMethod); // ✅ fetch from Stripe
    })();
  }, [stripeUID]);

  const handleSetDefault = async (pmId) => {
    await setDefaultPaymentMethod({ stripeUID, paymentMethodId: pmId });
    // ✅ Re-fetch methods so UI is always consistent
    const res = await listPaymentMethods({ stripeUID });
    setPaymentMethods(res.data.paymentMethods.data);
    setDefaultMethod(res.data.defaultPaymentMethod);
  };

  const handleDelete = async (pmId) => {
    setDeleteDialog({ open: true, pmId });
  };
  
  // Start add flow
  const startAddPaymentMethod = async () => {
    const res = await createSetupIntent({ stripeUID });
    setClientSecret(res.data.clientSecret);
    setAdding(true);
  };

  return (
    <>
      <Card sx={{ maxWidth: 600, minWidth: 400, mx: "auto", mt: 4, borderRadius: 2, padding: 2}}>
        <Typography variant="h5" gutterBottom>
          My Payment Methods
        </Typography>

        <List>
          {paymentMethods.map((pm) => (
            <ListItem key={pm.id}>
              {cardBrandLogo(pm.card.brand)}
              <ListItemText
                primary={`${pm.card.brand.toUpperCase()} •••• ${pm.card.last4}`}
                secondary={`Expires ${pm.card.exp_month}/${pm.card.exp_year}`}
              />
              <ListItemSecondaryAction>
                {pm.id === defaultMethod ? (
                  <Chip label="Default" color="primary" size="small" />
                ) : (
                  <IconButton
                    edge="end"
                    aria-label="make default"
                    onClick={() => handleSetDefault(pm.id)}
                  >
                    <StarIcon />
                  </IconButton>
                )}
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => {setDeleteDialog({ open: true, pmId: pm.id });}}
                >
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
              onComplete={async () => {
                setAdding(false);
                setClientSecret(null);
                const res = await listPaymentMethods({ stripeUID });
                setPaymentMethods(res.data.paymentMethods.data);
                setDefaultMethod(res.data.defaultPaymentMethod);
              }}
            />
          </Elements>
        )}
      </Card>

      {/* Dialog component */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, pmId: null })}>
        <DialogTitle>Delete Payment Method</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this card? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, pmId: null })}>Cancel</Button>
          <Button
            color="error"
            onClick={async () => {
              await deletePaymentMethod({ paymentMethodId: deleteDialog.pmId });
              const res = await listPaymentMethods({ stripeUID });
              setPaymentMethods(res.data.paymentMethods.data);
              setDefaultMethod(res.data.defaultPaymentMethod);
              setDeleteDialog({ open: false, pmId: null });
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
