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

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(order.totalAmount));

  const customerEmail =
    [order.address?.email, order.user.email].find(
      (e) => typeof e === "string" && e.trim().length > 0
    ) ?? "No email provided";

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
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Details of the services requested for order {order.orderNumber}.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
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
