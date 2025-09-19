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

export const createPaymentIntent     = httpsCallable(functions, "createPaymentIntent");
export const listPaymentMethods      = httpsCallable(functions, "listPaymentMethods");
export const setDefaultPaymentMethod = httpsCallable(functions, "setDefaultPaymentMethod");
export const createSetupIntent       = httpsCallable(functions, "createSetupIntent");

