import React, { useEffect, useState } from "react";
import InstallPwaSnackbar from "./features/pwa/InstallPwaSnackbar";
import { Snackbar, Button } from "@mui/material";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


export default function App() {
  const [count, setCount] = useState(0)
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandalone = window.navigator.standalone === true;
    if (isIos && !isInStandalone) {
      setShowIosPrompt(true);
    }
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* Android / general PWA install */}
      <InstallPwaSnackbar />

      {/* iOS Safari install hint */}
      <Snackbar
        open={showIosPrompt}
        onClose={() => setShowIosPrompt(false)}
        message="Install this app: Tap Share → Add to Home Screen"
        action={
          <Button color="inherit" size="small" onClick={() => setShowIosPrompt(false)}>
            Dismiss
          </Button>
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

    </>
  )
}
