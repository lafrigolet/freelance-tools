import {
  app,
  auth,
  db,
  rtdb,
  storage,
  functions,
} from "../../firebase";

import {
  httpsCallable,
} from "firebase/functions";

import { loadStripe } from "@stripe/stripe-js";


export const stripePromise = loadStripe("pk_test_51S8fp5PcpHhrfr8aox6DGnLvERK8yKJ4Rf7tbnMNs35bk4YOsJGwjVBvtN59omJ6R2WsZGn4nyaBKY5CGQ0TMH6T00jhAoIVPm");

// Firebase Functions Wrapppers ////////////////////////////////////////////////////////
export const createPaymentIntent     = httpsCallable(functions, "createPaymentIntent");
export const listPaymentHistory      = httpsCallable(functions, "listPaymentHistory");
export const oneClickPayment         = httpsCallable(functions, "oneClickPayment");
export const payWithSavedCard        = httpsCallable(functions, "payWithSavedCard");

export const listPaymentMethods      = httpsCallable(functions, "listPaymentMethods");
export const setDefaultPaymentMethod = httpsCallable(functions, "setDefaultPaymentMethod");
export const createSetupIntent       = httpsCallable(functions, "createSetupIntent");
export const deletePaymentMethod     = httpsCallable(functions, "deletePaymentMethod");

export const listSubscriptions       = httpsCallable(functions, "listSubscriptions ");
export const createSubscription      = httpsCallable(functions, "createSubscription");
export const updateSubscription      = httpsCallable(functions, "updateSubscription");
export const deleteSubscription      = httpsCallable(functions, "deleteSubscription");
export const reorderSubscriptions    = httpsCallable(functions, "reorderSubscriptions");

export const createCustomerSubscription = httpsCallable(functions, "createCustomerSubscription");
export const cancelCustomerSubscription = httpsCallable(functions, "cancelCustomerSubscription");
export const listUserSubscriptions      = httpsCallable(functions, "listUserSubscriptions");

///////////////////////////////////////////////////////////////////////////////////////


