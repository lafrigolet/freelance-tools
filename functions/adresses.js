// src/firebase/addresses.js
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, setDoc, query, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

export const getUserAddressesRef = (uid) =>
  collection(db, "users", uid, "addresses");

// Obtener todas las direcciones del usuario
export async function getAddresses(uid) {
  const q = query(getUserAddressesRef(uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Añadir dirección
export async function addAddress(uid, addressData) {
  const ref = getUserAddressesRef(uid);
  return await addDoc(ref, { ...addressData, isDefault: false });
}

// Actualizar dirección
export async function updateAddress(uid, addressId, data) {
  const ref = doc(db, "users", uid, "addresses", addressId);
  await updateDoc(ref, data);
}

// Borrar dirección
export async function deleteAddress(uid, addressId) {
  const ref = doc(db, "users", uid, "addresses", addressId);
  await deleteDoc(ref);
}

// Poner dirección como default (desmarcar otras)
export async function setDefaultAddress(uid, addressId) {
  const ref = getUserAddressesRef(uid);
  const snap = await getDocs(ref);

  const batchPromises = snap.docs.map(async (docSnap) => {
    const refDoc = doc(db, "users", uid, "addresses", docSnap.id);
    await updateDoc(refDoc, { isDefault: docSnap.id === addressId });
  });

  await Promise.all(batchPromises);
}
