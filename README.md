# Firebase
This branch handles firebase setup. It is intented to keep all the logic
for switching between firebase or emulator deploying.

## Deploy to emulators
1. npm install
2. firebase init
3. firebase init functions (just in case you want to add functions)
4. firebase emulators:start 
5. npm run dev

## Deploy to Firebase

## Files

```bash
src/
 ├─ firebase.js
 └─ firebase-emulators.js
```

## How to handle secrets in emulators
- Use .secret.local for local overrides
- In your functions/ folder, create a file .secret.local
- Add your test keys there (for example, your Stripe test secret).
```bash
STRIPE_SECRET=sk_test_123456...
```
When you run:
```bash
firebase emulators:start
```
the emulator will load these secrets for your functions.

## How to handle secrets in production
- In prod, you still set your secrets using:
```bash
firebase functions:secrets:set STRIPE_SECRET
```
- This stores them securely in Secret Manager and they’ll only be accessible in deployed functions.

