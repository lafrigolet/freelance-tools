import { functions } from '../../firebase';
import {
  httpsCallable,
} from "firebase/functions";

////// Firebase Functions Wrapping
const createOrder = httpsCallable(functions, "createOrder");

export {
  createOrder
};
