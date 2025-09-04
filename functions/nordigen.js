import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import axios from "axios";

// Credenciales Nordigen (colócalas en Firebase Config o Secret Manager)
// firebase functions:config:set nordigen.secret_id="YOUR_SECRET_ID" nordigen.secret_key="YOUR_SECRET_KEY"
//const NORDIGEN_SECRET_ID = functions.config().nordigen.secret_id;
//const NORDIGEN_SECRET_KEY = functions.config().nordigen.secret_key;
const NORDIGEN_SECRET_ID = "";
const NORDIGEN_SECRET_KEY = "";

const NORDIGEN_BASE = "https://ob.gocardless.com/api/v2";

// 1. Obtener token de acceso
async function getAccessToken() {
  const resp = await axios.post(`${NORDIGEN_BASE}/token/new/`, {
    secret_id: NORDIGEN_SECRET_ID,
    secret_key: NORDIGEN_SECRET_KEY,
  });
  return resp.data.access;
}

// 2. Crear requisition (autorización del usuario con su banco)
export const createRequisition = functions.https.onCall(async (data, context) => {
  const access = await getAccessToken();

  const redirectUrl = "https://tuapp.com/redirect"; // URL de retorno después del login del banco
  const resp = await axios.post(
    `${NORDIGEN_BASE}/requisitions/`,
    {
      redirect: redirectUrl,
      institution_id: data.institutionId, // ID del banco elegido
    },
    { headers: { Authorization: `Bearer ${access}` } }
  );

  return resp.data; // Incluye el link para que el usuario se conecte a su banco
});

// 3. Obtener cuentas de un requisition
export const getAccounts = functions.https.onCall(async (data, context) => {
  const access = await getAccessToken();
  const resp = await axios.get(
    `${NORDIGEN_BASE}/requisitions/${data.requisitionId}/`,
    { headers: { Authorization: `Bearer ${access}` } }
  );
  return resp.data.accounts; // IDs de cuentas
});

// 4. Obtener transacciones de una cuenta
export const getTransactions = functions.https.onCall(async (data, context) => {
  const access = await getAccessToken();
  const resp = await axios.get(
    `${NORDIGEN_BASE}/accounts/${data.accountId}/transactions/`,
    { headers: { Authorization: `Bearer ${access}` } }
  );
  return resp.data.transactions;
});


/**
 * Conciliación de facturas con transacciones
 * data: { accountId: string }
 */
export const reconcileTransactions = functions.https.onCall(async (data, context) => {
  const db = getFirestore();
  const accountId = data.accountId;

  // 1. Obtener facturas pendientes (no conciliadas)
  const invoicesSnap = await db.collection("invoices").where("status", "==", "pending").get();
  const invoices = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // 2. Obtener transacciones (aquí simplificado: deberías llamarlas vía Nordigen)
  const txsSnap = await db.collection("transactions").where("accountId", "==", accountId).get();
  const transactions = txsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const matches = [];

  for (const invoice of invoices) {
    let bestMatch = null;
    let bestScore = 0;

    for (const tx of transactions) {
      let score = 0;

      // Regla 1: Referencia única
      if (tx.remittanceInformation && tx.remittanceInformation.includes(invoice.reference)) {
        score += 10;
      }

      // Regla 2: Importe exacto
      if (parseFloat(tx.transactionAmount.amount) === parseFloat(invoice.amount)) {
        score += 5;
      }

      // Regla 3: Fecha aproximada
      const invDate = new Date(invoice.dueDate);
      const txDate = new Date(tx.bookingDate);
      const diffDays = Math.abs((invDate - txDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 2) {
        score += 3;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = tx;
      }
    }

    // Si encontramos un match razonable
    if (bestMatch && bestScore >= 10) {
      await db.collection("invoices").doc(invoice.id).update({
        status: "paid",
        transactionId: bestMatch.id,
        reconciledAt: new Date()
      });

      matches.push({ invoice: invoice.id, transaction: bestMatch.id, score: bestScore });
    }
  }

  return { reconciled: matches.length, details: matches };
});
