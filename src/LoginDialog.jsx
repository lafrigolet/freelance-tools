import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress, Typography } from '@mui/material';

const LoginDialog = ({ size = 'small' }) => {
  // States to manage open/close dialog, email, loading, error, and message
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('Please enter your email to log in.');

  // Regular expression for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Function to handle opening the dialog
  const handleOpen = () => setOpen(true);

  // Function to handle closing the dialog
  const handleClose = () => setOpen(false);

  // Function to handle email input change
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    // Reset error state if email is corrected
    if (event.target.value && !emailRegex.test(event.target.value)) {
      setError('Please enter a valid email address.');
    } else {
      setError(null); // Reset the error if the email is valid
    }
  };

  // Function to simulate login process
  const handleLogin = async () => {
    if (!email || !emailRegex.test(email)) {
      setError('Invalid email format');
      setMessage('Please enter a valid email to log in.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage('Logging in...');
    
    // Simulating login process (can replace with actual API call)
    setTimeout(() => {
      // Simulate success or failure
      const success = Math.random() > 0.5; // Random success/failure for demonstration
      
      if (success) {
        setMessage('Login successful!');
        setLoading(false);
        setEmail('');
      } else {
        setError('Invalid email or login failed.');
        setMessage('Please try again.');
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div>
      {/* Login Button */}
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Login
      </Button>

      {/* Dialog for Login Form */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          {/* Message Text */}
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {message}
          </Typography>

          {/* Email Input */}
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
            error={!!error}
            helperText={error || 'Please enter your email to log in.'}
            size={size}
          />
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions>
          {/* Cancel Button */}
          <Button onClick={handleClose} color="secondary" disabled={loading}>
            Cancel
          </Button>
          {/* Log In Button */}
          <Button
            onClick={handleLogin}
            color="primary"
            disabled={loading || !email || !!error}
          >
            {loading ? <CircularProgress size={24} /> : 'Log In'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LoginDialog;
