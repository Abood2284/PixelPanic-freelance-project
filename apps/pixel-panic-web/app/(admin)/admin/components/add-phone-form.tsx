// components/admin/add-phone-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { addPhoneModelSchema } from "@repo/validators";
import type { brands, issues } from "@repo/db/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// 1. A simpler Zod schema for the basic form fields
const baseFormSchema = z.object({
  brandId: z.number({ message: "Please select a brand." }),
  modelName: z.string().min(2, "Model name is too short.").max(100),
});
type BaseFormValues = z.infer<typeof baseFormSchema>;

// State to hold price data: { issueId: { priceOriginal: '100', ... } }
type PriceState = Record<
  number,
  { priceOriginal?: string; priceAftermarketTier1?: string }
>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function AddPhoneForm({
  allBrands,
  allIssues,
}: {
  allBrands: (typeof brands.$inferSelect)[];
  allIssues: (typeof issues.$inferSelect)[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [prices, setPrices] = useState<PriceState>({});

  const form = useForm<BaseFormValues>({
    resolver: zodResolver(baseFormSchema),
    defaultValues: {
      modelName: "",
    },
  });

  // 2. Simplified state management for checkboxes and prices
  function handleIssueToggle(issueId: number, checked: boolean) {
    const newPrices = { ...prices };
    if (checked) {
      newPrices[issueId] = { priceOriginal: "", priceAftermarketTier1: "" };
    } else {
      delete newPrices[issueId];
    }
    setPrices(newPrices);
  }

  function handlePriceChange(
    issueId: number,
    priceType: "priceOriginal" | "priceAftermarketTier1",
    value: string
  ) {
    setPrices((prev) => ({
      ...prev,
      [issueId]: {
        ...prev[issueId],
        [priceType]: value,
      },
    }));
  }

  // 3. Manually build and validate the final payload on submit

  async function onSubmit(data: BaseFormValues) {
    setIsLoading(true);

    // Construct the final payload to match the full Zod schema
    const finalPayload = {
      ...data,
      selectedIssues: Object.entries(prices).map(([issueId, priceData]) => ({
        issueId: Number(issueId),
        priceOriginal: priceData.priceOriginal,
        priceAftermarketTier1: priceData.priceAftermarketTier1,
      })),
    };

    // Validate the complete object before sending
    const validation = addPhoneModelSchema.safeParse(finalPayload);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      // Display the first validation error to the user
      const firstError = Object.values(formattedErrors)[0]?.[0];
      toast.error(firstError || "Please check your input.");
      setIsLoading(false);
      return;
    }

    try {
      // Use the Next.js proxy instead of direct worker URL
      const apiUrl =
        process.env.NODE_ENV === "development"
          ? `${API_BASE_URL}/api/admin/add-model`
          : "/api/admin/add-model";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(validation.data), // Send validated data
      });
      const result = (await response.json()) as { message: string };
      if (!response.ok) throw new Error(result.message || "An error occurred.");

      toast.success(result.message || "Model added successfully!");
      form.reset();
      setPrices({});
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add model."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* --- Brand and Model Name Fields (Managed by react-hook-form) --- */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Brand</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allBrands.map((brand) => (
                      <SelectItem key={brand.id} value={String(brand.id)}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="modelName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Model Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Galaxy S25 Ultra"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- Issues and Prices (Managed by React State) --- */}
        <div>
          <FormLabel>Available Repair Issues</FormLabel>
          <FormDescription className="mb-4">
            Select issues and provide prices.
          </FormDescription>
          <div className="max-h-96 space-y-4 overflow-y-auto rounded-md border p-4">
            {allIssues.map((issue) => (
              <div key={issue.id}>
                <div className="mb-2 flex items-center space-x-3">
                  <Checkbox
                    id={`issue-${issue.id}`}
                    onCheckedChange={(checked) =>
                      handleIssueToggle(issue.id, !!checked)
                    }
                    checked={!!prices[issue.id]}
                    disabled={isLoading}
                  />
                  <label htmlFor={`issue-${issue.id}`} className="font-medium">
                    {issue.name}
                  </label>
                </div>
                {prices[issue.id] && (
                  <div className="grid grid-cols-1 gap-4 pt-2 pl-7 md:grid-cols-2">
                    <FormItem>
                      <FormLabel className="text-xs">OEM Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 8990"
                          value={prices[issue.id]?.priceOriginal || ""}
                          onChange={(e) =>
                            handlePriceChange(
                              issue.id,
                              "priceOriginal",
                              e.target.value
                            )
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel className="text-xs">
                        Aftermarket Price (₹)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 5990"
                          value={prices[issue.id]?.priceAftermarketTier1 || ""}
                          onChange={(e) =>
                            handlePriceChange(
                              issue.id,
                              "priceAftermarketTier1",
                              e.target.value
                            )
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-pixel-orange hover:bg-pixel-orange/90"
        >
          {isLoading ? "Saving..." : "Add Phone Model"}
        </Button>
      </form>
    </Form>
  );
}
