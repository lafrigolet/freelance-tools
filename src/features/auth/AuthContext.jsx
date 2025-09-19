import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth"; // 👈 import signOut
import { auth } from "../../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState({});
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  //     if (firebaseUser) {
  //       const tokenResult = await firebaseUser.getIdTokenResult(true);
  //       setUser(firebaseUser);
  //       setClaims(tokenResult.claims || {});
  //       console.log("token claims:", tokenResult.claims);
  //     } else {
  //       setUser(null);
  //       setClaims({});
  //     }
  //     console.log("user claims:", claims);
  //     setLoading(false);
  //   });
  //   return () => unsubscribe();
  // }, []);

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
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
