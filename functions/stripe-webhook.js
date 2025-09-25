// functions/stripeWebhooks.js
import { onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";
import { getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";

const STRIPE_SECRET = defineSecret("STRIPE_SECRET");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");

export const stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET, STRIPE_WEBHOOK_SECRET] },
  async (req, res) => {
    const stripe = new Stripe(STRIPE_SECRET.value());
    const db = getFirestore();

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        STRIPE_WEBHOOK_SECRET.value()
      );
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      //
      // SUBSCRIPTIONS
      //
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const customer = await stripe.customers.retrieve(customerId);
        const firebaseUID = customer.metadata.firebaseUID;

        if (!firebaseUID) break;

        await db
          .collection("users")
          .doc(firebaseUID)
          .collection("subscriptions")
          .doc(subscription.id)
          .set({
            id: subscription.id,
            status: subscription.status,
            items: subscription.items.data.map((i) => ({
              price: i.price.id,
              quantity: i.quantity,
            })),
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at,
            created: subscription.created,
          });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const customer = await stripe.customers.retrieve(customerId);
        const firebaseUID = customer.metadata.firebaseUID;

        if (firebaseUID) {
          await db
            .collection("users")
            .doc(firebaseUID)
            .collection("subscriptions")
            .doc(subscription.id)
            .update({
              status: "canceled",
              canceled_at: subscription.canceled_at,
            });
        }
        break;
      }

      //
      // INVOICES
      //
      case "invoice.created":
      case "invoice.finalized":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const customer = await stripe.customers.retrieve(customerId);
        const firebaseUID = customer.metadata.firebaseUID;

        if (!firebaseUID) break;

        await db
          .collection("users")
          .doc(firebaseUID)
          .collection("invoices")
          .doc(invoice.id)
          .set(
            {
              id: invoice.id,
              amount_due: invoice.amount_due,
              amount_paid: invoice.amount_paid,
              amount_remaining: invoice.amount_remaining,
              currency: invoice.currency,
              status: invoice.status,
              created: invoice.created,
              hosted_invoice_url: invoice.hosted_invoice_url,
              invoice_pdf: invoice.invoice_pdf,
              subscription: invoice.subscription,
              payment_intent: invoice.payment_intent,
            },
            { merge: true } // don’t overwrite everything on updates
          );

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);
