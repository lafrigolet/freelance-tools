# User Management with Firebase

This branch handles all of the user management flow: login, signup, admin...

## Installation
1. npm install
2. firebase init
3. firebase init functions
4. firebase emulators:start
5. npm run dev

---
## Nodemailer setup
For sending custom emails to the user, nodemailer is used in firebase functions
and needs to be setup.

1. Log in to an existing google account or create a new one.
2. Go to your [Google Account](https://myaccount.google.com/).
3. In the left sidebar, click Security.
4. Scroll to the section “How you sign in to Google.”
5. Find 2-Step Verification and click Get Started.
6. Sign in with your Google password.
7. Choose your verification method. Common options:
   - Google prompt (push notification on your phone)
   - Authenticator app (Google Authenticator, Authy, etc.)
   - Text message or phone call
8. Follow the on-screen instructions to set it up.
9. Once configured, logins to your Google account will require your password plus the second factor.
10. Under "Signing in to Google", select App passwords.
11. Create a new app password for “Mail” → “Other (Custom)”.
12. Copy the 16-character password and use it as your SMTP password.

---
## Deploy to Firebase

---
## Files
src/
 ├─ LoginDialog.jsx
 ├─ SignUpDialog.jsx
 ├─ PhoneNumberInput.jsx
 ├─ firebase-emulators.js
 └─ contexts/
     └─ AuthContext.jsx

functions/
 ├─ nodemailer-conf.js
 └─ users.js


