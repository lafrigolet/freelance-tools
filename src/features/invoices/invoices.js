import { httpsCallable } from "firebase/functions";

const emitInvoice = httpsCallable(functions, "emitInvoice");

export { emitInvoice };
