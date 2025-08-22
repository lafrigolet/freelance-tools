import {
  app,
  auth,
  db,
  rtdb,
  storage,
  functions,
} from "../../firebase";

import { httpsCallable } from "firebase/functions";

export const emitInvoice = httpsCallable(functions, "emitInvoice");

