import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import { getFirestore } from "firebase-admin/firestore";

const STRIPE_SECRET = defineSecret("STRIPE_SECRET");

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value(), {
    apiVersion: "2024-06-20",
  });
}


/**
 * List subscriptions (read from Firestore for UI)
 */
export const listSubscriptions = onCall(async () => {
  const db = getFirestore();
  const snapshot = await db.collection("subscriptions").orderBy("order").get();
  const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return { products };
});

/**
 * Create subscription (Stripe + Firestore sync)
 */
export const createSubscription = onCall({ secrets: [STRIPE_SECRET] }, async ({ data }) => {
  const db = getFirestore();
  const stripe = getStripe();
  const { name, description, amount, currency, interval, order } = data;

  if (!name || !description || !amount || !currency || !interval || !order)
    throw new HttpsError("invalid-argument", "Missing required fields");

  const product = await stripe.products.create({
    name,
    description,
  });

  const price = await stripe.prices.create({
    unit_amount: amount,
    currency,
    recurring: { interval },
    product: product.id,
  });

  // Save in Firestore
  await db.collection("subscriptions").doc(product.id).set({
    name,
    description,
    priceId: price.id,
    amount,
    currency,
    interval,
    active: true,
    order,
  });

  return { product, price };
});

/**
 * Update subscription (Stripe + Firestore sync)
 */
/**
 * Update subscription (Stripe + Firestore sync)
 */
export const updateSubscription = onCall({ secrets: [STRIPE_SECRET] }, async ({ data }) => {
    const db = getFirestore();
    const stripe = getStripe();
    console.log("-------------", data);

  const { id:productId, name, description, active, amount, currency, interval } = data;
    if (!productId) throw new HttpsError("invalid-argument", "Missing productId");

    // Update product fields
    const product = await stripe.products.update(productId, {
      name,
      description,
      active,
    });

    let newPrice = null;
    if (amount && currency && interval) {
      // Create a new price (you cannot update an existing one)
      newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: amount,
        currency,
        recurring: { interval },
      });

      // Optionally: deactivate old prices
      const existingPrices = await stripe.prices.list({
        product: productId,
        active: true,
      });
      for (const price of existingPrices.data) {
        if (price.id !== newPrice.id) {
          await stripe.prices.update(price.id, { active: false });
        }
      }
    }

    // Update Firestore
    await db.collection("subscriptions").doc(productId).set(
      {
        name,
        description,
        active,
        amount,
        currency,
        interval,
        priceId: newPrice ? newPrice.id : data.priceId, // keep track of latest
      },
      { merge: true }
    );

    return { product, newPrice };
  }
);

/**
 * Delete subscription (soft delete: Stripe + Firestore)
 */
export const deleteSubscription = onCall({ secrets: [STRIPE_SECRET] }, async ({ data }) => {
  const db = getFirestore();
  const stripe = getStripe();
  const { productId } = data;
  if (!productId) throw new HttpsError("invalid-argument", "Missing productId");

  const deleted = await stripe.products.update(productId, { active: false });

  await db.collection("subscriptions").doc(productId).update({ active: false });

  return { deleted };
});

/**
 * Reorder subscriptions (Firestore only)
 */
export const reorderSubscriptions = onCall(async ({ data }) => {
  const db = getFirestore();
  const { orderedIds } = data;
  if (!orderedIds || !Array.isArray(orderedIds)) {
    throw new HttpsError("invalid-argument", "orderedIds array required");
  }

  const batch = db.batch();
  orderedIds.forEach((id, index) => {
    const ref = db.collection("subscriptions").doc(id);
    batch.update(ref, { order: index });
  });

  await batch.commit();
  return { success: true };
});


/**
 * Create a new subscription for a customer
 */
export const createCustomerSubscription = onCall({ secrets: [STRIPE_SECRET] }, async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const { stripeUID, priceId } = data;
  console.log("stripeUID, priceId ", stripeUID, priceId);
  if (!stripeUID || !priceId) {
    throw new HttpsError("invalid-argument", "Missing stripeUID or priceId");
  }

  const stripe = getStripe();

  try {
    const subscription = await stripe.subscriptions.create({
      customer: stripeUID,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    });

    // Save subscription under Firestore user
    const db = getFirestore();
    await db
      .collection("users")
      .doc(auth.uid)
      .collection("subscriptions")
      .doc(subscription.id)
      .set(subscription, { merge: true });

    return { subscription };
  } catch (err) {
    console.error("Error creating subscription", err);
    throw new HttpsError("internal", err.message);
  }
});

/**
 * Cancel a subscription
 */
export const cancelCustomerSubscription = onCall({ secrets: [STRIPE_SECRET] }, async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const { subscriptionId } = data;
  if (!subscriptionId) {
    throw new HttpsError("invalid-argument", "Missing subscriptionId");
  }

  const stripe = getStripe();

  try {
    const canceled = await stripe.subscriptions.cancel(subscriptionId);

    // Update Firestore
    const db = getFirestore();
    await db
      .collection("users")
      .doc(auth.uid)
      .collection("subscriptions")
      .doc(subscriptionId)
      .set(canceled, { merge: true });

    return { canceled };
  } catch (err) {
    console.error("Error canceling subscription", err);
    throw new HttpsError("internal", err.message);
  }
});

/**
 * List subscriptions for a user from Firestore
 */
export const listUserSubscriptions = onCall({ secrets: [STRIPE_SECRET] }, async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const { status } = data || {}; // optional filter
  const db = getFirestore();

  let query = db
      .collection("users")
      .doc(auth.uid)
      .collection("subscriptions");

  if (status) {
    query = query.where("status", "==", status);
  }

  const snap = await query.get();
  const subscriptions = snap.docs.map((doc) => doc.data());

  console.log("Subscriptions ------------", subscriptions);

  return { subscriptions };
});
