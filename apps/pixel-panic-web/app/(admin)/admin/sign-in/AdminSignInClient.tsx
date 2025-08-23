"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useAuth } from "@/hooks/use-auth";

export function AdminSignInClient() {
  const params = useSearchParams();
  const { openModal } = useAuthModal();
  const next = params.get("next") || "/admin/dashboard";
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    try {
      localStorage.setItem("nextAfterLogin", next);
    } catch {}
    openModal();
  }, [openModal, next]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (user.role !== "admin") {
      router.replace("/admin/forbidden");
      return;
    }
    router.replace(next);
  }, [user, isLoading, router, next]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Admin sign-in required</h1>
      <p className="text-sm text-muted-foreground">
        Your session has expired or you don't have access. Please sign in to
        continue.
      </p>
      <div className="flex gap-2">
        <Button onClick={() => openModal()}>Open Sign-in</Button>
        <a href={next} className="text-sm underline">
          Return to previous page
        </a>
      </div>
    </main>
  );
}
