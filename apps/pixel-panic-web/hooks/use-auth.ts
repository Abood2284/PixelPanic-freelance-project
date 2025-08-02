// apps/pixel-panic-web/hooks/use-auth.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthModal } from "./use-auth-modal";

interface User {
  id: string;
  name: string | null;
  phoneNumber: string;
  role: "admin" | "customer";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { openModal } = useAuthModal();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
      openModal();
      return false;
    }

    // If we have a user, proceed.
    return true;
  }, [user, isLoading, openModal]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    requireAuth,
  };
}
