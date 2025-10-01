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
const deleteUser         = httpsCallable(functions, "deleteUser");
const setUserRole        = httpsCallable(functions, "setUserRole");
const sendMagicLinkEmail = httpsCallable(functions, "sendMagicLinkEmail");
const registerUser       = httpsCallable(functions, "registerUser");
const getUserData        = httpsCallable(functions, "getUserData");
const setUserData        = httpsCallable(functions, "setUserData");
const disableUser        = httpsCallable(functions, "disableUser");
const enableUser         = httpsCallable(functions, "enableUser");

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
  await registerUser({ email, firstName, lastName, phone });
  const userData = await getUserData({ email });
  return { user, claims: userData.data.claims, userData: userData.data.data };
}

export {
  listUsers,
  addUser,
  deleteUser,
  setUserRole,
  signUpUser,
  loginUser,
  registerUser,
  getUserData,
  setUserData,
  disableUser,
  enableUser,
};


