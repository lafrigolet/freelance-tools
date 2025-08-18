// firebase.js
// Works for local-only dev with the Firebase Emulators.
// Uses modular SDK (v9+).

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
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


// Export what apps typically need
export {
  app,
  auth,
  db,
  rtdb,
  storage,
  functions,
};

