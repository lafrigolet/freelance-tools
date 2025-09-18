import React, { useState } from "react";
import { IconButton } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

import LoginDialog from "./LoginDialog";
import SignUpDialog from "./SignUpDialog";

import { loginUser, registerUser } from "./users"; // wrappers

export default function LoginIconButton() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <>
      <IconButton color="inherit" onClick={() => setLoginOpen(true)}>
        <LoginIcon />
      </IconButton>

      {/* Login dialog */}
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        handleSignUp={() => {setLoginOpen(false); setSignupOpen(true)}}
      />

      {/* Signup dialog */}
      <SignUpDialog
        open={signupOpen}
        onClose={() => {setSignupOpen(false); setLoginOpen(false)}}
        email={email} 
      />
    </>
  );
}
