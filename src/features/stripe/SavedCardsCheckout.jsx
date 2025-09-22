import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  listPaymentMethods,
  payWithSavedCard,
} from "./stripe"; // callable wrappers

import { cardBrandLogo } from './cardBrandLogo';

import { useAuthContext } from "../auth/AuthContext";

function getCardLogo(brand) {
  switch (brand.toLowerCase()) {
    case "visa":
      return "/card-logos/visa.svg";
    case "mastercard":
      return "/card-logos/mastercard.svg";
    case "amex":
      return "/card-logos/amex.svg";
    default:
      return "/card-logos/generic-card.svg";
  }
}

export default function SavedCardsCheckout({ amount, currency = "eur" }) {
  const { userData } = useAuthContext();
  const [cards, setCards] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await listPaymentMethods({ stripeUID: userData.stripeUID });
      setCards(res.data.paymentMethods.data);
    })();
  }, [userData.stripeUID]);

  const handlePay = async (pmId) => {
    setLoadingId(pmId);
    try {
      await payWithSavedCard({
        customerId: userData.stripeUID,
        paymentMethodId: pmId,
        amount,
        currency,
      });
      setMessage("Payment successful!");
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, minWidth:400, mx: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pay with a Saved Card
        </Typography>
        <List>
          {cards.map((pm) => (
            <ListItem key={pm.id}>
              {cardBrandLogo(pm.card.brand)}
              <ListItemText
                primary={`${pm.card.brand.toUpperCase()} •••• ${pm.card.last4}`}
                secondary={`Expires ${pm.card.exp_month}/${pm.card.exp_year}`}
              />
              <ListItemSecondaryAction>
                <Button
                  variant="contained"
                  size="small"
                  disabled={loadingId === pm.id}
                  onClick={() => handlePay(pm.id)}
                >
                  {loadingId === pm.id ? (
                    <CircularProgress size={20} />
                  ) : (
                    "Pay"
                  )}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        onClose={() => setMessage(null)}
      >
        <Alert severity={message?.startsWith("Error") ? "error" : "success"}>
          {message}
        </Alert>
      </Snackbar>
    </Card>
  );
}
