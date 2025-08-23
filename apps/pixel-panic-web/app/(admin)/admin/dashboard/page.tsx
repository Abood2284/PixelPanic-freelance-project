// apps/pixel-panic-web/app/(admin)/dashboard/page.tsx

import {
  IconCurrencyRupee,
  IconTools,
  IconClockHour4,
  IconShoppingCart,
} from "@tabler/icons-react";
import { Suspense } from "react";
import { StatCard } from "../components/stat-card";
import { OrdersTable } from "../components/orders-table";
import { UnauthorizedState } from "../components/unauthorized-state";
import { LoggedInToast } from "@/app/(admin)/admin/components/logged-in-toast";
import { TOrderSummary } from "@/types/admin";
import { apiFetch } from "@/server";

export const dynamic = "force-dynamic";

interface DashboardData {
  summary: {
    monthlyRevenue: number;
    completedJobs: number;
    pendingOrders: number;
    averageRepairTimeMinutes: number;
  };
  recentOrders: TOrderSummary[];
}

async function getDashboardData(): Promise<DashboardData> {
  // Use relative path so Next rewrites proxy to worker in prod and dev
  const response = await apiFetch(`/api/admin/dashboard`, {
    next: { revalidate: 300 },
  });

  if (response.status === 401) {
    // Bubble up a specific error so layout/route can decide UX (sign-in redirect or session-expired)
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    // Signed in but lacks admin role
    throw new Error("FORBIDDEN");
  }

  if (!response.ok) throw new Error("Failed to fetch dashboard data.");

  return response.json();
}

export default async function DashboardPage() {
  try {
    const data = await getDashboardData();
    const { summary, recentOrders } = data;

    return (
      <div className="flex flex-col gap-8">
        <LoggedInToast />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Dashboard Overview
        </h1>

        {/* KPI Cards Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Revenue (Last 30d)"
            value={`₹${summary.monthlyRevenue.toLocaleString("en-IN")}`}
            icon={
              <IconCurrencyRupee className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            }
          />
          <StatCard
            title="Completed Jobs (30d)"
            value={summary.completedJobs.toString()}
            icon={
              <IconTools className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            }
          />
          <StatCard
            title="New Pending Orders"
            value={summary.pendingOrders.toString()}
            icon={
              <IconShoppingCart className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            }
          />
          <StatCard
            title="Average Repair Time"
            value={`${summary.averageRepairTimeMinutes} min`}
            icon={
              <IconClockHour4 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            }
          />
        </div>

        {/* Recent Orders Section */}
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Recent Orders
          </h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-neutral-900">
            <Suspense fallback={<p>Loading recent orders...</p>}>
              <OrdersTable orders={recentOrders} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  } catch (err: any) {
    const message = String(err?.message || "");
    if (message === "UNAUTHORIZED") return <UnauthorizedState status={401} />;
    if (message === "FORBIDDEN") return <UnauthorizedState status={403} />;
    throw err;
  }
}
