# i18n Internationalization

This branch is the setup for base for internationalization.
This document explains the purpose of the i18n-related files in the project.
For installing run **npm install**

src/
 ├─ i18n.js
 ├─ components/
 │   └─ LanguageSelector.js
 └─ App.jsx
public/
 └─ locales/
     ├─ en.yaml
     └─ fr.yaml


---

## `src/i18n.js`
- Initializes i18next for the app.
- Loads translation resources (from `src/locales/`).
- Sets default language and fallback language.
- Exports the i18n instance so React components can use it.

---

## `src/components/LanguageSelector.js`
- React component to choose a language (e.g. `en` or `fr`).
- Uses `i18n.changeLanguage(lang)` from `react-i18next`.
- Updates the active language instantly when the user selects one.

---

## `src/App.js`
- The main application component.
- Uses the `useTranslation` hook (`const { t } = useTranslation()`).
- Calls `t("key")` to display the correct translation.
- Likely includes `<LanguageSelector />` to let users switch languages.

---

## Translation Files 
- `src/locales/en.yaml` English translations in YAML format.
- `src/locales/fr.yaml` French translations in YAML format.


# Navbar

## Overview
This project is a **React + Vite + Material UI (MUI)** application.  
It includes:
- A fixed **Navbar** (Google-like) using MUI `AppBar`.
- **Routing** with `react-router-dom`.
- Theming with `MUI ThemeProvider`.

---

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


