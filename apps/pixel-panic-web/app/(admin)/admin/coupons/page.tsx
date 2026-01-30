// apps/pixel-panic-web/app/(admin)/admin/coupons/page.tsx

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconTicket } from "@tabler/icons-react";
import Link from "next/link";
import { apiFetch } from "@/server";
import { TCouponSummary, TCouponUsageStats } from "@/types/admin";
import { formatOrderDate } from "@/lib/utils";

interface CouponsData {
  coupons: TCouponSummary[];
  stats: TCouponUsageStats;
}

async function getCouponsData(): Promise<CouponsData> {
  const response = await apiFetch("/admin/coupons", {
    next: { revalidate: 300 },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) throw new Error("Failed to fetch coupons data.");

  return response.json();
}

function CouponStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    active: { label: "Active", variant: "default" as const },
    inactive: { label: "Inactive", variant: "secondary" as const },
    expired: { label: "Expired", variant: "destructive" as const },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function CouponTypeBadge({ type }: { type: string }) {
  const typeConfig = {
    percentage: { label: "Percentage", variant: "outline" as const },
    fixed_amount: { label: "Fixed Amount", variant: "outline" as const },
    service_upgrade: { label: "Service Upgrade", variant: "outline" as const },
  };

  const config =
    typeConfig[type as keyof typeof typeConfig] || typeConfig.percentage;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function CouponsTable({ coupons }: { coupons: TCouponSummary[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
              Code
            </th>
            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
              Name
            </th>
            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
              Type
            </th>
            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
              Value
            </th>
            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
              Usage
            </th>
            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
              Status
            </th>
            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
              Valid Until
            </th>
            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr
              key={coupon.id}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
            >
              <td className="py-3 px-4">
                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono">
                  {coupon.code}
                </code>
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {coupon.name}
                  </div>
                  {coupon.description && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {coupon.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <CouponTypeBadge type={coupon.type} />
              </td>
              <td className="py-3 px-4">
                <div className="font-medium">
                  {coupon.type === "percentage" && `${coupon.value}%`}
                  {coupon.type === "fixed_amount" && `₹${coupon.value}`}
                  {coupon.type === "service_upgrade" && "Free Upgrade"}
                </div>
                {coupon.maximumDiscount && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Max: ₹{coupon.maximumDiscount}
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium">
                    {coupon.totalUsageCount}
                    {coupon.totalUsageLimit && ` / ${coupon.totalUsageLimit}`}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    ₹{coupon.totalDiscountGiven}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <CouponStatusBadge status={coupon.status} />
              </td>
              <td className="py-3 px-4">
                <div className="text-sm">
                  {formatOrderDate(coupon.validUntil)}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/coupons/${coupon.id}`}>View</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/coupons/${coupon.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatsCards({ stats }: { stats: TCouponUsageStats }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
          <IconTicket className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCoupons}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stats.activeCoupons} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          <IconTicket className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsage}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            times used
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
          <IconTicket className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{stats.totalDiscountGiven}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            given to customers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
          <IconTicket className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{stats.averageDiscountPerOrder}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            per order
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function CouponsPage() {
  const data = await getCouponsData();
  const { coupons, stats } = data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Coupon Management
        </h1>
        <Button asChild>
          <Link href="/admin/coupons/create">
            <IconPlus className="mr-2 h-4 w-4" />
            Create Coupon
          </Link>
        </Button>
      </div>

      <StatsCards stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p>Loading coupons...</p>}>
            <CouponsTable coupons={coupons} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
