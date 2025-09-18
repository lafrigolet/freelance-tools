import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";

// === Helpers para llamar a Cloud Functions ===
export const getAllPaymentMethods      = httpsCallable(functions, "getAllPaymentMethods");
export const addPaymentMethod          = httpsCallable(functions, "addPaymentMethod");
export const deletePaymentMethod       = httpsCallable(functions, "deletePaymentMethod");
export const setPreferredPaymentMethod = httpsCallable(functions, "setPreferredPaymentMethod");

