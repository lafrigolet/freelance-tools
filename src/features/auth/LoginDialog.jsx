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

import { loginUser } from "./users";
import { useAuthContext } from "./AuthContext";

export default function LoginDialog({
  open,
  onClose,
  handleSignUp,
  size = 'small',
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState('Sign-up if you are a new user or enter an existing user email to receive log-in link.');
  const [severity, setSeverity] = useState('info');
  const [sent, setSent] = useState(false);

  const { setUser, setClaims, setUserData } = useAuthContext();
  const unsubscribeRef = useRef(null);
  const timeoutRef = useRef(null);

  const emailRegex = useMemo(
    () => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    []
  );

  const resetState = useCallback(() => {
    setEmail('');
    setLoading(false);
    setError(null);
    setInfo('Sign-up if you are a new user or enter an existing user email to receive log-in link.');
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

  const handleLogin = async () => {
    if (!email || !emailRegex.test(email)) {
      setInfo('Invalid email format.');
      setSeverity('error');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setInfo('If the user exist, search your email for a login link (try spam too)...');
      setSeverity('warning');
      
      const result = await loginUser({ email });

      console.log("signUpUser -------------- ", result);
      setUser(result.user);
      setClaims(result.claims);
      setUserData(result.userData);

      setInfo('User Logged In.');
      setSeverity('info');

      setLoading(false);
      // Wait 1 second before closing
      setTimeout(() => {
        onClose?.();
      }, 2000);
      
    } catch (error) {
      console.log('Login failed. Please try again.', error.message);
      setInfo('Login failed. Please try again.');
      setSeverity('error');
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
          {/* General Message Text */}
          {info && <Alert severity={severity} role="status">{info}</Alert>}

          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={handleEmailChange}
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

        <Button
          onClick={handleSignUp}
          color="primary"
          aria-label="Send log-in link"
        >
          Sign Up
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

