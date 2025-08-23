// Development authentication helper for multi-role development
// This file should be gitignored in production

interface DevUser {
  id: number;
  role: "technician" | "admin" | "user";
  name: string;
  email: string;
}

const DEV_USERS: Record<string, DevUser> = {
  technician: {
    id: 1,
    role: "technician",
    name: "Tech Dev",
    email: "tech@dev.local",
  },
  admin: {
    id: 2,
    role: "admin",
    name: "Admin Dev",
    email: "admin@dev.local",
  },
  user: {
    id: 3,
    role: "user",
    name: "User Dev",
    email: "user@dev.local",
  },
};

export function getDevUser(): DevUser | null {
  if (process.env.NODE_ENV !== "development") return null;

  const devRole = process.env.NEXT_PUBLIC_DEV_ROLE;
  if (!devRole || !DEV_USERS[devRole]) return null;

  return DEV_USERS[devRole];
}

export function isDevMode(): boolean {
  const isDev =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEV_MODE === "true";

  // Debug logging
  console.log("🔧 Dev Mode Check:", {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
    NEXT_PUBLIC_DEV_ROLE: process.env.NEXT_PUBLIC_DEV_ROLE,
    isDevMode: isDev,
  });

  return isDev;
}

export function getDevRole(): string | null {
  if (!isDevMode()) return null;
  return process.env.NEXT_PUBLIC_DEV_ROLE || null;
}

// Helper to check if current dev user has required role
export function hasDevRole(requiredRole: string): boolean {
  const devUser = getDevUser();
  return devUser?.role === requiredRole;
}
