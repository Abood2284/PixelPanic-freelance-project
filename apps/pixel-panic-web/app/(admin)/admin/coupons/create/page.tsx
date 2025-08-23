// apps/pixel-panic-web/app/(admin)/admin/coupons/create/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { IconArrowLeft, IconGavel } from "@tabler/icons-react";
import Link from "next/link";
import { TCouponCreateInput, TCouponType, TServiceMode } from "@/types/admin";

export default function CreateCouponPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TCouponCreateInput>({
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: 0,
    minimumOrderAmount: 0,
    maximumDiscount: undefined,
    totalUsageLimit: undefined,
    perUserUsageLimit: 1,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    applicableServiceModes: undefined,
    applicableBrandIds: undefined,
    applicableModelIds: undefined,
  });

  const [selectedServiceModes, setSelectedServiceModes] = useState<
    TServiceMode[]
  >([]);

  const handleInputChange = (field: keyof TCouponCreateInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServiceModeToggle = (mode: TServiceMode) => {
    setSelectedServiceModes((prev) => {
      const newModes = prev.includes(mode)
        ? prev.filter((m) => m !== mode)
        : [...prev, mode];

      setFormData((prevData) => ({
        ...prevData,
        applicableServiceModes: newModes.length > 0 ? newModes : undefined,
      }));

      return newModes;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create coupon");
      }

      router.push("/admin/coupons");
    } catch (error) {
      console.error("Error creating coupon:", error);
      // TODO: Add proper error handling/toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/coupons">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Coupons
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Create New Coupon
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    handleInputChange("code", e.target.value.toUpperCase())
                  }
                  placeholder="e.g., WELCOME10"
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Use uppercase letters and numbers only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Coupon Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Welcome Discount"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Optional description for internal use"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Discount Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Discount Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: TCouponType) =>
                    handleInputChange("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      Percentage Discount
                    </SelectItem>
                    <SelectItem value="fixed_amount">
                      Fixed Amount Discount
                    </SelectItem>
                    <SelectItem value="service_upgrade">
                      Service Upgrade
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  {formData.type === "percentage" && "Discount Percentage *"}
                  {formData.type === "fixed_amount" && "Discount Amount (₹) *"}
                  {formData.type === "service_upgrade" && "Upgrade Type *"}
                </Label>
                {formData.type === "service_upgrade" ? (
                  <Select
                    value={formData.value.toString()}
                    onValueChange={(value) =>
                      handleInputChange("value", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Carry-in to Doorstep</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      handleInputChange(
                        "value",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder={formData.type === "percentage" ? "10" : "500"}
                    min="0"
                    max={formData.type === "percentage" ? "100" : undefined}
                    required
                  />
                )}
              </div>

              {formData.type === "percentage" && (
                <div className="space-y-2">
                  <Label htmlFor="maximumDiscount">Maximum Discount (₹)</Label>
                  <Input
                    id="maximumDiscount"
                    type="number"
                    value={formData.maximumDiscount || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "maximumDiscount",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="e.g., 1000"
                    min="0"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Optional cap on the discount amount
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="minimumOrderAmount">
                  Minimum Order Amount (₹)
                </Label>
                <Input
                  id="minimumOrderAmount"
                  type="number"
                  value={formData.minimumOrderAmount}
                  onChange={(e) =>
                    handleInputChange(
                      "minimumOrderAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalUsageLimit">Total Usage Limit</Label>
                <Input
                  id="totalUsageLimit"
                  type="number"
                  value={formData.totalUsageLimit || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "totalUsageLimit",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Leave empty for unlimited usage
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="perUserUsageLimit">
                  Per User Usage Limit *
                </Label>
                <Input
                  id="perUserUsageLimit"
                  type="number"
                  value={formData.perUserUsageLimit}
                  onChange={(e) =>
                    handleInputChange(
                      "perUserUsageLimit",
                      parseInt(e.target.value) || 1
                    )
                  }
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    handleInputChange("validFrom", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until *</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    handleInputChange("validUntil", e.target.value)
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Restrictions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Restrictions (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Applicable Service Modes</Label>
                <div className="flex gap-4">
                  {(["doorstep", "carry_in"] as TServiceMode[]).map((mode) => (
                    <div key={mode} className="flex items-center space-x-2">
                      <Checkbox
                        id={mode}
                        checked={selectedServiceModes.includes(mode)}
                        onCheckedChange={() => handleServiceModeToggle(mode)}
                      />
                      <Label htmlFor={mode} className="capitalize">
                        {mode.replace("_", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Leave unchecked to apply to all service modes
                </p>
              </div>

              <div className="space-y-3">
                <Label>Brand & Model Restrictions</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Brand and model-specific restrictions will be implemented in
                  the next phase.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" asChild>
            <Link href="/admin/coupons">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            <IconGavel className="mr-2 h-4 w-4" />
            {isLoading ? "Creating..." : "Create Coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
}
