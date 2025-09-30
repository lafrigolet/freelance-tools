// src/features/stripe/CustomerSubscriptionsManager.jsx
import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogContent,
  TextField,
  Typography,
  Grid,
} from "@mui/material";

import { useAuthContext } from "../auth/AuthContext";

import {
  listSubscriptions,
  createCustomerSubscription,
  cancelCustomerSubscription,
  listUserSubscriptions,
} from "./stripe"; // wrappers for Firebase functions

import ConsentDialog from './ConsentDialog';
import PaymentMethodsManager from './PaymentMethodsManager';

export default function CustomerSubscriptionsManager() {
  const { userData } = useAuthContext();
  const stripeUID = userData?.stripeUID;

  const [plans, setPlans] = useState([]);
  const [userSubs, setUserSubs] = useState([]);
  const [openConsentDialog, setOpenConsentDialog] = useState(null);
  const [openPaymentMethodsManager, setOpenPaymentMethodsManager] = useState(null);
  const [priceId, setPriceId] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchUserSubscriptions();
  }, [stripeUID]);

  async function fetchPlans() {
    const res = await listSubscriptions();
    const sorted = res.data.products.sort((a, b) => a.order - b.order);
    setPlans(sorted);
  }

  async function fetchUserSubscriptions() {
    if (!stripeUID) return;
    const res = await listUserSubscriptions({ stripeUID, status: "active" });
    setUserSubs(res.data.subscriptions);
  }

  const isSubscribed = (planId) =>
        {
          userSubs.some((s) => s.plan.product === planId && s.status === "active");
        };

  const handleSubscribe = async (plan) => {
    // cancel all active subs in parallel
    await Promise.all(
      userSubs
        .filter((s) => s.status === "active")
        .map((s) =>
          cancelCustomerSubscription({ stripeUID, subscriptionId: s.id })
        )
    );
    await createCustomerSubscription({ stripeUID: userData.stripeUID, priceId: plan.priceId });
    await fetchUserSubscriptions();
  };

  const handleCancel = async (subId) => {
    await cancelCustomerSubscription({ stripeUID, subscriptionId: subId });
    await fetchUserSubscriptions();
  };

  return (
    <>
      <Box maxWidth={900} mx="auto" mt={4}>
        <Typography variant="h4" gutterBottom>
          Available Subscription Plans
        </Typography>

        <Grid container spacing={2}>
          {plans
           .filter((plan) => plan.active) // show only active
           .map((plan) => {
             const activeSub = userSubs.find(
               (s) => s.plan.product === plan.id && s.status === "active"
             );
             
             return (
               <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.id}>
                 <Card
                   sx={{
                     borderRadius: 3,
                     p: 2,
                     boxShadow: 3,
                     border: activeSub ? "2px solid #1976d2" : "1px solid #e0e0e0",
                     backgroundColor: activeSub ? "#f0f8ff" : "white",
                   }}
                 >
                   <CardContent>
                     <Typography variant="h6" gutterBottom>
                       {plan.name}
                     </Typography>
                     <Typography
                       variant="h4"
                       color="primary"
                       sx={{ my: 1 }}
                     >
                       {plan.amount}
                       {plan.currency.toUpperCase()}/{plan.interval}
                     </Typography>
                     <Typography
                       variant="body2"
                       color="text.secondary"
                       sx={{ whiteSpace: "pre-line" }}
                     >
                       {plan.description}
                     </Typography>
                   </CardContent>
                   <CardActions sx={{ justifyContent: "center" }}>
                     {activeSub ? (
                       <Button
                         variant="outlined"
                         color="error"
                         onClick={() => handleCancel(activeSub.id)}
                       >
                         Cancel
                       </Button>
                     ) : (
                       <Button
                         variant="contained"
                         onClick={() => {
                           console.log(plan.priceId);
                           setOpenPaymentMethodsManager(true);
                           setPriceId(plan.priceId);
                         }}
                       >
                         Subscribe
                       </Button>
                     )}
                   </CardActions>
                 </Card>
               </Grid>
             );
           })}
        </Grid>
      </Box>
      <ConsentDialog
        open={openConsentDialog}
        onClose={() => setOpenConsentDialog(false)}
        onAccept={() => setOpenPaymentMethodsManager(true)}
      />

      <Dialog
        open={openPaymentMethodsManager}
        onClose={() => setOpenPaymentMethodsManager(false)}
      >
        <DialogContent>
          <PaymentMethodsManager
            priceId={priceId}
          />
        </DialogContent>
      </Dialog>
    </>

  );
}
