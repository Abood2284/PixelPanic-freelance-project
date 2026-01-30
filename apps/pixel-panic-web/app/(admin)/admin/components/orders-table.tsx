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
import { cn, formatOrderDate } from "@/lib/utils";
import { TOrderSummary } from "@/types/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";

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

const serviceModeLabelMap: Record<TOrderSummary["serviceMode"], string> = {
  doorstep: "Doorstep",
  carry_in: "Carry-in",
};

function getTimeSlotLabel(
  mode: TOrderSummary["serviceMode"],
  slot: TOrderSummary["timeSlot"]
) {
  if (slot && slot.trim().length > 0) return slot;
  return mode === "doorstep" ? "Not selected" : "Not applicable";
}

// Component has been renamed
export function OrdersTable({ orders, lazyRender }: OrdersTableProps) {
  const [open, setOpen] = useState<null | number>(null);
  const [techs, setTechs] = useState<
    { id: string; name: string | null; phoneNumber: string }[] | null
  >(null);
  const [selectedTech, setSelectedTech] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const lazyRenderEnabled = Boolean(lazyRender);
  const pageSize = lazyRender?.pageSize ?? 25;
  const initialCount = lazyRender?.initialCount ?? pageSize;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(
    lazyRenderEnabled ? Math.min(initialCount, orders.length) : orders.length
  );
  const canLoadMore = lazyRenderEnabled && visibleCount < orders.length;

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

  useEffect(() => {
    if (!lazyRenderEnabled) {
      setVisibleCount(orders.length);
      return;
    }
    setVisibleCount(Math.min(initialCount, orders.length));
  }, [orders.length, lazyRenderEnabled, initialCount]);

  useEffect(() => {
    if (!lazyRenderEnabled || !sentinelRef.current || !canLoadMore) return;
    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((count) => Math.min(count + pageSize, orders.length));
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [lazyRenderEnabled, canLoadMore, orders.length, pageSize]);

  const displayOrders = lazyRenderEnabled
    ? orders.slice(0, visibleCount)
    : orders;

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No orders to display.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Appointment Type</TableHead>
              <TableHead>Scheduled Time</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayOrders.map((order) => {
              const isCompleted = order.status === "completed";
              const isAssigned = Boolean(order.technicianId);
              const disableAssign = isCompleted || isAssigned;

              return (
              <TableRow
                key={order.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
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
                  {serviceModeLabelMap[order.serviceMode] ?? order.serviceMode}
                </TableCell>
                <TableCell>
                  {getTimeSlotLabel(order.serviceMode, order.timeSlot)}
                </TableCell>
                <TableCell>{formatOrderDate(order.createdAt)}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(Number(order.totalAmount))}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
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
                      size="sm"
                      variant="default"
                      disabled={disableAssign}
                      onClick={() => openAssign(order.id)}
                    >
                      Assign Tech
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden p-4">
        {displayOrders.map((order) => {
          const isCompleted = order.status === "completed";
          const isAssigned = Boolean(order.technicianId);
          const disableAssign = isCompleted || isAssigned;

          return (
          <div
            key={order.id}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <Link
              href={`/admin/orders/${order.id}`}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {order.orderNumber}
                </span>
                <Badge
                  variant={statusVariantMap[order.status] ?? "secondary"}
                  className="capitalize"
                >
                  {order.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {order.user.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatOrderDate(order.createdAt)}
                  </span>
                </div>
                <div className="text-right font-medium text-slate-900 dark:text-slate-100">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(Number(order.totalAmount))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  <span className="block font-medium">Type</span>
                  {serviceModeLabelMap[order.serviceMode] ??
                    order.serviceMode}
                </div>
                <div>
                  <span className="block font-medium">Time</span>
                  {getTimeSlotLabel(order.serviceMode, order.timeSlot)}
                </div>
              </div>
            </Link>

            <div className="mt-2 flex justify-end gap-2 border-t pt-3 dark:border-slate-800">
              <Button
                size="sm"
                variant="default"
                className="w-full"
                disabled={disableAssign}
                onClick={(e) => {
                  e.stopPropagation();
                  openAssign(order.id);
                }}
              >
                Assign Technician
              </Button>
            </div>
          </div>
          );
        })}
      </div>

      {canLoadMore && (
        <div
          ref={sentinelRef}
          className="h-8 w-full"
          aria-hidden="true"
        />
      )}

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
              Technician assignment is required. An OTP will be generated for job completion.
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
  lazyRender?: {
    initialCount?: number;
    pageSize?: number;
  };
}
