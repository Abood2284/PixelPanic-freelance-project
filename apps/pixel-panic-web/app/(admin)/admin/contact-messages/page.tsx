// apps/pixel-panic-web/app/(admin)/admin/contact-messages/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BadgeCheck, Clock, MessageCircle } from "lucide-react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  mobile: string;
  message: string;
  status: "pending" | "responded" | "closed";
  createdAt: string;
  updatedAt: string;
}

interface ContactMessagesData {
  messages: ContactMessage[];
  stats: {
    totalMessages: number;
    pendingMessages: number;
    respondedMessages: number;
    responseRate: string;
  };
}

async function getContactMessagesData(): Promise<ContactMessagesData> {
  const response = await fetch("/api/admin/contact-messages", {
    next: { revalidate: 300 },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) throw new Error("Failed to fetch contact messages data.");

  return response.json();
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
    responded: {
      label: "Responded",
      variant: "default" as const,
      icon: BadgeCheck,
    },
    closed: {
      label: "Closed",
      variant: "outline" as const,
      icon: MessageCircle,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

export default function ContactMessagesPage() {
  const [data, setData] = useState<ContactMessagesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getContactMessagesData();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusUpdate = async (messageId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh the data
      const result = await getContactMessagesData();
      setData(result);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <main className="flex-1 py-8 px-4 sm:py-12 lg:py-16">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pp-orange mx-auto mb-4"></div>
              <p className="text-pp-slate">Loading contact messages...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <main className="flex-1 py-8 px-4 sm:py-12 lg:py-16">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 py-8 px-4 sm:py-12 lg:py-16">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-pp-navy mb-2">
              Contact Messages
            </h1>
            <p className="text-pp-slate">
              Manage customer inquiries and support requests
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Messages
                </CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.stats.totalMessages}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {data.stats.pendingMessages}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Responded</CardTitle>
                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {data.stats.respondedMessages}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Response Rate
                </CardTitle>
                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {data.stats.responseRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {data.messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No contact messages yet
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">
                          {message.name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{message.email}</div>
                            <div className="text-sm text-muted-foreground">
                              {message.mobile}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-xs truncate"
                            title={message.message}
                          >
                            {message.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={message.status} />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {message.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleStatusUpdate(message.id, "responded")
                                  }
                                >
                                  Mark Responded
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusUpdate(message.id, "closed")
                                  }
                                >
                                  Close
                                </Button>
                              </>
                            )}
                            {message.status === "responded" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(message.id, "closed")
                                }
                              >
                                Close
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
