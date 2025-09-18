# Firebase

This branch handles firebase setup. It is intented to keep all the logic
for switching between firebase or emulator deploying.

## Deploy to emulators
1. npm install
2. firebase init
3. firebase init functions (just in case you want to add functions)
4. firebase emulators:start 
5. npm run dev

---
## Deploy to Firebase

---
## Files
src/
 ├─ firebase.js
 └─ firebase-emulators.js

---
# User Management

# Files

utils/
 └─ setAdmin.js                    # For setting admin role for a given email

functions/
 └─ users.js                       # Firebase user functions

src/
 └─ features/
     └─ auth/
         ├─ AuthContext.jsx        # React context for Auth
         ├─ LoginDialog.jsx        # Login form
         ├─ PhoneNumberInput.jsx   # Phone number input form
         ├─ RoleGuard.jsx          # Enable/Disable react component
         ├─ SignUpDialog.jsx       # SignUp form
         ├─ LoginIconButton.jsx    # This is the starter of a login -> signup dialog flow
         ├─ UserCard.jsx           # A UserCard for helpdesk
         └─ users.js               # Users helpers functions


# Setting the first admin user 
User must exist first

node utils/setAdmin.js <email>

## Components
### RoleGuard Component

The RoleGuard component is used to control access to parts of the application based on the authenticated user's role. It checks the user's claims from the AuthContext and only renders its children if the user has one of the allowed roles. Otherwise, it renders a fallback message or component.

#### Example of use 
```jsx
      <RoleGuard allowedRoles={["editor", "admin"]} fallback={<div>No access</div>}>
        <div>Editor tools</div>
      </RoleGuard>
```

---
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
```

---
# Getnet TPV Virtual Credentials Setup

This guide explains how to obtain the required credentials from **Santander Getnet (Redsys
TPV Virtual)** and configure them in Firebase Functions.


## Required Parameters

| Variable      | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| `MERCHANT_ID` | Merchant code (Código de comercio) assigned by Santander Getnet.            |
| `TERMINAL`    | Terminal number (Número de terminal). Usually `"1"`.                        |
| `SECRET`      | Secret key (Clave secreta) used to generate signatures. Must be base64.     |
| `TPV_URL`     | Redsys endpoint URL for TPV Virtual (test or production).                   |

---

## Steps to Obtain Credentials

### 1. Access the Merchant Portal
- **Production:** [https://sis.redsys.es/canales](https://sis.redsys.es/canales)  
- **Sandbox (test):** [https://sis-t.redsys.es:25443/canales](https://sis-t.redsys.es:25443/canales)  
- Use the credentials provided by Santander when your TPV Virtual account was activated.

---

### 2. Find Your Merchant Data
Inside the portal, navigate to the **Administration / Configuration** section:

- **Código de comercio** → `MERCHANT_ID`  
- **Número de terminal** → `TERMINAL` (typically `1`, unless you have multiple terminals configured)  

---

### 3. Generate the Secret Key
- In the same panel, look for **“Clave secreta de firma”** (Signature Secret Key).  
- If you don’t see it, request Santander support to generate one for your merchant account.  
- This value must be **converted to Base64** before storing it in Firebase.  
  - Some providers already give it in Base64 format.  
  - If you receive a raw string, convert it with a tool or Node.js:

    ```js
    const secret = "your-secret-string";
    const base64Secret = Buffer.from(secret).toString("base64");
    console.log(base64Secret);
    ```

---

### 4. Select the TPV Endpoint
Use the correct TPV URL:

- **Sandbox (testing):**  

---

# Handling Getnet Secrets in Firebase

When working with **Firebase Functions**, you should **never hardcode sensitive values**
like `MERCHANT_ID`, `SECRET`, or API keys directly in your source code.  

Instead, use **Firebase Functions Config** to store and access them securely.

---

## 1. Setting Config Values

Run the following commands (replace with your real values):

```bash
firebase functions:config:set \
  getnet.merchant_id="YOUR_MERCHANT_ID" \
  getnet.terminal="1" \
  getnet.secret="YOUR_BASE64_SECRET" \
  getnet.url="https://sis-t.redsys.es:25443/sis/realizarPago"

