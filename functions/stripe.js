import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";

// Store secret: firebase functions:secrets:set STRIPE_SECRET
const STRIPE_SECRET = defineSecret("STRIPE_SECRET");

export const createCustomer = onCall({ secrets: [STRIPE_SECRET] }, async ({ auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");
  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());
  
  const customer = await stripe.customers.create({
    email: auth.token?.email,
  });

  if (!customer)
    throw new HttpsError("Cant create stripe customer");
  
  return { stripeUID: customer.id };
});

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

  return { stripeUID: customer.id };
});


export const createPaymentIntent = onCall({ secrets: [STRIPE_SECRET] }, async ({ data }) => {
  // init Stripe inside the function so it reads the secret at runtime
  const stripe = new Stripe(STRIPE_SECRET.value());
  
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


export const createSetupIntent = onCall({ secrets: [STRIPE_SECRET] }, async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  if (!data.stripeUID)
    throw new HttpsError("invalid-argument", "Missing stripeUID");
  
  const setupIntent = await stripe.setupIntents.create({
    customer: data.stripeUID,
    payment_method_types: ["card"], // can extend later
  });

  return { clientSecret: setupIntent.client_secret };
});


export const listPaymentMethods = onCall({ secrets: [STRIPE_SECRET] }, async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");
  
  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  if (!data.stripeUID) 
    throw new HttpsError("invalid-argument", "Missing stripeUID (Stripe customer ID)");

  // Fetch customer with invoice_settings
  const customer = await stripe.customers.retrieve(data.stripeUID);
  
  const paymentMethods = await stripe.paymentMethods.list({
    customer: data.stripeUID,
    type: "card", // extend later if needed
  });

  return {
    paymentMethods,
    defaultPaymentMethod: customer.invoice_settings.default_payment_method || null,
  };
});


export const setDefaultPaymentMethod = onCall({ secrets: [STRIPE_SECRET] }, async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  await stripe.customers.update(data.stripeUID, {
    invoice_settings: {
      default_payment_method: data.paymentMethodId
    },
  });

  return { success: true };
});


// functions/paymentMethods.js
export const deletePaymentMethod = onCall({ secrets: [STRIPE_SECRET] },  async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  // Detach the payment method from the customer
  const deleted = await stripe.paymentMethods.detach(data.paymentMethodId);
  
  return { deleted };
  }
);


// functions/paymentHistory.js
export const listPaymentHistory = onCall({ secrets: [STRIPE_SECRET] }, async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  const paymentIntents = await stripe.paymentIntents.list({
    customer: data.stripeUID,
    limit: 5,
  });
  return { history: paymentIntents.data };
});


// functions/oneClickPayment.js
export const oneClickPayment = onCall({ secrets: [STRIPE_SECRET] }, async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  try {
    const { customerId, amount, currency } = data;

    // Get default payment method for this customer
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPM = customer.invoice_settings?.default_payment_method;

    if (!defaultPM) {
      throw new HttpsError("failed-precondition", "No default payment method set");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method: defaultPM,
      off_session: true,
      confirm: true, // auto-confirm without user input
    });

    return { success: true, paymentIntentId: paymentIntent.id };
  } catch (error) {
    console.error("Error in oneClickPayment:", error);
    throw new HttpsError("internal", error.message);
  }
});

// functions/payWithSavedCard.js
export const payWithSavedCard = onCall({ secrets: [STRIPE_SECRET] }, async ({ data, auth }) => {
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const stripe = new Stripe(process.env.STRIPE_SECRET || STRIPE_SECRET.value());

  try {
    const { customerId, paymentMethodId, amount, currency } = data;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
    });

    return { success: true, paymentIntentId: paymentIntent.id };
  } catch (error) {
    console.error("Error in payWithSavedCard:", error);
    throw new HttpsError("internal", error.message);
  }
});
