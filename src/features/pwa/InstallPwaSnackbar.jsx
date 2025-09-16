import React, { useEffect, useState } from "react";
import { Snackbar, Button } from "@mui/material";

export default function InstallPwaSnackbar() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome from showing the default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setOpen(true); // Show snackbar
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("User response:", outcome);
    setDeferredPrompt(null);
    setOpen(false);
  };

  const handleClose = () => setOpen(false);

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      message="Install this app for a better experience!"
      action={
        <>
          <Button color="secondary" size="small" onClick={handleInstall}>
            Install
          </Button>
          <Button color="inherit" size="small" onClick={handleClose}>
            Dismiss
          </Button>
        </>
      }
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    />
  );
}
