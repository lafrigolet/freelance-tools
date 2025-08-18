import React, { useState, useEffect, useRef } from 'react';
import {
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Typography,
  Alert,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  InputAdornment
} from '@mui/material';
import Flag from 'react-world-flags';
import PhoneNumberInput from './PhoneNumberInput';
import { signUpUser } from "./users";
import { useAuthContext } from "./AuthContext";

const SignUpDialog = ({ size = 'small' }) => {
  // States to manage open/close dialog, form inputs, loading, and error messages
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+34'); // Default to Spain
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('Please enter your details to sign up.');
  const [severity, setSeverity] = useState('info');
  const unsubscribeRef = useRef(null);
  const timeoutRef = useRef(null);
  const { user, setUser } = useAuthContext();
  
  // Error states for each field
  const [emailError, setEmailError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [firstNameError, setFirstNameError] = useState(null);
  const [lastNameError, setLastNameError] = useState(null);

  // Regular expression for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Function to format phone number while typing
  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    let cleaned = value.replace(/\D/g, '');

    // Add spaces after every 3 digits
    cleaned = cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');

    return cleaned;
  };
  
  // Handle other field changes
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    if (event.target.value && !emailRegex.test(event.target.value)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError(null);
    }
  };

  const handleFirstNameChange = (event) => setFirstName(event.target.value);
  const handleLastNameChange = (event) => setLastName(event.target.value);
  const handlePhoneNumberChange = ({ digits, isValid }) => {
    if (isValid) setPhone(digits);
  };

  
  // Sign-up process
  const handleSignUp = async () => {
    if (!email || !firstName || !lastName || !countryCode || !phone) {
      setInfo('All fields are required.');
      setSeverity('error');
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      setInfo('Please enter a valid email.');
      setSeverity('error');
      return;
    }

    if (!phone) {
      setPhoneError('Invalid phone number format');
      setInfo('Please enter a valid phone number.');
      setSeverity('error');
      return;
    }

    try {
      setLoading(true);
      setInfo("If the user doesn't 'exist, search your email for a login link (try spam too)...");
      setSeverity('warning');

      const result = await signUpUser({
        "email": email,
        "firstName": firstName,
        "lastName": lastName,
        "countryCode": countryCode,
        "phone": phone
      });

      setInfo('User Signed Up.');
      setSeverity('info');

      setLoading(false);
      // Wait 1 second before closing
      setTimeout(() => {
        setOpen(false);
      }, 2000);

    } catch (error) {
      setInfo('Sign-up failed. Please try again.');
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* Sign Up Button */}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Sign Up
      </Button>
      
      {/* Dialog for Sign Up Form */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sign Up</DialogTitle>
        <DialogContent>
          {/* General Message Text */}
          {info && <Alert severity={severity} role="status">{info}</Alert>}

          {/* Email row */}
          <Grid container spacing={1}>
            <Grid>
              <TextField
                autoFocus
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                error={!!emailError}
                helperText={emailError || 'Please enter your email to sign up.'}
                size={size}
              />
            </Grid>
          </Grid>

          <Divider style={{ marginBottom: '16px' }} />

          {/* First Name and Last Name inputs on the second line */}
          <Grid container spacing={1} alignItems="center">
            <Grid>
              <TextField
                margin="dense"
                label="First Name"
                type="text"
                fullWidth
                variant="outlined"
                value={firstName}
                onChange={handleFirstNameChange}
                disabled={loading}
                error={!!firstNameError}
                helperText={firstNameError && 'First name is required'}
                size={size}
              />
            </Grid>
            <Grid>
              <TextField
                margin="dense"
                label="Last Name"
                type="text"
                fullWidth
                variant="outlined"
                value={lastName}
                onChange={handleLastNameChange}
                disabled={loading}
                error={!!lastNameError}
                helperText={lastNameError && 'Last name is required'}
                size={size}
              />
            </Grid>
          </Grid>

          <Divider style={{ marginBottom: '16px' }} />

          <PhoneNumberInput
            disabled={loading}
            onChange={handlePhoneNumberChange}
          />

        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSignUp}
            color="primary"
            disabled={loading || !email || !firstName || !lastName }
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SignUpDialog;
