// apps/pixel-panic-web/hooks/use-auth.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuthModal } from "./use-auth-modal";

interface User {
  id: string;
  name: string | null;
  phoneNumber: string;
  role: "admin" | "customer" | "technician";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { openModal } = useAuthModal();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Use relative path so cookies are first-party via Next rewrites
        const response = await fetch(`/api/auth/me`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = (await response.json()) as { user: User };
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        console.error("Failed to fetch user session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const requireAuth = useCallback(() => {
    // If we're still loading the session, wait.
    if (isLoading) return false;

    // If there's no user, open the login modal.
    if (!user) {
      try {
        const current = window.location.pathname + window.location.search;
        localStorage.setItem("nextAfterLogin", current || pathname || "/");
      } catch {}
      openModal();
      return false;
    }

    // If we have a user, proceed.
    return true;
  }, [user, isLoading, openModal, pathname]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    requireAuth,
  };
}
