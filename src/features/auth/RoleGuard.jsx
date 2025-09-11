import React from "react";
import { useAuthContext } from "../auth/AuthContext"; // adjust path

/**
 * RoleGuard
 * 
 * Usage:
 * <RoleGuard allowedRoles={["admin", "manager"]}>
 *   <AdminPanel />
 * </RoleGuard>
 */
export default function RoleGuard({ allowedRoles, children, fallback = null }) {
  const { user, claims, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return fallback || <div>You must be logged in.</div>;
  }

  console.log('user role: ', claims?.role);

  const hasAccess = allowedRoles.some((role) => claims?.role === role);

  if (!hasAccess) {
    return fallback || <div>Access denied.</div>;
  }

  return <>{children}</>;
}
