import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Snackbar,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';

const isMobile = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(ua);
};

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showMiniPrompt, setShowMiniPrompt] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(true);

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  useEffect(() => {
    if (!isMobileDevice) return;

    const doNotAsk = localStorage.getItem('pwa-dont-ask-again');
    if (doNotAsk === 'true') return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowMiniPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isMobileDevice]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User choice:', outcome);
      setDeferredPrompt(null);
      setShowDialog(false);
      setShowMiniPrompt(false);
    }
  };

  const handleClose = () => {
    if (dontAskAgain) {
      localStorage.setItem('pwa-dont-ask-again', 'true');
    }
    setShowDialog(false);
    setShowMiniPrompt(false);
  };

  if (!isMobileDevice || !deferredPrompt) return null;

  return (
    <>
      <Snackbar
        open={showMiniPrompt && !showDialog}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message="Install this app?"
        action={
          <>
            <Button
              size="small"
              color="primary"
              onClick={() => setShowDialog(true)}
              startIcon={<InstallMobileIcon />}
            >
              Install
            </Button>
            <IconButton size="small" color="inherit" onClick={() => setShowMiniPrompt(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />

      <Dialog open={showDialog} onClose={handleClose}>
        <DialogTitle>Install App</DialogTitle>
        <DialogContent>
          Would you like to install this app on your device?
          <Box mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={dontAskAgain}
                  onChange={(e) => setDontAskAgain(e.target.checked)}
                />
              }
              label="Don't ask me again"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleInstall} variant="contained" startIcon={<InstallMobileIcon />}>
            Install
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstallPrompt;
