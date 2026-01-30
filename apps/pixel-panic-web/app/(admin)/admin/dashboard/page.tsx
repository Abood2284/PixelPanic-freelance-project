// apps/pixel-panic-web/app/(admin)/dashboard/page.tsx

import {
  IconTools,
  IconClockHour4,
  IconShoppingCart,
} from "@tabler/icons-react";
import { Suspense } from "react";
import { StatCard } from "../components/stat-card";
import { OrdersTable } from "../components/orders-table";
import { UnauthorizedState } from "../components/unauthorized-state";
import { LoggedInToast } from "@/app/(admin)/admin/components/logged-in-toast";
import { RevenueProfitCard } from "../components/revenue-profit-card";
import { DashboardDateFilter } from "../components/dashboard-date-filter";
import { TOrderSummary } from "@/types/admin";
import { apiFetch } from "@/server";

export const dynamic = "force-dynamic";

interface DashboardData {
  summary: {
    revenue: number;
    profit: number;
    totalCosts: number;
    completedJobs: number;
    pendingOrders: number;
    averageRepairTimeMinutes: number;
  };
}

interface DashboardPageProps {
  searchParams: Promise<{
    duration?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

async function getDashboardData(
  duration?: string,
  startDate?: string,
  endDate?: string
): Promise<DashboardData> {
  const params = new URLSearchParams();
  if (duration) params.set("duration", duration);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const queryString = params.toString();
  const url = `/api/admin/dashboard${queryString ? `?${queryString}` : ""}`;

  // Use relative path so Next rewrites proxy to worker in prod and dev
  const response = await apiFetch(url, {
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

async function getAllOrders(
  duration?: string,
  startDate?: string,
  endDate?: string
): Promise<TOrderSummary[]> {
  const params = new URLSearchParams();
  if (duration) params.set("duration", duration);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const queryString = params.toString();
  const url = `/admin/orders${queryString ? `?${queryString}` : ""}`;

  const response = await apiFetch(url, {
    next: { revalidate: 300 },
  });

  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (response.status === 403) throw new Error("FORBIDDEN");
  if (!response.ok) throw new Error("Failed to fetch orders.");

  return response.json();
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  try {
    const params = await searchParams;
    const [data, orders] = await Promise.all([
      getDashboardData(params.duration, params.startDate, params.endDate),
      getAllOrders(params.duration, params.startDate, params.endDate),
    ]);
    const { summary } = data;

    return (
      <div className="flex flex-col gap-8">
        <LoggedInToast />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Dashboard Overview
          </h1>
          <Suspense fallback={<div className="h-10 w-64" />}>
            <DashboardDateFilter />
          </Suspense>
        </div>

        {/* KPI Cards Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <RevenueProfitCard
            revenue={summary.revenue}
            profit={summary.profit}
            totalCosts={summary.totalCosts}
          />
          <StatCard
            title="Completed Jobs"
            value={summary.completedJobs.toString()}
            icon={
              <IconTools className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            }
          />
          <StatCard
            title="Pending Orders"
            value={summary.pendingOrders.toString()}
            icon={
              <IconShoppingCart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            }
          />
          <StatCard
            title="Average Repair Time"
            value={`${summary.averageRepairTimeMinutes} min`}
            icon={
              <IconClockHour4 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            }
          />
        </div>

        {/* Orders Section */}
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Orders
          </h2>
          <div className="md:overflow-hidden md:rounded-lg md:border md:border-slate-200 md:bg-white md:shadow-sm md:dark:border-slate-800 md:dark:bg-neutral-900">
            <Suspense fallback={<p>Loading orders...</p>}>
              <OrdersTable
                orders={orders}
                lazyRender={{ initialCount: 25, pageSize: 25 }}
              />
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
