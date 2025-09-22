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

## Files

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

## Firestore Collections for Users Feature

The **users feature** relies on several Firestore collections to manage authentication, profiles, and passwordless login via magic links.  

### users/{uid}
- Stores persistent profile information for each Firebase Auth user.  
- Document ID = the user’s **Firebase UID**.  
- Created at signup and updated when user details change.  

Example:
```json
{
  "uid": "abcd1234",
  "email": "alice@example.com",
  "firstName": "Alice",
  "lastName": "Smith",
  "phone": "+123456789",
  "createdAt": "2025-09-16T10:00:00Z"
}
```

### pendingMagicLinks/{token}
- Temporary storage for magic link sign-in tokens.
- Document ID = random UUID token.
- Created when a login/signup flow generates a magic link.
- Automatically expires after a configured time.

Example:
```json
{
  "email": "alice@example.com",
  "createdAt": 1694863200000,
  "expiresAt": 1694866500000
}
```

### magicLinks/{email}
- Stores an active magic link token for a specific email address.
- Used by the client waitForUserLinkClick function to detect when a token is available.
- Automatically deleted once the user logs in.

Example:
```json
{
  "token": "customFirebaseToken123",
  "issuedAt": 1694863200000
}
```

### Collection Relationships
- users → Permanent user profiles tied to Firebase Auth UID.
- pendingMagicLinks → Temporary tokens waiting to be redeemed (server-managed).
- magicLinks → Bridge between email and issued custom tokens (client listens for these).

### Flow Summary
- Sign up → creates a new users/{uid} document.
- Login → generates a token in pendingMagicLinks, issues a link, and writes a magicLinks/{email} entry until it’s used.
- Client → listens to magicLinks/{email} until the token appears, then signs in.

### Flow Diagram
sequenceDiagram
    participant User
    participant Client
    participant Firestore
    participant FirebaseAuth
    participant CloudFunction

    User->>Client: Enter email
    Client->>CloudFunction: request login/signup
    CloudFunction->>FirebaseAuth: check if user exists
    alt User exists
        CloudFunction->>Firestore: create pendingMagicLinks/{token}
        CloudFunction->>Firestore: write magicLinks/{email}
        CloudFunction->>User: send magic link email
    else New user
        CloudFunction->>FirebaseAuth: create user
        CloudFunction->>Firestore: create users/{uid}
        CloudFunction->>Firestore: create pendingMagicLinks/{token}
        CloudFunction->>Firestore: write magicLinks/{email}
        CloudFunction->>User: send signup + login link
    end
    User->>Client: clicks link in email
    Client->>Firestore: listen to magicLinks/{email}
    Firestore->>Client: token available
    Client->>FirebaseAuth: signInWithCustomToken(token)
    FirebaseAuth->>Client: returns authenticated user
    Client->>Firestore: delete magicLinks/{email}


## Setting the first admin user 
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

# STRIPE

This project integrates **Stripe Checkout (Payment Element)** with **Firebase Functions**.  
Follow these steps to configure Stripe in both **test** and **production** environments.

## Files

```bash
functions/
 ├─ .secret.local                  # STRIPE_SECRET environment variable for firebase emulator
 └─ stripe.js                      # Stripe functionality wrapping
 
src/
 └─ features/
     └─ stripe/
         ├─ PaymentMethodsManager.jsx        # React context for Auth
         └─ stripe.js                        # Stripe helpers functions
 
 
```

## Get Your Stripe API Keys

1. Log into [Stripe Dashboard](https://dashboard.stripe.com/).  
2. Navigate to **Developers → API keys**.  
3. You’ll see:
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`) → used in frontend.
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`) → used in backend (Firebase Functions).

⚠️ Never expose the secret key in frontend code.

## Store Secrets in Firebase

Firebase Functions uses **Secrets Manager** for production keys.  
Run the following in your project root:

### Test mode
```bash
export STRIPE_SECRET=sk_test_12345
firebase emulators:start --only functions
```

### Production Mode
```bash
firebase functions:secrets:set STRIPE_SECRET --project <your-test-project-id>
```

## Enabling Additional Payment Methods
Stripe’s Payment Element automatically shows the methods that are:
- Enabled in your Dashboard [Stripe Dashboard](https://dashboard.stripe.com/).  
- Navigate to Settings -> Payments -> Payment Methods
- Supported for the currency and customer region
- Bizum → only for Spanish merchants, currency must be eur.
- Google Pay → requires HTTPS (or localhost), Chrome/Android with Google Pay configured.
- Apple Pay → requires domain verification in Stripe Dashboard and works only in Safari/iOS/macOS.
