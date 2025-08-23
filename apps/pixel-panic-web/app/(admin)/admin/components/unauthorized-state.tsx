"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAuthModal } from "@/hooks/use-auth-modal";

interface UnauthorizedStateProps {
  status: 401 | 403;
}

export function UnauthorizedState({ status }: UnauthorizedStateProps) {
  const { user, isLoading } = useAuth();
  const { openModal } = useAuthModal();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const message = useMemo(() => {
    if (status === 401)
      return "You need to sign in to access the admin dashboard.";
    return "You are signed in but not authorized to access the admin dashboard.";
  }, [status]);

  if (isLoading) return null;

  async function handleLogin() {
    try {
      localStorage.setItem("nextAfterLogin", "/admin/dashboard");
    } catch {}
    openModal();
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch(`/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    window.location.assign("/admin/dashboard");
  }

  return (
    <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-neutral-900">
      <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Access Restricted
      </h2>
      <p className="mb-6 text-slate-600 dark:text-slate-300">{message}</p>

      {user ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="secondary"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </Button>
          <Button onClick={handleLogin}>Sign in as admin</Button>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Button onClick={handleLogin}>Sign in to continue</Button>
        </div>
      )}
    </div>
  );
}
