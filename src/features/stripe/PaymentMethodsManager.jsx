import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
} from "@mui/material";

import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import {
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";

import {
  listPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  createCustomerSubscription,
  stripePromise,
} from "./stripe";

import { cardBrandLogo } from './cardBrandLogo';

import { useAuthContext } from "../auth/AuthContext";

import AddPaymentMethod from './AddPaymentMethod';

function PaymentMethodsManagerElement({ priceId }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultMethod, setDefaultMethod] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, pmId: null });
  const [loading, setLoading] = useState(false);
  const [loadingPayId, setLoadingPayId] = useState(null);
  const [loadingDefaultId, setLoadingDefaultId] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const { userData } = useAuthContext();
  const [message, setMessage] = useState();
  const [severity, setSeverity] = useState("success");
  const elements = useElements();
  const stripe = useStripe();
  
  // Load methods
  useEffect(() => {
    (async () => {
      console.log("stripeUID ", userData.stripeUID);
      try {
        if (!userData.stripeUID) return;
        const res = await listPaymentMethods({ stripeUID: userData.stripeUID});
        setPaymentMethods(res.data.paymentMethods.data);
        setDefaultMethod(res.data.defaultPaymentMethod); // ✅ fetch from Stripe
      } catch (error) {
        console.log("Error ", error.message);
      }
    })();
  }, [userData.stripeUID]);


  const handlePay = async (pmId) => {
    setLoadingPayId(pmId);
    try {
      if (!stripe || !elements) throw new Error("Internal Error, reload and try again");
      const res = await createCustomerSubscription( {  stripeUID: userData.stripeUID, priceId, pmId });

      const { error, paymentIntent } = await stripe.confirmCardPayment(res.data?.clientSecret);

      if (error) {
        throw new Error(error.message);
      } else if (paymentIntent.status === "succeeded") {
        setMessage("Payment succeeded, subscription active!");
        setSeverity("success");
        console.log("Payment succeeded, subscription active!");
      }

    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setSeverity("error");
    } finally {
      setLoadingPayId(null);
    }
  };

  const handleSetDefault = async (pmId) => {
    setLoadingDefaultId(pmId);
    try {
      await setDefaultPaymentMethod({ stripeUID: userData.stripeUID, paymentMethodId: pmId });
      // ✅ Re-fetch methods so UI is always consistent
      const res = await listPaymentMethods({ stripeUID: userData.stripeUID });
      setPaymentMethods(res.data.paymentMethods.data);
      setDefaultMethod(res.data.defaultPaymentMethod);
    } finally {
      setLoadingDefaultId(null);
    }
  };

  const handleDelete = async (pmId) => {
    setDeleteDialog({ open: true, pmId });
  };

  useEffect(() => {
    console.log("priceId changed");
    if (!priceId) return;

    // Do whatever needs to happen when clientSecret changes
    console.log("priceId changed:", priceId);

    // maybe initialize SDK, fetch data, reset state, etc.
  }, [priceId]);
  
  
  return (
    <>
      <Card sx={{ maxWidth: 600, minWidth: 500, mx: "auto", mt: 4, borderRadius: 2, padding: 2}}>
        <Typography variant="h5" gutterBottom>
          My Payment Methods
        </Typography>
        {message && <Alert severity={severity} role="status">{message}</Alert>}
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
                    {loadingDefaultId === pm.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <StarIcon />
                    )}
                  </IconButton>
                )}

                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => {setDeleteDialog({ open: true, pmId: pm.id });}}
                >
                  <DeleteIcon />
                </IconButton>

                {priceId && (
                <Button
                  variant="contained"
                  size="small"
                  disabled={loadingPayId === pm.id}
                  onClick={() => handlePay(pm.id)}
                  sx={{ ml: 1 }}
                >
                  {loadingPayId === pm.id ? (
                    <CircularProgress size={20} />
                  ) : (
                    "Subscribe"
                  )}
                </Button>
                )}
                
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <AddPaymentMethod
          onComplete={
            async () => {
              try {
                const res = await listPaymentMethods({ stripeUID: userData.stripeUID });
                setPaymentMethods(res.data.paymentMethods.data);
                setDefaultMethod(res.data.defaultPaymentMethod);
              } finally {
                setLoading(false);
              }
            }
          }
        />
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
          {loadingDelete ? (
            <CircularProgress size={20} />
          ) : (
            <Button
              color="error"
              onClick={async () => {
                setLoadingDelete(true);
                try {
                  await deletePaymentMethod({ paymentMethodId: deleteDialog.pmId });
                  const res = await listPaymentMethods({ stripeUID: userData.stripeUID });
                  setPaymentMethods(res.data.paymentMethods.data);
                  setDefaultMethod(res.data.defaultPaymentMethod);
                } finally {
                  setDeleteDialog({ open: false, pmId: null });
                  setLoadingDelete(false);
                }
              }}
            >
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function PaymentMethodsManager({ priceId }) {
  return (
    <Elements stripe={stripePromise} >
      <PaymentMethodsManagerElement priceId={priceId} />
    </Elements>
  );
}

