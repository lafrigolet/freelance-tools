import React, { useEffect, useState } from "react";
import { Snackbar, Button } from "@mui/material";

export default function InstallPwaSnackbar({ onDismiss }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [open, setOpen] = useState(false);
  const [isIosPrompt, setIsIosPrompt] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandalone = window.navigator.standalone === true;

    if (isIos && !isInStandalone) {
      // Show custom iOS prompt
      setIsIosPrompt(true);
      setOpen(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setOpen(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("User response:", outcome);
    setDeferredPrompt(null);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    if (onDismiss) onDismiss();
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      message={
        isIosPrompt
          ? "Install this app: Tap Share → Add to Home Screen"
          : "Install this app for a better experience!"
      }
      action={
        isIosPrompt ? (
          <Button color="inherit" size="small" onClick={handleClose}>
            Dismiss
          </Button>
        ) : (
          <>
            <Button color="secondary" size="small" onClick={handleInstall}>
              Install
            </Button>
            <Button color="inherit" size="small" onClick={handleClose}>
              Dismiss
            </Button>
          </>
        )
      }
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    />
  );
}
