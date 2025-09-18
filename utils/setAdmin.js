import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import admin from "firebase-admin";

if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  admin.initializeApp({ projectId: "my-firebase-demo-555" });
} else {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, "serviceAccountKey.json"), "utf-8")
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const email = process.argv[2];

if (!email) {
  console.error("Usage: node setAdmin.js <email>");
  process.exit(1);
}

try {
  const userRecord = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(userRecord.uid, { role: "admin" });
  console.log(`✅ User ${email} is now an admin`);
} catch (err) {
  console.error("❌ Error setting admin:", err);
  process.exit(1);
}
