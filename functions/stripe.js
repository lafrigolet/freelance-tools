import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";

// Store secret: firebase functions:secrets:set STRIPE_SECRET
const STRIPE_SECRET = defineSecret("STRIPE_SECRET");

export const createCustomer = async ({ email }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());
  
  const customer = await stripe.customers.create({
    email: email,
  });

  if (!customer)
    throw new HttpsError("Cant create stripe customer");
  
  return customer;
}

export const createOrGetCustomer = onCall({ secrets: [STRIPE_SECRET] }, async ({ auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  // For demo, use Firebase UID as metadata
  const customers = await stripe.customers.list({ email: auth.token?.email, limit: 1 });

  let customer;
  if (customers.data.length > 0) {
    customer = customers.data[0];
  } else {
    customer = await stripe.customers.create({
      email: auth.token.email,
      metadata: { firebaseUID: auth.uid },
    });
  }

  return { customerId: customer.id };
});


export const createPaymentIntent = onCall({ secrets: [STRIPE_SECRET] }, async ({ data }) => {
  // init Stripe inside the function so it reads the secret at runtime
  const stripe = new Stripe(STRIPE_SECRET.value());
  console.log("STRIPE SECRET ", stripe);
  
  try {
    const { amount, currency } = data;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    throw new HttpsError("internal", error.message);
  }
});


// functions/setupIntent.js
export const createSetupIntent = onCall({ secrets: [STRIPE_SECRET] }, async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  const setupIntent = await stripe.setupIntents.create({
    customer: data.customerId,
    payment_method_types: ["card"], // can extend later
  });

  return { clientSecret: setupIntent.client_secret };
});

// functions/paymentMethods.js
export const listPaymentMethods = onCall({ secrets: [STRIPE_SECRET] }, async ({ data }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  const paymentMethods = await stripe.paymentMethods.list({
    customer: data.customerId,
    type: "card", // extend later if needed
  });

  return { paymentMethods };
});

export const setDefaultPaymentMethod = onCall({ secrets: [STRIPE_SECRET] }, async ({ data }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  await stripe.customers.update(data.customerId, {
    invoice_settings: { default_payment_method: data.paymentMethodId },
  });

  return { success: true };
});
