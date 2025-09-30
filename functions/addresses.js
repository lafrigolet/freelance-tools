// functions/addresses.js
import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";


// 🔹 Obtener direcciones de un usuario autenticado
export const getAddresses = onCall(async ({ auth }) => {
  const db = getFirestore();
  const uid = auth?.uid;

  console.log("uid ", uid);
  if (!uid) throw new Error("Not authenticated");

  const snap = await db.collection("users").doc(uid).collection("addresses").get();
  const addresses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log("Addresses", addresses);
  return { addresses: addresses };
});

// 🔹 Añadir dirección
export const addAddress = onCall(async ({ auth, data }) => {
  const db = getFirestore();
  const uid = auth?.uid;

  console.log("data", data);
  if (!uid) throw new Error("Not authenticated");

  const ref = await db.collection("users").doc(uid).collection("addresses").add({
    ...data,
    isDefault: false,
  });
  return { id: ref.id };
});

// 🔹 Actualizar dirección
export const updateAddress = onCall(async ({ auth, data }) => {
  const db = getFirestore();
  const uid = auth?.uid;
  if (!uid) throw new Error("Not authenticated");

  const { addressId, address } = data;
  console.log("updateAddress ", addressId, address);
  await db.collection("users").doc(uid).collection("addresses").doc(addressId).update(address);
  return { success: true };
});

// 🔹 Borrar dirección
export const deleteAddress = onCall(async ({ auth, data }) => {
  const db = getFirestore();
  const uid = auth?.uid;
  if (!uid) throw new Error("Not authenticated");

  const { addressId } = data;
  await db.collection("users").doc(uid).collection("addresses").doc(addressId).delete();
  return { success: true };
});

// 🔹 Poner dirección como default
export const setDefaultAddress = onCall(async (request) => {
  const db = getFirestore();
  const uid = request.auth?.uid;
  if (!uid) throw new Error("Not authenticated");

  const { addressId } = request.data;
  const ref = db.collection("users").doc(uid).collection("addresses");
  const snap = await ref.get();

  const batch = db.batch();
  snap.forEach((docSnap) => {
    const addrRef = ref.doc(docSnap.id);
    batch.update(addrRef, { isDefault: docSnap.id === addressId });
  });

  await batch.commit();
  return { success: true };
});
