"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function LoggedInToast() {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user?.phoneNumber) return;

    try {
      const key = "dashboardPhoneToastShown";
      const alreadyShown = sessionStorage.getItem(key);
      if (alreadyShown) return;
      toast(`Your Phone Number: ${user.phoneNumber}`);
      sessionStorage.setItem(key, "1");
    } catch {
      // non-blocking if storage is unavailable
      toast(`Your Phone Number: ${user.phoneNumber}`);
    }
  }, [isAuthenticated, isLoading, user?.phoneNumber]);

  return null;
}
