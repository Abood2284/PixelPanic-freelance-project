// apps/pixel-panic-web/app/(admin)/pricing/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { addPhoneModelSchema, updatePhoneModelSchema } from "@repo/validators"; // We only need the main schema

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";

const WORKER_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 1. SIMPLIFICATION: Define form shape with a simple TypeScript interface.
interface FormData {
  brandId?: number;
  modelId?: number; // For selecting a model to edit
  modelName: string;
  imageUrl?: string;
  selectedIssues: {
    issueId: number;
    name: string;
    isEnabled: boolean;
    priceOriginal?: number | string;
    priceAftermarketTier1?: number | string;
  }[];
}
export default function AdminDashboardPage() {
  const [brands, setBrands] = useState<SelectOption[]>([]);
  const [models, setModels] = useState<SelectOption[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // 2. SIMPLIFICATION: Remove the Zod resolver from useForm.
  const form = useForm<FormData>({
    defaultValues: {
      modelName: "",
      selectedIssues: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "selectedIssues",
  });
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const response = await fetch(`${WORKER_API_URL}/api/admin/form-data`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data: AdminFormDataResponse = await response.json();

        setBrands(
          data.brands.map((b) => ({ value: String(b.id), label: b.name }))
        );
        setAllIssues(data.issues);

        // Initialize form with all issues disabled
        replace(
          data.issues.map((issue) => ({
            issueId: issue.id,
            name: issue.name,
            isEnabled: false,
            priceOriginal: "",
            priceAftermarketTier1: "",
          }))
        );
      } catch (error) {
        toast.error("Failed to load initial data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, [replace]);

  const handleBrandChange = useCallback(
    async (brandId: number) => {
      form.reset({
        brandId,
        modelName: "",
        selectedIssues: form
          .getValues("selectedIssues")
          .map((i) => ({ ...i, isEnabled: false })),
      });
      setIsEditMode(false);
      // In a real app, you'd fetch models for the selected brand here.
      // For now, we assume models are not brand-dependent in the UI logic.
    },
    [form]
  );

  const handleModelChange = useCallback(
    async (modelId: number) => {
      if (!modelId) {
        setIsEditMode(false);
        form.reset({ ...form.getValues(), modelName: "" });
        return;
      }

      setIsEditMode(true);
      const toastId = toast.loading("Fetching model details...");

      try {
        const response = await fetch(
          `${WORKER_API_URL}/api/admin/models/${modelId}`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch model details.");

        const modelData: ModelWithIssues = await response.json();

        // Create a lookup map for existing issue prices
        const existingIssuesMap = new Map(
          modelData.modelIssues.map((mi) => [mi.issueId, mi])
        );

        // Populate the form with the fetched data
        form.setValue("modelName", modelData.name);
        const formIssues = allIssues.map((issue) => {
          const existing = existingIssuesMap.get(issue.id);
          return {
            issueId: issue.id,
            name: issue.name,
            isEnabled: !!existing,
            priceOriginal: existing
              ? parseFloat(existing.priceOriginal || "0")
              : undefined,
            priceAftermarketTier1: existing
              ? parseFloat(existing.priceAftermarketTier1 || "0")
              : undefined,
          };
        });
        form.setValue("selectedIssues", formIssues);

        toast.success("Model loaded for editing.", { id: toastId });
      } catch (error) {
        toast.error("Could not load model data.", { id: toastId });
      }
    },
    [form, allIssues]
  );

  async function onSubmit(data: FormData) {
    const toastId = toast.loading("Starting submission...");

    try {
      let imageUrl = data.imageUrl; // Keep existing image URL if not changed

      // Step 1: Handle file upload if a new file is present
      if (fileToUpload) {
        toast.info("Uploading image...", { id: toastId });

        // 1a: Get the one-time upload URL from our worker
        const presignResponse = await fetch(
          `${WORKER_API_URL}/api/admin/generate-upload-url`,
          {
            method: "POST",
            credentials: "include",
          }
        );
        const presignData = (await presignResponse.json()) as {
          uploadURL: string;
        };
        if (!presignResponse.ok) throw new Error("Failed to get upload URL.");

        // 1b: Upload the file directly to Cloudflare's URL
        const formData = new FormData();
        formData.append("file", fileToUpload);
        const uploadResponse = await fetch(presignData.uploadURL, {
          method: "POST",
          body: formData,
        });
        const uploadData = (await uploadResponse.json()) as {
          result: { variants: string[] };
        };
        if (!uploadResponse.ok) throw new Error("Cloudflare upload failed.");

        // This is the public URL for the 'public' variant of your image
        imageUrl = uploadData.result.variants.find((v: string) =>
          v.endsWith("/public")
        );
      }

      // Step 2: Submit the rest of the form data (now with the new image URL)
      toast.info(
        isEditMode ? "Updating model data..." : "Adding new model...",
        { id: toastId }
      );

      const enabledIssues = data.selectedIssues
        .filter((issue) => issue.isEnabled)
        .map(({ name, isEnabled, ...backendIssue }) => backendIssue);

      const submissionPromise = async () => {
        let response: Response;
        let payload: any;
        let url: string;

        if (isEditMode) {
          // UPDATE action
          if (!data.modelId) throw new Error("No model selected for update.");
          payload = { ...data, selectedIssues: enabledIssues };
          const validation = updatePhoneModelSchema.safeParse(payload);
          if (!validation.success)
            throw new Error(validation.error.errors[0].message);

          url = `${WORKER_API_URL}/models/${data.modelId}`;
          response = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(validation.data),
          });
        } else {
          // CREATE action
          payload = {
            brandId: data.brandId,
            modelName: data.modelName,
            imageUrl,
            selectedIssues: enabledIssues,
          };
          const validation = addPhoneModelSchema.safeParse(payload);
          if (!validation.success)
            throw new Error(validation.error.errors[0].message);

          url = `${WORKER_API_URL}/api/admin/add-model`;
          response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(validation.data),
          });
        }

        const responseBody = (await response.json()) as { message: string };
        if (!response.ok)
          throw new Error(responseBody.message || "An unknown error occurred.");
        return responseBody;
      };

      toast.promise(submissionPromise(), {
        loading: isEditMode ? "Updating model..." : "Adding new model...",
        success: (res) => {
          // Reset form state appropriately
          form.reset({
            modelName: "",
            brandId: data.brandId,
            modelId: undefined,
            selectedIssues: allIssues.map((i) => ({
              ...i,
              name: i.name,
              isEnabled: false,
            })),
          });
          setIsEditMode(false);
          return res.message;
        },
        error: (err: Error) => err.message,
      });
    } catch (error) {
      toast.error("Submission failed.", { id: toastId });
      console.error("Submission error:", error);
    }
  }

  // NOTE: A real implementation would fetch models based on the selected brand.
  // For this example, we'll mock a static list.
  // const MOCKED_MODELS = [
  //   { value: "1", label: "iPhone 15 Pro" },
  //   { value: "2", label: "Galaxy S24 Ultra" },
  // ];

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <main className="container mx-auto py-8">
      =
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Phone Model</CardTitle>
          <CardDescription>
            Add a new model and define its repair service prices.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
              {/* Add the FileUpload component here */}
              <FormItem>
                <FormLabel>Model Image</FormLabel>
                <FileUpload
                  onChange={(files) => setFileToUpload(files[0] || null)}
                />
              </FormItem>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          className="max-h-64 overflow-y-auto"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {brands.map((brand) => (
                            <SelectItem key={brand.value} value={brand.value}>
                              {brand.label}
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
                      <FormLabel>Model Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., iPhone 16 Pro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Services & Pricing</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 bg-slate-50/50">
                      <FormField
                        control={form.control}
                        name={`selectedIssues.${index}.isEnabled`}
                        render={({ field: checkboxField }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={checkboxField.value}
                                onCheckedChange={checkboxField.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-base font-normal">
                              {field.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      {form.watch(`selectedIssues.${index}.isEnabled`) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-8">
                          <FormField
                            control={form.control}
                            name={`selectedIssues.${index}.priceOriginal`}
                            render={({ field: inputField }) => (
                              <FormItem>
                                <FormLabel>Original Price</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="99.99"
                                    {...inputField}
                                    onChange={(e) =>
                                      inputField.onChange(
                                        e.target.valueAsNumber
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`selectedIssues.${index}.priceAftermarketTier1`}
                            render={({ field: inputField }) => (
                              <FormItem>
                                <FormLabel>Aftermarket Price</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="69.99"
                                    {...inputField}
                                    onChange={(e) =>
                                      inputField.onChange(
                                        e.target.valueAsNumber
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Adding Model..." : "Add Model"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}

// Interfaces for API data
interface SelectOption {
  value: string;
  label: string;
}
interface Brand {
  id: number;
  name: string;
  createdAt: string;
}
interface Issue {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}
interface AdminFormDataResponse {
  brands: Brand[];
  issues: Issue[];
}
interface ModelIssue {
  id: number;
  modelId: number;
  issueId: number;
  priceOriginal: string | null;
  priceAftermarketTier1: string | null;
}
interface ModelWithIssues {
  id: number;
  name: string;
  brandId: number;
  modelIssues: ModelIssue[];
}
