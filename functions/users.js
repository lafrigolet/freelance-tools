import { onCall, onRequest } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import smtpConfig from "./nodemailer-conf.js";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";

export const listUsers = onCall(async (request) => {
  const context = request;

  console.log("Auth context: ", context.auth);

  if (!context.auth) {
    throw new Error("User must be authenticated");
  }

  if (context.auth.token.role !== "admin") {
    throw new Error("Admin role required");
  }

  const auth = getAuth();
  const list = await auth.listUsers(1000);

  return {
    users: list.users.map((u) => ({
      uid: u.uid,
      email: u.email,
      role: u.customClaims?.role || "user",
    })),
  };
});

// Add new user with default role
export const addUser = onCall(async ({ auth, data }) => {
  if (auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Only admins can add users.");
  }

  const { email, role } = data;
  const user = await getAuth().createUser({ email });
  await getAuth().setCustomUserClaims(user.uid, { role: role || "user" });
  return { message: `User ${email} created with role ${role || "user"}` };
});


// Delete user
export const deleteUser = onCall(async ({ auth, data }) => {
  if (auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Only admins can delete users.");
  }

  const { uid } = data;
  if (!uid) {
    throw new Error("'uid' is required.");
  }

  await getAuth().deleteUser(uid);
  return { message: `User ${uid} deleted.` };
});

// Set user role (admin, manager, user)
export const setUserRole = onCall(async ({ auth, data }) => {
  // Only allow users with role "admin" to set roles
  if (auth?.token?.role !== "admin") {
    throw new Error("Only admins can set roles.");
  }

  const { uid, role } = data;

  // Basic input validation
  if (!uid || !role) {
    throw new Error("Both 'uid' and 'role' are required.");
  }

  const validRoles = ["admin", "manager", "user"];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role: '${role}'. Allowed: ${validRoles.join(", ")}`);
  }

  const authClient = getAuth();
  await authClient.setCustomUserClaims(uid, { role });

  return { message: `Role '${role}' set for user ${uid}` };
});

const userExist = async (email) => {
  try {
    const userRecord = await getAuth().getUserByEmail(email);
    return true;
  } catch (err) {
    return false;
  }
}

export const sendMagicLinkEmail = onCall(async (req) => {
  const db = getFirestore();
  const {
    to,
    appName = "Bill App",
    recipientName = "",
    expirationMinutes = 5,
    supportEmail = "billapp74@gmail.com",
    exist,
  } = req.data;

  console.log(to, exist, await userExist(to));
  if (exist != await userExist(to))
    return;

  console.log('sending email');
  
  if (!to) throw new Error("Missing email address");

  // 1. Generate our own magic link token
  const token = randomUUID();

  // 2. Save token mapping in Firestore
  await db.collection("pendingMagicLinks").doc(token).set({
    email: to,
    createdAt: Date.now(),
    expiresAt: Date.now() + expirationMinutes * 60 * 1000
  });

  // 3. Build link to your magic link handler
  const magicLinkUrl =
    `${process.env.FUNCTIONS_EMULATOR === "true"
      ? "http://127.0.0.1:5001/my-firebase-demo-555/us-central1"
      : "https://us-central1-my-firebase-demo-555.cloudfunctions.net"}` +
    `/magicLinkHandler?token=${encodeURIComponent(token)}`;


  // 4. Email content
  const subject = `${appName} Sign-In Confirmation`;

  const text = `
Hi${recipientName ? " " + recipientName : ""},

We received a request to sign in to your ${appName} account.

Click the link below to confirm and sign in:
${magicLinkUrl}

This link will expire in ${expirationMinutes} minutes. If you didn’t request this, you can safely ignore this email.

— The ${appName} Team
${supportEmail}
`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
  <h2>Sign in to ${appName}</h2>
  <p>Hi${recipientName ? " " + recipientName : ""},</p>
  <p>We received a request to sign in to your ${appName} account.</p>
  <p>
    <a href="${magicLinkUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px;
       text-decoration: none; border-radius: 4px; display: inline-block;">
      Confirm Sign-In
    </a>
  </p>
  <p>This link will expire in <strong>${expirationMinutes} minutes</strong>.</p>
  <p>If you didn’t request this, you can safely ignore this email.</p>
  <p>— The ${appName} Team<br>
     <a href="mailto:${supportEmail}">${supportEmail}</a></p>
</body>
</html>
`;

  // 5. Send email via Nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "billapp74@gmail.com",
      pass: "zudu sttu wnmf wylr"
    }
  });
  
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });

  return {success: true, info };
});

export const magicLinkHandler = onRequest(async (req, res) => {
  const auth = getAuth();
  const db = getFirestore();

  const tokenParam = req.query.token;
  if (!tokenParam) return res.status(400).send("Missing token");
  const snap = await db.collection("pendingMagicLinks").doc(tokenParam).get();
  if (!snap.exists) return res.status(400).send("Invalid or expired link");

  const { email, expiresAt } = snap.data();
  if (Date.now() > expiresAt) {
    await snap.ref.delete();
    return res.status(400).send("Link expired");
  }
  await db.collection("pendingMagicLinks").doc(tokenParam).delete();

  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch {
    user = await auth.createUser({ email });
  }

  // Optionally set a default role
  if (!user.customClaims?.role) {
    await auth.setCustomUserClaims(user.uid, { role: "user" });
  }

  // Create a Firebase custom token
  const token = await auth.createCustomToken(user.uid);
  await db.collection("magicLinks").doc(email).set({ token, createdAt: Date.now() });

  res.status(200).send("You may now return to the app");
});

// Errors are handled by exceptions on the client
export const registerUser = onCall(async (req) => {
  const auth = getAuth();
  const db = getFirestore();
  const { email, firstName, lastName, phone } = req.data;

  if (!email)
    throw new Error("Email is required");

  const userRecord = await auth.getUserByEmail(email);
  const { uid } = userRecord;
  
  // Create/update Firestore user document
  await db.collection("users").doc(uid).set({
    uid,
    email,
    firstName,
    lastName,
    phone,
    createdAt: new Date(),
  });
  
  return { success: true, uid };
});

