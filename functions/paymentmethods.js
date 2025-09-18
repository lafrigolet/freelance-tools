import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import axios from "axios";

const GETNET_BASE = "https://apisandbox.getnet.com"; // Sandbox
const API_KEY = process.env.GETNET_API_KEY || 
      process.env.FIREBASE_CONFIG?.getnet?.api_key;
const API_SECRET = process.env.GETNET_API_SECRET || 
      process.env.FIREBASE_CONFIG?.getnet?.api_secret;

// === Helper: obtener token de acceso Getnet ===
async function getAccessToken() {
  const resp = await axios.post(
    `${GETNET_BASE}/auth/oauth/v2/token`,
    "scope=oob&grant_type=client_credentials",
    {
      auth: { username: API_KEY, password: API_SECRET },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return resp.data.access_token;
}

// === Add Payment Method ===
export const addPaymentMethod = onCall(async ({ auth, data }) => {
  try {
    const uid = auth?.uid;

    if (!uid)
      throw new Error("Usuario no autenticado");
    
    const { card } = data;
    const db = getFirestore();
    // TODO when i have the credentials
    // card: { number, exp_month, exp_year, cvv }

    // const token = await getAccessToken();

    // const tokenResp = await axios.post(
    //   `${GETNET_BASE}/v1/tokens/card`,
    //   {
    //     card_number: card.number,
    //     expiration_month: card.exp_month,
    //     expiration_year: card.exp_year,
    //     security_code: card.cvv,
    //   },
    //   { headers: { Authorization: `Bearer ${token}` } }
    // );

    // const numberToken = tokenResp.data.number_token;
    const numberToken = "83674071263478126348712364278364876";
    
    const methodRef = db
      .collection("users")
      .doc(uid)
      .collection("payment_method")
      .doc();

    await methodRef.set({
      numberToken,
      // TODO when i have the credentials
      //      brand: tokenResp.data.brand || "unknown",
      brand: "Mi marca",
      last4: card.number.slice(-4),
      expiry_month: card.exp_month,
      expiry_year: card.exp_year,
      preferred: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, id: methodRef.id };
  } catch (err) {
    logger.error("Error addPaymentMethod:", err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
});

// === Delete Payment Method ===
export const deletePaymentMethod = onCall(async ({ auth, data }) => {
  try {
    const uid = auth?.uid;

    if (!uid) 
      throw new Error("Usuario no autenticado");
    
    const { methodId } = data;
    const db = getFirestore();

    await db
      .collection("users")
      .doc(uid)
      .collection("payment_method")
      .doc(methodId)
      .delete();

    return { success: true };
  } catch (err) {
    logger.error("Error deletePaymentMethod:", err.message);
    return { success: false, error: err.message };
  }
});

// === Set Preferred Payment Method ===
export const setPreferredPaymentMethod = onCall(async ({ auth, data }) => {
  try {
    const uid = auth?.uid;

    if (!uid) 
      throw new Error("Usuario no autenticado");
    
    const { methodId } = data;
    const db = getFirestore();

    const methodsRef = db
      .collection("users")
      .doc(uid)
      .collection("payment_method");

    // Quitar preferido de todos
    const snapshot = await methodsRef.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { preferred: doc.id === methodId });
    });
    await batch.commit();

    return { success: true };
  } catch (err) {
    logger.error("Error setPreferredPaymentMethod:", err.message);
    return { success: false, error: err.message };
  }
});

// === Get All Payment Methods ===
export const getAllPaymentMethods = onCall(async ({ auth, data }) => {
  try {
    const uid = auth?.uid;

    if (!uid) 
      throw new Error("Usuario no autenticado");

    const db = getFirestore();

    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("payment_method")
      .get();

    const methods = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, methods };
  } catch (err) {
    logger.error("Error getAllPaymentMethods:", err.message);
    return { success: false, error: err.message };
  }
});
