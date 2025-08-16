import { onCall, onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { listUsers, addUser, deleteUser, setUserRole } from "./users.js";
import smtpConfig from "./nodemailer-conf.js";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";

initializeApp();

const sendMagicLinkEmail = onCall(async (req) => {
  console.log("------sendMagicLinkEmail----------");
  const db = getFirestore();
  const { to, appName, recipientName, expirationMinutes, supportEmail } = req.data;

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

const magicLinkHandler = onRequest(async (req, res) => {
  console.log('----------magicLinkHandler----------');
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
  console.log("  // Create a Firebase custom token");

  res.status(200).send("You may now return to the app");
});

export {
  listUsers,
  addUser,
  deleteUser,
  setUserRole,
  sendMagicLinkEmail,
  magicLinkHandler
};


