import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth"; // 👈 import signOut
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState({});
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        setUser(firebaseUser);
        setClaims(tokenResult.claims || {});

        // 👇 Subscribe to Firestore user doc
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubscribeUserDoc = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUserData(snap.data());
          } else {
            setUserData(null);
          }
        });
      } else {
        setUser(null);
        setClaims({});
        setUserData(null);
      }
      setLoading(false);
    });

    // Cleanup both listeners
    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);
  
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setClaims({});
      console.log("User signed out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, claims, setClaims, userData, setUserData, loading, logout }} 
    >
      {console.log("AuthContext ************* ", user, claims, userData)}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
