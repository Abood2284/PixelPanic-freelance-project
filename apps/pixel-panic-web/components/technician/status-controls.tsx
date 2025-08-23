"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function StatusControls({
  apiBase,
  gigId,
  status,
}: {
  apiBase: string;
  gigId: number;
  status:
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "pending_payment";
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startGig() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase}/api/technicians/gigs/${gigId}/status`,
        {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ to: "in_progress" }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "completed") return null;
  if (status === "cancelled") return null;

  return (
    <div className="space-y-2">
      {status === "confirmed" && (
        <Button onClick={startGig} disabled={isLoading}>
          {isLoading ? "Starting..." : "Start (In Progress)"}
        </Button>
      )}
      {status === "in_progress" && (
        <p className="text-sm text-muted-foreground">
          When done, enter OTP below and complete the gig.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
