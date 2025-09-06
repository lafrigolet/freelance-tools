# User Management with Firebase

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

# Getnet TPV Virtual Credentials Setup

This guide explains how to obtain the required credentials from **Santander Getnet (Redsys
TPV Virtual)** and configure them in Firebase Functions.

---

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

