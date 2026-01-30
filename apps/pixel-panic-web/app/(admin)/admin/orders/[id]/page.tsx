// apps/pixel-panic-web/app/(admin)/orders/[id]/page.tsx

import Link from "next/link";
import { Suspense } from "react";
import type { TOrderDetail } from "@/types/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { apiFetch } from "@/server";
import { formatOrderDateTime } from "@/lib/utils";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getOrderDetail(orderId: string): Promise<TOrderDetail> {
  const response = await apiFetch(`/admin/orders/${orderId}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) notFound();
    throw new Error("Failed to fetch order details.");
  }
  return response.json();
}

// Helper for notFound from next/navigation
import { notFound } from "next/navigation";
import { OrderCompletionForm } from "../../components/order-completion-form";

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  const formattedDate = formatOrderDateTime(order.createdAt);

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(order.totalAmount));

  const appointmentType =
    order.serviceMode === "doorstep" ? "Doorstep" : "Carry-in";
  const scheduledTime =
    order.timeSlot && order.timeSlot.trim().length > 0
      ? order.timeSlot
      : order.serviceMode === "doorstep"
        ? "Not selected"
        : "Not applicable";

  const customerEmail =
    [order.address?.email, order.user.email].find(
      (e) => typeof e === "string" && e.trim().length > 0
    ) ?? "No email provided";

  const isCompleted = order.status === "completed";
  const canComplete =
    !isCompleted &&
    order.technicianId &&
    (order.status === "in_progress" || order.status === "confirmed");

  // Calculate costs and profit if completed
  const partPrice = order.partPrice ? Number(order.partPrice) : 0;
  const travelCosts = order.travelCosts ? Number(order.travelCosts) : 0;
  const miscellaneousCost = order.miscellaneousCost
    ? Number(order.miscellaneousCost)
    : 0;
  const totalCosts = partPrice + travelCosts + miscellaneousCost;
  const revenue = Number(order.totalAmount);
  const profit = isCompleted ? revenue - totalCosts : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/orders">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to All Orders
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Details of the services requested for order {order.orderNumber}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile View */}
              <div className="md:hidden flex flex-col gap-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{item.issueName}</div>
                        <div className="text-sm text-slate-500">
                          for {item.modelName}
                        </div>
                      </div>
                      <div className="font-medium">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(Number(item.priceAtTimeOfOrder))}
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline" className="capitalize">
                        {item.grade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Part Grade</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div>{item.issueName}</div>
                          <div className="text-sm text-slate-500">
                            for {item.modelName}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{item.grade}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(Number(item.priceAtTimeOfOrder))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Completion Form or Cost Display */}
          {canComplete && (
            <OrderCompletionForm orderId={order.id} />
          )}

          {isCompleted && (
            <Card>
              <CardHeader>
                <CardTitle>Cost & Profit Summary</CardTitle>
                <CardDescription>
                  Breakdown of costs and profit for this completed order.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-sm text-slate-500">Part Price</div>
                    <div className="text-lg font-semibold">
                      ₹{partPrice.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-500">Travel Costs</div>
                    <div className="text-lg font-semibold">
                      ₹{travelCosts.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
                {miscellaneousCost > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm text-slate-500">
                      Miscellaneous Cost
                    </div>
                    <div className="text-lg font-semibold">
                      ₹{miscellaneousCost.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    {order.miscellaneousDescription && (
                      <div className="text-sm text-slate-500 italic">
                        {order.miscellaneousDescription}
                      </div>
                    )}
                  </div>
                )}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Total Costs</span>
                    <span className="font-semibold">
                      ₹{totalCosts.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Revenue</span>
                    <span className="font-semibold">
                      ₹{revenue.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-base font-medium">Profit</span>
                    <span
                      className={`text-lg font-bold ${
                        profit >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      ₹{profit.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                {order.completedByUser && (
                  <div className="text-xs text-slate-500 pt-2 border-t">
                    Completed by: {order.completedByUser.name || "Admin"} on{" "}
                    {order.completedAt
                      ? formatOrderDateTime(order.completedAt)
                      : "Unknown date"}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Customer & Address */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <Badge className="capitalize">
                  {order.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Appointment Type</span>
                <span>{appointmentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Time</span>
                <span>{scheduledTime}</span>
              </div>
              {order.technician && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Technician</span>
                  <span>
                    {order.technician.name || "Unnamed"} (
                    {order.technician.phoneNumber})
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>{formattedTotal}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.user.name}</p>
              <p className="text-slate-500">{order.user.phoneNumber}</p>
              <p className="text-slate-500">{customerEmail}</p>
            </CardContent>
          </Card>

          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle>Service Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{order.address.fullName}</p>
                <p className="text-slate-500">{order.address.flatAndStreet}</p>
                {order.address.landmark && (
                  <p className="text-slate-500">
                    Landmark: {order.address.landmark}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
