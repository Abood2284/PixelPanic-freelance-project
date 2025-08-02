// apps/pixel-panic-web/components/shared/Header.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, User, LogOut, Wrench } from "lucide-react";
import { useAuth } from "@/hooks/use-auth"; // 1. Replaced next-auth with our new useAuth hook

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Header() {
  // 2. Using our custom hook for auth state
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Don't show anything while determining auth state
  if (isLoading) {
    return null;
  }

  // Don't show the header at all if the user is not logged in
  if (!isAuthenticated) {
    return null;
  }

  const isHomePage = pathname === "/";
  const showBackButton = !isHomePage;

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        {showBackButton ? (
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const brandSelector = document.getElementById("brand-selector");
                if (brandSelector) {
                  brandSelector.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-sm"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Repair Now
            </Button>
          </div>
        )}

        <Link href="/" className="font-bold text-lg">
          PixelPanic
        </Link>

        {/* 3. Pass the user object to the UserMenu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}

function UserMenu({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // 4. New handleLogout function calls our /api/auth/logout endpoint
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      // Use window.location for a full refresh to clear all client-side state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 overflow-hidden"
        >
          <div className="flex items-center justify-center w-full h-full bg-slate-200 text-slate-500">
            <User className="w-6 h-6" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium">My Account</p>
          <p className="text-xs text-muted-foreground font-normal">
            {user?.phoneNumber}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/orders" className="cursor-pointer">
            <Wrench className="mr-2 h-4 w-4" />
            <span>My Repairs</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export { Header };
