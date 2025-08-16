// LoginDialog.jsx
import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Typography,
  Alert,
  Stack,
  Button,
} from '@mui/material';

import {
  doc as firestoreDoc,
  onSnapshot,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import {
  signInWithCustomToken,
  sendSignInLinkToEmail
} from "firebase/auth";

import { auth, db } from './firebase-emulators';
import { useAuthContext } from "./contexts/AuthContext";

function LoginDialog({
  open,
  onClose,
  size = 'small',
  continueUrl,
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState('Enter your email to receive a sign-in link.');
  const [sent, setSent] = useState(false);

  const { setUser } = useAuthContext();
  const unsubscribeRef = useRef(null);
  const timeoutRef = useRef(null);

  const emailRegex = useMemo(
    () => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    []
  );

  const actionCodeSettings = useMemo(
    () => ({
      url: continueUrl || `${window.location.origin}/finishSignIn`,
      handleCodeInApp: true,
    }),
    [continueUrl]
  );

  const resetState = useCallback(() => {
    setEmail('');
    setLoading(false);
    setError(null);
    setInfo('Enter your email to receive a sign-in link.');
    setSent(false);
  }, []);

  // Reset the dialog every time it opens
  useEffect(() => {
    if (open) resetState();
  }, [open, resetState]);

  // Cleanup polling on unmount/close
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleRequestClose = (_e, _reason) => {
    if (loading) return; // prevent closing while loading
    onClose?.();
  };

  const handleEmailChange = (event) => {
    const val = event.target.value.trim();
    setEmail(val);
    if (val && !emailRegex.test(val)) {
      setError('Please enter a valid email address.');
    } else {
      setError(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading && email && !error) {
      handleLogin();
    }
  };

  const startPolling = (email) => {
    const docRef = firestoreDoc(db, "magicLinks", email);

    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.token) {
          try {
            const result = await signInWithCustomToken(auth, data.token);
            setUser(result.user);
            window.localStorage.removeItem("emailForSignIn");
            setInfo("Successfully signed in!");

            // Delete the magic link doc from Firestore
            await deleteDoc(docRef);

            // Stop polling
            if (unsubscribeRef.current) unsubscribeRef.current();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          } catch (err) {
            console.error("Error signing in with custom token:", err);
            setError("Sign-in failed.");
          }
        }
      }
    });

    // Set 5-minute timeout
    timeoutRef.current = setTimeout(() => {
      setError("Sign-in timed out. Please try again.");
      if (unsubscribe) unsubscribe();
    }, 5 * 60 * 1000);

    unsubscribeRef.current = unsubscribe;
    return unsubscribe;
  };

  const sendLoginLink = async () => {
    try {
      const userDoc = await getDoc(firestoreDoc(db, "users", email));
      if (userDoc.exists()) {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem("emailForSignIn", email);
        setInfo("Sign-in link sent! Check your email.");
        setSent(true);
        if (unsubscribeRef.current) unsubscribeRef.current();
        unsubscribeRef.current = startPolling(email);
      } else {
        setError('User does not exist. Please sign up first.');
      }
    } catch (err) {
      console.error('sendSignInLinkToEmail error', err);
      let msg = 'Failed to send the sign-in link. Please try again.';
      switch (err?.code) {
        case 'auth/invalid-email':
          msg = 'That email address looks invalid.';
          break;
        case 'auth/missing-android-pkg-name':
        case 'auth/missing-continue-uri':
        case 'auth/invalid-continue-uri':
        case 'auth/unauthorized-continue-uri':
          msg = 'Sign-in link is misconfigured. Contact support.';
          break;
        case 'auth/too-many-requests':
          msg = 'Too many attempts. Please wait a moment and try again.';
          break;
        default:
          break;
      }
      setError(msg);
    }
  };

  const handleLogin = async () => {
    if (!email || !emailRegex.test(email)) {
      setError('Invalid email format.');
      setInfo('Please enter a valid email to get the sign-in link.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setInfo('Sending sign-in link…');
      await sendLoginLink(); // important: await the async call
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleRequestClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error" role="alert">{error}</Alert>}
          {info && <Typography variant="body2" color="text.secondary">{info}</Typography>}

          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={handleEmailChange}
            onKeyDown={handleKeyDown}
            disabled={loading || sent}
            error={!!error}
            helperText={error ? '' : 'We will email you a secure, single-use link.'}
            size={size}
            inputProps={{ inputMode: 'email', autoComplete: 'email' }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleRequestClose} color="secondary" disabled={loading}>
          {sent ? 'Close' : 'Cancel'}
        </Button>

        {loading || sent ? (
          <CircularProgress size={24} sx={{ mr: 2 }} />
        ) : (
          <Button
            onClick={handleLogin}
            color="primary"
            disabled={!email || !!error}
            aria-label="Send log-in link"
          >
            Send Log-in Link
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}


function LoginButton({
  openLabel = 'Login',
  size = 'small',
  continueUrl,
  buttonProps = {}, // pass-through props to Button if you like
}) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen} {...buttonProps}>
        {openLabel}
      </Button>

      <LoginDialog
        open={open}
        onClose={handleClose}
        size={size}
        continueUrl={continueUrl}
      />
    </>
  );
}

export { LoginDialog, LoginButton };
