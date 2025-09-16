# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# PWA
This project is a **Progressive Web App (PWA)** built with **React + Vite** and styled with **Material UI**.  
It includes a custom **Snackbar** component to prompt users to install the app on their devices.
It also works for iOS.

## Files

project-root/
├── public/
│     └── icons/                   # App icons (icon-192x192.png, icon-512x512.png).
│           ├── icon-192x192.png
│           └── icon-512x512.png
├── src/
│    ├── InstallPwaSnackbar.jsx    # Snackbar for PWA install prompt.
│    ├── App.jsx                   # Snackbar show for Android an iOS.
│    └── main.jsx                  # App entry, registers service worker.
└── vite.config.js                 # Vite configuration with PWA plugin.

## Setup
### Configure Vite (vite.config.js) 

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "My Awesome App",
        short_name: "App",
        theme_color: "#1976d2",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          { src: "icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
});
```

### Add icons
Place app icons inside public/icons/:
icon-192x192.png
icon-512x512.png

## Testing in Chrome DevTools
```bash
npm run dev
```
- Dev server injects a mock service worker for fast reloads.
- You won’t see a manifest.webmanifest or sw.js file yet — that’s expected.
- Use Chrome DevTools Lighthouse to verify basic PWA checks.

### Enable Device Emulation
- Open DevTools (Ctrl+Shift+I / Cmd+Opt+I)
- Toggle Device Toolbar (Ctrl+Shift+M / Cmd+Shift+M)
- A new Toolbar appears on top of the device emulator. Pick a device (Pixel, iPhone, etc.)
- Alternatively, you can add more emulator devices in the Chrome DevTools/Settings/Devices

### Verify DPR & User Agent

In Console, run:

```js
window.devicePixelRatio
navigator.userAgent
```

- DPR should match the chosen device (e.g. 3 for iPhone 14 Pro).
- User Agent should include Mobile.

### Check Installability
- Open Chrome menu → look for Install App option
- Or wait for your Snackbar to appear (beforeinstallprompt event on Android/Chrome).

### Test Offline Support
- DevTools → Application tab → Service Workers → check Offline
- Refresh the page → the app should still work if cached.

### Run Lighthouse Audit
- DevTools → Lighthouse tab → select Progressive Web App → Generate report
- Check for “Installable” and “Works offline”.

## Build & Preview

The manifest (manifest.webmanifest) and service worker (sw.js) are only generated at build time.
You won’t see them in dev mode (npm run dev).

### Build the app
```bash
npm run build
```

### Inspect the build
```bash
ls dist/
```

You should see:
- manifest.webmanifest
- sw.js

### Preview with local server

```bash
npm run preview
```

- Visit http://localhost:4173 and check DevTools → Application tab:
- Manifest → with app name, icons, colors
- Service Worker → installed and running

---

# Navbar

## Overview
This project is a **React + Vite + Material UI (MUI)** application.  
It includes:
- A fixed **Navbar** (Google-like) using MUI `AppBar`.
- **Routing** with `react-router-dom`.
- Theming with `MUI ThemeProvider`.

## Project Structure

src/
 ├─ App.jsx               # Root component (theme + router)
 ├─ index.jsx             # Entry point (renders App)
 ├─ features/
 │   └─ navbar/
 │       └─ Navbar.jsx    # Top navigation bar
 ├─ assets/               # Static assets (logos, images)
 ├─ App.css               # Global styles


## Features

### Navbar
- Always visible at the top (`AppBar position="fixed"`).
- Contains logo/menu, search bar, and profile/actions.

### Routing
- Configured with **react-router-dom**.
- Example routes:
  - `/` → Home
  - `/about` → About

### Theming

In Material UI (MUI), a **theme** is a central configuration object that controls the look and feel of your application.  
It defines aspects such as:

- **Colors (palette):** primary, secondary, background, text colors, etc.
- **Typography:** font family, sizes, and weights.
- **Component defaults:** spacing, breakpoints, and style overrides.

By wrapping your app in a `ThemeProvider`, you ensure all components follow the same design rules.  
This makes it easy to apply consistent styling across the entire app and update the design in one place.

- Managed by **MUI ThemeProvider** and `createTheme`.
- Easy to customize palette and typography.

## Complete Example of Theme

In `App.jsx`, you can define a custom theme with colors, typography, and component overrides.

```jsx
const theme = createTheme({
  palette: {
    mode: "light", // or "dark"
    primary: {
      main: "#1976d2", // blue
    },
    secondary: {
      main: "#dc004e", // pink/red
    },
    background: {
      default: "#f5f5f5", // page background
      paper: "#ffffff",   // cards, sheets
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // rounded buttons
          textTransform: "none", // keep text case as written
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none", // remove shadow
          borderBottom: "1px solid #e0e0e0",
        },
      },
    },
  },
});


