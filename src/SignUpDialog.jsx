import React, { useState } from 'react';
import { Divider, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress, Typography, Grid, InputLabel, MenuItem, FormControl, Select, InputAdornment } from '@mui/material';
import Flag from 'react-world-flags';
import PhoneNumberInput from './PhoneNumberInput';

const SignUpDialog = ({ size = 'small' }) => {
  // States to manage open/close dialog, form inputs, loading, and error messages
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+34'); // Default to Spain
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Please enter your details to sign up.');

  // Error states for each field
  const [emailError, setEmailError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [generalError, setGeneralError] = useState(null);

  // Regular expression for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Country options with their flags and country codes
  const countryOptions = [
    { code: '+1', country: 'US', flag: 'US' },
    { code: '+34', country: 'ES', flag: 'ES' },
    { code: '+49', country: 'DE', flag: 'DE' },
    { code: '+33', country: 'FR', flag: 'FR' },
    // Add more countries as needed
  ];

  // Function to format phone number while typing
  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    let cleaned = value.replace(/\D/g, '');

    // Add spaces after every 3 digits
    cleaned = cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');

    return cleaned;
  };

  // Handle phone number input change
  const handlePhoneChange = (event) => {
    const formattedPhone = formatPhoneNumber(event.target.value);
    setPhone(formattedPhone);

    // Validate phone number format (only digits allowed)
    const phoneRegex = /^\d{3}(\s?\d{3}){2}(\s?\d{4})?$/;
    if (!phoneRegex.test(formattedPhone)) {
      setPhoneError('Please enter a valid phone number.');
    } else {
      setPhoneError(null);
    }
  };

  // Handle country code selection
  const handleCountryCodeChange = (event) => {
    setCountryCode(event.target.value);
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

  // Simulate sign-up process
  const handleSignUp = async () => {
    if (!email || !firstName || !lastName || !countryCode || !phone) {
      setGeneralError('All fields are required.');
      setMessage('Please fill all the fields to sign up.');
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      setMessage('Please enter a valid email.');
      return;
    }

    if (!phone) {
      setPhoneError('Invalid phone number format');
      setMessage('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    setGeneralError(null);
    setMessage('Signing up...');

    // Simulating sign-up process (can replace with actual API call)
    setTimeout(() => {
      const success = Math.random() > 0.5; // Random success/failure for demonstration

      if (success) {
        setMessage('Sign-up successful!');
        setLoading(false);
        setEmail('');
        setFirstName('');
        setLastName('');
        setCountryCode('+34');
        setPhone('');
      } else {
        setGeneralError('Sign-up failed. Please try again.');
        setMessage('Please check your details and try again.');
        setLoading(false);
      }
    }, 2000);
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
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {message}
          </Typography>
          
          {/* Email row */}
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12} md={12}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="First Name"
                type="text"
                fullWidth
                variant="outlined"
                value={firstName}
                onChange={handleFirstNameChange}
                disabled={loading}
                error={!!generalError}
                helperText={generalError && 'First name is required'}
                size={size}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Last Name"
                type="text"
                fullWidth
                variant="outlined"
                value={lastName}
                onChange={handleLastNameChange}
                disabled={loading}
                error={!!generalError}
                helperText={generalError && 'Last name is required'}
                size={size}
              />
            </Grid>
          </Grid>

          <Divider style={{ marginBottom: '16px' }} />

          <PhoneNumberInput />

        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSignUp}
            color="primary"
            disabled={loading || !email || !firstName || !lastName || !countryCode || !phone || emailError || phoneError}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SignUpDialog;
