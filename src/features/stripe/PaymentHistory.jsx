import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { listPaymentHistory } from "./stripe"; // 👈 your Firebase callable

import { useAuthContext } from "../auth/AuthContext";

function PaymentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuthContext();
  const stripeUID = userData?.stripeUID;

  useEffect(() => {
    if (!stripeUID) return;

    (async () => {
      try {
        const res = await listPaymentHistory({ stripeUID });
        setHistory(res.data.history);
      } catch (err) {
        console.error("Error fetching payment history:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [stripeUID]);

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Payments
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : history.length === 0 ? (
          <Typography color="text.secondary">No payments found</Typography>
        ) : (
          <List>
            {history.map((pi) => {
              const charge = pi.charges?.data[0];
              const card = charge?.payment_method_details?.card;

              return (
                <ListItem key={pi.id}>
                  <ListItemText
                    primary={`Paid ${(pi.amount / 100).toFixed(2)} ${pi.currency.toUpperCase()}`}
                    secondary={
                      card
                        ? `Card •••• ${card.last4} — ${new Date(
                            pi.created * 1000
                          ).toLocaleDateString()}`
                        : new Date(pi.created * 1000).toLocaleDateString()
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentHistory;
