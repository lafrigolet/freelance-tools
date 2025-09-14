// firebase.js
// Production config (modular SDK v9+)

import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// --- Real config from Firebase Console ---
const firebaseConfig = {
  apiKey: "AIzaSy...yourKey...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
  databaseURL: "https://your-project-id.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// --- Auth ---
const auth = getAuth(app);

// Set persistence once at startup
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence set to local");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// --- Firestore ---
const db = getFirestore(app);

// --- Realtime Database ---
const rtdb = getDatabase(app);

// --- Storage ---
const storage = getStorage(app);

// --- Cloud Functions ---
// Default region is "us-central1" unless you deployed elsewhere
const functions = getFunctions(app, "us-central1");

// Export what apps typically need
export {
  app,
  auth,
  db,
  rtdb,
  storage,
  functions,
};
