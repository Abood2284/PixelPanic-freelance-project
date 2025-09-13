"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

import Footer from "@/components/shared/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone, Calendar, Package } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: number;
  issueName: string;
  modelName: string;
  grade: string;
  priceAtTimeOfOrder: string;
}

interface OrderAddress {
  fullName: string;
  phoneNumber: string;
  email: string;
  flatAndStreet: string;
  landmark: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  serviceMode: string;
  timeSlot?: string;
  createdAt: string;
  orderItems: OrderItem[];
  address: OrderAddress;
}

// Helper function to get status badge variant
function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "confirmed":
      return "default";
    case "in_progress":
      return "secondary";
    case "completed":
      return "success-light";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

// Helper function to format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function OrderHistoryPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchOrders = async () => {
    try {
      // Use the Next.js proxy instead of direct worker URL to ensure cookies are sent
      const apiUrl =
        process.env.NODE_ENV === "development"
          ? `${API_BASE_URL}/api/orders`
          : "/api/orders";

      console.log("Fetching orders from:", apiUrl);
      const response = await fetch(apiUrl, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Orders API response status:", response.status);
      console.log(
        "Orders API response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const data = (await response.json()) as { orders: Order[] };
        console.log("Orders data received:", data);
        setOrders(data.orders || []);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch orders:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <main className="flex-1 py-8 px-4 sm:py-12 lg:py-16">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pp-orange mx-auto mb-4"></div>
              <p className="text-pp-slate">Loading your orders...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 py-8 px-4 sm:py-12 lg:py-16">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-pp-navy mb-2">
              Order History
            </h1>
            <p className="text-gray-600">
              Track all your repair orders and their current status
            </p>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet. Start by booking your first
                repair!
              </p>
              <Button asChild>
                <Link href="/">Book Your First Repair</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order: Order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          Order {order.orderNumber}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="capitalize">
                              {order.serviceMode}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Repair Items
                      </h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item: OrderItem) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2 border-b last:border-b-0"
                          >
                            <div>
                              <p className="font-medium">{item.issueName}</p>
                              <p className="text-sm text-gray-600">
                                {item.modelName} • {item.grade}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ₹{Number(item.priceAtTimeOfOrder).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Service Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-pp-orange" />
                          <span className="text-gray-600">Service Mode:</span>
                          <span className="font-medium capitalize">
                            {order.serviceMode}
                          </span>
                        </div>
                        {order.timeSlot && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-pp-orange" />
                            <span className="text-gray-600">Time Slot:</span>
                            <span className="font-medium">
                              {order.timeSlot}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-pp-orange" />
                          <span className="text-gray-600">Contact:</span>
                          <span className="font-medium">
                            {order.address.fullName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-lg font-bold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-pp-navy">
                        ₹{Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" size="sm" className="flex-1">
                        Track Order
                      </Button>
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
