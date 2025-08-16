// firebase.js
// Works for local-only dev with the Firebase Emulators.
// Uses modular SDK (v9+).

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signOut,
  signInWithCustomToken,
  sendSignInLinkToEmail,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc as firestoreDoc,
  onSnapshot,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getDatabase,
  connectDatabaseEmulator,
} from "firebase/database";
import {
  getStorage,
  connectStorageEmulator,
} from "firebase/storage";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";

// --- Dummy-ish config is fine when only using emulators ---
const firebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "localhost",
  projectId: "my-firebase-demo-555",
  appId: "demo-app-id",
  // databaseURL and storageBucket are optional for emulators,
  // but adding them avoids warnings in some setups:
  databaseURL: "http://localhost:9000?ns=my-firebase-demo-555",
  storageBucket: "my-firebase-demo-555.appspot.com",
};

const app = initializeApp(firebaseConfig);




// --- Auth ---
const auth = getAuth(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });

// --- Firestore ---
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);

// --- Realtime Database ---
const rtdb = getDatabase(app);
// Note: host must be "127.0.0.1" for web to avoid CORS/IPv6 oddities
connectDatabaseEmulator(rtdb, "127.0.0.1", 9000);

// --- Storage ---
const storage = getStorage(app);
connectStorageEmulator(storage, "127.0.0.1", 9199);

// --- Cloud Functions ---
// Use your region from firebase.json/functions.codebase if set; default is us-central1
const functions = getFunctions(app, "us-central1");
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

////// Firebase Functions Wrapping
const sendMagicLinkEmail = httpsCallable(functions, "sendMagicLinkEmail");
const listUsers          = httpsCallable(functions, "listUsers");
const addUser            = httpsCallable(functions, "addUser");
const deleteUser         = httpsCallable(functions, "deleteUser");
const setUserRole        = httpsCallable(functions, "setUserRole");
const magicLinkHandle    = httpsCallable(functions, "magicLinkHandler");


async function waitForUserLinkClick(email) {
  return await new Promise((resolve, reject) => {
    console.log("startPolling...");
    const docRef = firestoreDoc(db, "magicLinks", email);

    let unsubscribe;

    const timeoutRef = setTimeout(() => {
      console.log("Polling timed out after 5 minutes.");
      unsubscribe?.();
      reject(new Error("Sign-in timed out. Please try again."));
    }, 5 * 60 * 1000);

    unsubscribe = onSnapshot(docRef, async (docSnap) => {
      console.log("Polling magicLink token for", email);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.token) {
          try {
            const result = await signInWithCustomToken(auth, data.token);

            await deleteDoc(docRef);

            clearTimeout(timeoutRef);
            unsubscribe?.();

            resolve(result);
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

const userExist = async (email) => {
  const db = getFirestore();
  
  const userDoc = await getDoc(firestoreDoc(db, "users", email));

  return userDoc.exists();
};

const signUpUser = async ({
  email,
  firstName,
  lastName,
  countryCode,
  phone
}) => {
  if (!(await userExist(email))) {
    const result = await sendMagicLinkEmail({
      to: email,
      appName: "Bill App",
      recipientName: firstName,
      expirationMinutes: 15,
      supportEmail: "billapp74@gmail.com",
    });
    
    const token = await waitForUserLinkClick(email);
    
    // Save user info to Firestore
    await setDoc(firestoreDoc(db, "users", email), { email, firstName, lastName, countryCode, phone });
  }
}

// Export what apps typically need
export {
  app,
  auth,
  db,
  rtdb,
  storage,
  functions,
  listUsers,
  addUser,
  deleteUser,
  setUserRole,
  sendMagicLinkEmail,
  signUpUser,
};

