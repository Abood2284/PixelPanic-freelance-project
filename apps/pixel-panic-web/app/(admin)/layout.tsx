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
} from "@tabler/icons-react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";

// Define the links that will appear in the sidebar.
const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <IconLayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Orders",
    href: "/orders", // Placeholder for new page
    icon: (
      <IconShoppingCart className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Pricing Matrix",
    href: "/pricing", // Placeholder for new page
    icon: (
      <IconDatabase className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Technicians",
    href: "/technicians", // Placeholder for new page
    icon: (
      <IconUsers className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Customers",
    href: "/customers", // Placeholder for new page
    icon: (
      <IconUserCircle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Analytics",
    href: "/analytics", // Placeholder for new page
    icon: (
      <IconChartBar className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
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
    <div className="flex min-h-screen w-full flex-col bg-slate-100 dark:bg-neutral-950 md:flex-row">
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
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: (
                  <IconBox className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {/* The main content area grows to fill the remaining space */}
      <main className="flex flex-1 flex-col p-4 md:p-8">{children}</main>
    </div>
  );
}
