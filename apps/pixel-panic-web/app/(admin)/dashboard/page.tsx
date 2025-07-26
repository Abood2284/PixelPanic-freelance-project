import {
  IconCurrencyRupee,
  IconTools,
  IconClockHour4,
  IconShoppingCart,
} from "@tabler/icons-react";
import { StatCard } from "../components/stat-card";

export default function DashboardPage() {
  // We'll use mock data until we build the API endpoint.
  const summary = {
    monthlyRevenue: 75350,
    completedJobs: 125,
    pendingOrders: 8,
    averageRepairTimeMinutes: 85,
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
        Dashboard Overview
      </h1>

      {/* KPI Cards Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Revenue"
          value={`₹${summary.monthlyRevenue.toLocaleString("en-IN")}`}
          icon={
            <IconCurrencyRupee className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          }
        />
        <StatCard
          title="Completed Jobs (Month)"
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

      {/* Recent Orders Section - To be built next */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Recent Orders
        </h2>
        <div className="p-8 bg-white dark:bg-neutral-900 rounded-lg shadow-sm">
          {/* Recent Orders Table will go here */}
          <p className="text-center text-slate-500 dark:text-slate-400">
            Recent Orders table coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
