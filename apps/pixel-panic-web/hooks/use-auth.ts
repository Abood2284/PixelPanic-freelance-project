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
        console.log("Fetching user session from /api/auth/me");
        // Use relative path so cookies are first-party via Next rewrites
        const response = await fetch(`/api/auth/me`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Auth API response status:", response.status);

        if (response.ok) {
          const data = (await response.json()) as { user: User };
          console.log("User data received:", data);
          setUser(data.user);
        } else if (response.status === 401) {
          // 401 is expected when user is not authenticated - don't log as error
          console.log("User not authenticated (401)");
          setUser(null);
        } else {
          // Only log as error for unexpected status codes
          const errorText = await response.text();
          console.error("Auth API error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });
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

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Always clear the user state, even if the logout request fails
      setUser(null);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    requireAuth,
    logout,
  };
}
