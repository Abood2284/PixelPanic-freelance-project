import { cookies } from "next/headers";
import { apiFetch } from "@/server";
import { redirect } from "next/navigation";
import { getDevUser, isDevMode, hasDevRole } from "./dev-auth";

interface AuthOptions {
  requiredRole?: "technician" | "admin" | "user";
  redirectTo?: string;
}

export async function getAuthUser(options: AuthOptions = {}) {
  const { requiredRole, redirectTo = "/" } = options;

  // Development mode handling
  if (isDevMode()) {
    const devUser = getDevUser();

    if (!devUser) {
      console.warn(
        "Dev mode enabled but no dev role set. Set NEXT_PUBLIC_DEV_ROLE in .env.local"
      );
      return null;
    }

    // Check if dev user has required role
    if (requiredRole && !hasDevRole(requiredRole)) {
      console.warn(
        `Dev user role '${devUser.role}' doesn't match required role '${requiredRole}'`
      );
      if (redirectTo) redirect(redirectTo);
      return null;
    }

    return {
      user: devUser,
      isDev: true,
    };
  }

  // Production auth handling
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    if (redirectTo) redirect(redirectTo);
    return null;
  }

  try {
    // Use server apiFetch so cookies/headers are forwarded same-origin
    const res = await apiFetch(`/api/auth/me`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (redirectTo) redirect(redirectTo);
      return null;
    }

    const me = (await res.json()) as { user?: { role?: string } };

    if (!me.user) {
      if (redirectTo) redirect(redirectTo);
      return null;
    }

    // Check role if required
    if (requiredRole && me.user.role !== requiredRole) {
      if (redirectTo) redirect(redirectTo);
      return null;
    }

    return {
      user: me.user,
      isDev: false,
    };
  } catch (error) {
    console.error("Auth check failed:", error);
    if (redirectTo) redirect(redirectTo);
    return null;
  }
}

// Convenience functions for specific roles
export async function requireTechnician(redirectTo?: string) {
  return getAuthUser({ requiredRole: "technician", redirectTo });
}

export async function requireAdmin(redirectTo?: string) {
  return getAuthUser({ requiredRole: "admin", redirectTo });
}

export async function requireUser(redirectTo?: string) {
  return getAuthUser({ requiredRole: "user", redirectTo });
}

// Optional auth - doesn't redirect, just returns user if available
export async function getOptionalAuth() {
  return getAuthUser({ redirectTo: undefined });
}
