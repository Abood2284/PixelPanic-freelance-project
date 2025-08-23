"use client";

import { SidebarLink } from "@/components/ui/sidebar";
import { IconLogout } from "@tabler/icons-react";

export function AdminLogoutLink() {
  async function handleLogout(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const next = window.location.pathname || "/admin/dashboard";
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    window.location.assign(`/admin/sign-in?next=${encodeURIComponent(next)}`);
  }

  return (
    <SidebarLink
      link={{
        label: "Logout",
        href: "#",
        icon: (
          <IconLogout className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
      }}
      onClick={handleLogout}
    />
  );
}
