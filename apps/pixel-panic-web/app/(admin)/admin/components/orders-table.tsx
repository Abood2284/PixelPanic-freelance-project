// apps/pixel-panic-web/app/(admin)/components/orders-table.tsx
"use client";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

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
  const [open, setOpen] = useState<null | number>(null);
  const [techs, setTechs] = useState<
    { id: string; name: string | null; phoneNumber: string }[] | null
  >(null);
  const [selectedTech, setSelectedTech] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function openAssign(orderId: number) {
    setOpen(orderId);
    setSelectedTech("");
    try {
      const res = await fetch(`/api/admin/technicians`, {
        cache: "no-store",
      });
      const list = (await res.json()) as {
        id: string;
        name: string | null;
        phoneNumber: string;
      }[];
      setTechs(list);
    } catch {
      setTechs([]);
    }
  }

  async function assign(orderId: number) {
    if (!selectedTech) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/assign-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, technicianId: selectedTech }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data?.message || "Failed to assign");
      setOpen(null);
    } finally {
      setLoading(false);
    }
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No orders to display.
      </div>
    );
  }

  return (
    <>
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
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
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
                  <Link href={`/admin/orders/${order.id}`}>
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
                <Button
                  className="ml-2"
                  size="sm"
                  variant="default"
                  onClick={() => openAssign(order.id)}
                >
                  Assign
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Assign Technician Dialog */}
      <Dialog
        open={open !== null}
        onOpenChange={(v) => setOpen(v ? open : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <select
              className="w-full border rounded-md p-2"
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              <option value="">Select technician</option>
              {(techs ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || "Unnamed"} — {t.phoneNumber}
                </option>
              ))}
            </select>
            <div className="text-sm text-slate-500">
              On assign, an OTP is generated for job completion.
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(null)}>
                Cancel
              </Button>
              <Button
                disabled={!selectedTech || loading}
                onClick={() => assign(open!)}
              >
                {loading ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================================
// TYPES
// ============================================================================
// Props interface has been renamed
interface OrdersTableProps {
  orders: TOrderSummary[];
}
