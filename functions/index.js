const { onCall } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { onRequest } = require("firebase-functions/v2/https");

initializeApp();

exports.listUsers = onCall({ region: "us-central1" }, async (request) => {
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
exports.addUser = onCall({ region: "us-central1" }, async ({ auth, data }) => {
  if (auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Only admins can add users.");
  }

  const { email, role } = data;
  const user = await getAuth().createUser({ email });
  await getAuth().setCustomUserClaims(user.uid, { role: role || "user" });
  return { message: `User ${email} created with role ${role || "user"}` };
});


// Delete user
exports.deleteUser = onCall({ region: "us-central1" }, async ({ auth, data }) => {
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
exports.setUserRole = onCall({ region: "us-central1" }, async ({ auth, data }) => {
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

// exports.magicLinkHandler = onRequest({ region: "us-central1" }, async (req, res) => {
//   const db = getFirestore();
//   const auth = getAuth();

//   console.log('Starting magicLinkHandler...');
  
//   const oobCode = req.query.oobCode;

//   if (!oobCode) {
//     return res.status(400).send("Missing oobCode.");
//   }

//   try {
//     // Firebase uses this to validate email sign-in links too
//     const email = await auth.verifyPasswordResetCode(oobCode);

//     let user;
//     try {
//       user = await auth.getUserByEmail(email);
//     } catch {
//       user = await auth.createUser({ email });
//     }

//     // Optional: set default role
//     if (!user.customClaims || !user.customClaims.role) {
//       await auth.setCustomUserClaims(user.uid, { role: "user" });
//     }

//     const token = await auth.createCustomToken(user.uid);

//     await db.collection("magicLinks").doc(email).set({
//       token,
//       createdAt: Date.now(),
//     });

//     return res.status(200).send("You may now return to the app.");
//   } catch (err) {
//     console.error("Magic link error:", err);
//     return res.status(400).send("Invalid or expired link.");
//   }
// });

// Mocked version for testing only
exports.magicLinkHandler = onRequest({ region: "us-central1" }, async (req, res) => {
  const db = getFirestore();
  const auth = getAuth();

  const email = req.query.email || "test@example.com"; // fallback for emulator

  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch {
      user = await auth.createUser({ email });
    }

    const token = await auth.createCustomToken(user.uid);

    await db.collection("magicLinks").doc(email).set({
      token,
      createdAt: Date.now(),
    });

    return res.status(200).send(`Fake sign-in complete for ${email}.`);
  } catch (err) {
    console.error(err);
    return res.status(400).send("Mock sign-in failed.");
  }
});
