// apps/pixel-panic-web/app/(admin)/components/orders-table.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TOrderSummary } from "@/types/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const statusVariantMap: Record<
  TOrderSummary["status"],
  "default" | "secondary" | "destructive" | "warning"
> = {
  pending_payment: "warning",
  confirmed: "secondary",
  in_progress: "secondary",
  completed: "default",
  cancelled: "destructive",
};

// Component has been renamed
export function OrdersTable({ orders }: OrdersTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No orders to display.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[120px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">PP-{order.id}</TableCell>
            <TableCell>
              <div className="font-medium">{order.user.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {order.user.phoneNumber}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={statusVariantMap[order.status] ?? "secondary"}
                className="capitalize"
              >
                {order.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </TableCell>
            <TableCell className="text-right">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(Number(order.totalAmount))}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link href={`/orders/${order.id}`}>
                  <span className="sr-only">View Details</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M1.5 12s3.75-7.5 10.5-7.5 10.5 7.5 10.5 7.5-3.75 7.5-10.5 7.5S1.5 12 1.5 12zm10.5 3a3 3 0 100-6 3 3 0 000 6z"
                    />
                  </svg>
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================================
// TYPES
// ============================================================================
// Props interface has been renamed
interface OrdersTableProps {
  orders: TOrderSummary[];
}
