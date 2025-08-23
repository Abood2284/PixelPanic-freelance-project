"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function TechnicianHeader() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  async function onLogout() {
    try {
      await fetch(`/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch {
      // ignore
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link
          href="/technician"
          className="font-semibold text-lg tracking-tight"
        >
          Technician
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/technician" className="text-sm hidden" aria-hidden>
            Today
          </Link>
          {isAuthenticated && user?.role === "technician" ? (
            <Button size="sm" variant="ghost" onClick={onLogout}>
              Sign Out
            </Button>
          ) : (
            <Link href="/technician" className="text-sm underline">
              Home
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
