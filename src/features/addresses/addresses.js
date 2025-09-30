import {
  httpsCallable,
} from "firebase/functions";

import {
  app,
  auth,
  db,
  rtdb,
  storage,
  functions,
} from "../../firebase";

////// Firebase Functions Wrapping
export const listUsers          = httpsCallable(functions, "listUsers");
export const getAddresses       = httpsCallable(functions, "getAddresses");
export const addAddress         = httpsCallable(functions, "addAddress");
export const updateAddress      = httpsCallable(functions, "updateAddress");
export const deleteAddress      = httpsCallable(functions, "deleteAddress");
export const setDefaultAddress  = httpsCallable(functions, "setDefaultAddress");
