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
import { TOrderSummary } from "@/types/admin";

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
  // On the server, we need to provide the full URL to the API route.
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${apiBase}/api/admin/dashboard`, {
    // Revalidate data every 5 minutes
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    // This will be caught by the error boundary
    throw new Error("Failed to fetch dashboard data.");
  }

  return response.json();
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { summary, recentOrders } = data;

  return (
    <div className="flex flex-col gap-8">
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
}
function getApiBaseUrl() {
  throw new Error("Function not implemented.");
}
