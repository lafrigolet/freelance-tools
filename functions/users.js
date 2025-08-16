import { onCall, onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const listUsers = onCall({ region: "us-central1" }, async (request) => {
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
export const addUser = onCall({ region: "us-central1" }, async ({ auth, data }) => {
  if (auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Only admins can add users.");
  }

  const { email, role } = data;
  const user = await getAuth().createUser({ email });
  await getAuth().setCustomUserClaims(user.uid, { role: role || "user" });
  return { message: `User ${email} created with role ${role || "user"}` };
});


// Delete user
export const deleteUser = onCall({ region: "us-central1" }, async ({ auth, data }) => {
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
export const setUserRole = onCall({ region: "us-central1" }, async ({ auth, data }) => {
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
