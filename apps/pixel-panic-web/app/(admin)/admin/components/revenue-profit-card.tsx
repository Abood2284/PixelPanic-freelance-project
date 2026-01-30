import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  IconCurrencyRupee,
  IconTrendingUp,
  IconTrendingDown,
  IconCoin,
} from "@tabler/icons-react";

interface RevenueProfitCardProps {
  revenue: number;
  profit: number;
  totalCosts: number;
}

export function RevenueProfitCard({
  revenue,
  profit,
  totalCosts,
}: RevenueProfitCardProps) {
  const isProfitPositive = profit >= 0;

  return (
    <Card className="transition-all hover:shadow-md dark:hover:shadow-slate-800/50 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Revenue & Profit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Revenue */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <IconCurrencyRupee className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Revenue</span>
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ₹{revenue.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Profit */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              {isProfitPositive ? (
                <IconTrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <IconTrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span>Profit</span>
            </div>
            <div
              className={`text-2xl font-bold ${
                isProfitPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ₹{profit.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Total Costs */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <IconCoin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Total Costs</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{totalCosts.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
