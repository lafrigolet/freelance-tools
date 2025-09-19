import {
  signOut,
  signInWithCustomToken,
  sendSignInLinkToEmail,
  deleteUser as deleteUserAuth,
} from "firebase/auth";

import {
  doc as firestoreDoc,
  onSnapshot,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";

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
const listUsers          = httpsCallable(functions, "listUsers");
const addUser            = httpsCallable(functions, "addUser");
const deleteUserF        = httpsCallable(functions, "deleteUser");
const setUserRole        = httpsCallable(functions, "setUserRole");
const sendMagicLinkEmail = httpsCallable(functions, "sendMagicLinkEmail");
const registerUser       = httpsCallable(functions, "registerUser");
const getUserData        = httpsCallable(functions, "getUserData");
const setUserData        = httpsCallable(functions, "setUserData");
const disableUserF       = httpsCallable(functions, "disableUser");
const enableUserF        = httpsCallable(functions, "enableUser");
const createCustomer     = httpsCallable(functions, "createCustomer");

async function waitForUserLinkClick(email) {
  return await new Promise((resolve, reject) => {
    const docRef = firestoreDoc(db, "magicLinks", email);

    let unsubscribe;

    const timeoutRef = setTimeout(() => {
      unsubscribe?.();
      reject(new Error("Sign-in timed out. Please try again."));
    }, 5 * 60 * 1000);

    unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.token) {
          try {
            const userCredential = await signInWithCustomToken(auth, data.token);

            await deleteDoc(docRef);

            clearTimeout(timeoutRef);
            unsubscribe?.();

            resolve(userCredential.user);
          } catch (err) {
            clearTimeout(timeoutRef);
            unsubscribe?.();
            reject(err);
          }
        }
      }
    });
  });
}

const loginUser = async ({ email }) => {
  await sendMagicLinkEmail({ to:email, exist: true });
  const user = await waitForUserLinkClick(email);
  const userData = await getUserData({ email });
  return { user, claims: userData.data.claims, userData: userData.data.data };
}

const signUpUser = async ({ email, firstName, lastName, phone }) => {
  await sendMagicLinkEmail({ to:email, firstName: firstName, exist: false});
  const user = await waitForUserLinkClick(email);
  console.log("signUpUser *************");
  const res = await createCustomer({ email });
  const { customerId } = res.data;
  console.log("signUpUser *************", customerId);
  await registerUser({ email, firstName, lastName, phone, customerId });
  console.log("signUpUser *************", customerId);
  const userData = await getUserData({ email });
  return { user, claims: userData.data.claims, userData: userData.data.data };
}

async function fetchUserData(email) {
  const res = await getUserData({ email });
  console.log("res ", res.data);
  return res.data; 
  // → { exists: true/false, uid, data: {...} }
}

async function saveUserData(email, data, claims) {
  const res = await setUserData({ email, data, claims });
  return res.success; 
  // → { success: true, uid }
}

async function deleteUser(email) {
  const res = await deleteUserF({email});
}

async function disableUser(email) {
  const res = await disableUserF({email});
}

async function enableUser(email) {
  const res = await enableUserF({email});
}

export {
  listUsers,
  addUser,
  deleteUser,
  setUserRole,
  signUpUser,
  loginUser,
  registerUser,
  fetchUserData,
  saveUserData,
  disableUser,
  enableUser,
};


