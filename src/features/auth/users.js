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
const magicLinkHandle    = httpsCallable(functions, "magicLinkHandler");

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
    let userCredential;
    try {
      const result = await sendMagicLinkEmail({
        to: email,
        appName: "Bill App",
        recipientName: firstName,
        expirationMinutes: 5,
        supportEmail: "billapp74@gmail.com"
      });

      userCredential = await waitForUserLinkClick(email);
      const { uid } = userCredential.user;

      await setDoc(firestoreDoc(db, "users", uid), {
        uid,
        email,
        firstName,
        lastName,
        countryCode,
        phone,
        createdAt: new Date()
      });
      
      return userCredential;

    } catch (error) {
      console.error("Error during signUpUser:", error);

      if (userCredential?.user) {
        const { uid } = userCredential.user;

        try {
          await deleteUserAuth(userCredential.user);
          console.log("Rolled back: user deleted from Firebase Auth");
        } catch (authErr) {
          console.warn("Failed to delete user from Auth:", authErr);
        }

        try {
          await deleteDoc(firestoreDoc(db, "users", uid));
          console.log("Rolled back: user document deleted from Firestore");
        } catch (fsErr) {
          console.warn("Failed to delete user document from Firestore:", fsErr);
        }
      }

      throw error;
    }
  }
};

const loginUser = async ({ email }) => {
  if (await userExist(email)) {
    const result = await sendMagicLinkEmail({
      to: email,
      appName: "Bill App",
      recipientName: '',
      expirationMinutes: 5,
      supportEmail: "billapp74@gmail.com",
    });
    
    const token = await waitForUserLinkClick(email);
  }
}

export {
  listUsers,
  addUser,
  deleteUser,
  setUserRole,
  signUpUser,
  loginUser
};

