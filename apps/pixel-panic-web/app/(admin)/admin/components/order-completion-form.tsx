"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface OrderCompletionFormProps {
  orderId: number;
}

export function OrderCompletionForm({ orderId }: OrderCompletionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    partPrice: "",
    travelCosts: "",
    miscellaneousCost: "",
    miscellaneousDescription: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const partPrice = parseFloat(formData.partPrice);
      const travelCosts = parseFloat(formData.travelCosts);
      const miscellaneousCost = parseFloat(formData.miscellaneousCost);

      if (
        isNaN(partPrice) ||
        isNaN(travelCosts) ||
        isNaN(miscellaneousCost) ||
        partPrice < 0 ||
        travelCosts < 0 ||
        miscellaneousCost < 0
      ) {
        toast.error("All cost fields must be valid non-negative numbers");
        setLoading(false);
        return;
      }

      if (miscellaneousCost > 0 && !formData.miscellaneousDescription.trim()) {
        toast.error(
          "Miscellaneous description is required when miscellaneous cost is greater than 0",
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/admin/orders/${orderId}/complete-with-costs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partPrice,
            travelCosts,
            miscellaneousCost,
            miscellaneousDescription:
              formData.miscellaneousDescription.trim() || undefined,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          (data as { message: string }).message || "Failed to complete order",
        );
      }

      toast.success("Order marked as complete successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to complete order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Order Complete</CardTitle>
        <CardDescription>
          Enter the costs associated with this order to calculate profit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partPrice">
                Part Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="partPrice"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.partPrice}
                onChange={(e) =>
                  setFormData({ ...formData, partPrice: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="travelCosts">
                Travel Costs <span className="text-red-500">*</span>
              </Label>
              <Input
                id="travelCosts"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.travelCosts}
                onChange={(e) =>
                  setFormData({ ...formData, travelCosts: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="miscellaneousCost">
              Miscellaneous Cost <span className="text-red-500">*</span>
            </Label>
            <Input
              id="miscellaneousCost"
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.miscellaneousCost}
              onChange={(e) =>
                setFormData({ ...formData, miscellaneousCost: e.target.value })
              }
              placeholder="0.00"
            />
          </div>

          {parseFloat(formData.miscellaneousCost) > 0 && (
            <div className="space-y-2">
              <Label htmlFor="miscellaneousDescription">
                Miscellaneous Description{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="miscellaneousDescription"
                required
                value={formData.miscellaneousDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    miscellaneousDescription: e.target.value,
                  })
                }
                placeholder="Describe what the miscellaneous cost is for..."
                rows={3}
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Completing..." : "Mark Order Complete"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
