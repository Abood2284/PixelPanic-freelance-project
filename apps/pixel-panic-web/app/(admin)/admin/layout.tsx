// apps/pixel-panic-web/app/(admin)/layout.tsx
import {
  IconBox,
  IconChartBar,
  IconDatabase,
  IconLayoutDashboard,
  IconLogout,
  IconSettings,
  IconShoppingCart,
  IconUserCircle,
  IconUsers,
  IconTicket,
} from "@tabler/icons-react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { AdminLogoutLink } from "@/components/admin/logout-link";
import { cn } from "@/lib/utils";
import { inter, spaceGrotesk } from "@/public/fonts/fonts";

// Define the links that will appear in the sidebar.
const links = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <IconLayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders", // Placeholder for new page
    icon: (
      <IconShoppingCart className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Pricing Matrix",
    href: "/admin/pricing", // Placeholder for new page
    icon: (
      <IconDatabase className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    subMenus: [
      {
        label: "Add Brand",
        href: "/admin/pricing/add-brand",
      },
      {
        label: "Add Model",
        href: "/admin/pricing/add-model",
      },
    ],
  },
  {
    label: "Technicians",
    href: "/admin/technicians", // Placeholder for new page
    icon: (
      <IconUsers className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    subMenus: [
      { label: "Invitations", href: "/admin/technician-invitations" },
      { label: "Technicians", href: "/admin/technicians" },
    ],
  },
  {
    label: "Customers",
    href: "/admin/customers", // Placeholder for new page
    icon: (
      <IconUserCircle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Analytics",
    href: "/admin/analytics", // Placeholder for new page
    icon: (
      <IconChartBar className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: (
      <IconTicket className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
];

// The secondary links at the bottom of the sidebar
const bottomLinks = [
  {
    label: "Settings",
    href: "#",
    icon: (
      <IconSettings className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Logout",
    href: "#",
    icon: (
      <IconLogout className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The main container uses flex to position the sidebar and content side-by-side.
    <div
      className={cn(
        "admin-fonts flex min-h-screen w-full flex-col bg-slate-100 dark:bg-neutral-950 md:flex-row font-sans",
        inter.variable,
        spaceGrotesk.variable,
      )}
    >
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col">
            {/* You can add a logo or header here if you want */}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          {/* A secondary section at the bottom of the sidebar */}
          <div>
            <AdminLogoutLink />
          </div>
        </SidebarBody>
      </Sidebar>
      {/* The main content area grows to fill the remaining space */}
      <main className="flex flex-1 flex-col p-4 md:p-8">{children}</main>
    </div>
  );
}
