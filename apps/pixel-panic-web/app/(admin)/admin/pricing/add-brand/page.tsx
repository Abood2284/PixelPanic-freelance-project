"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";

const WORKER_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Zod schema for brand validation
const addBrandSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters.")
    .max(100, "Brand name cannot exceed 100 characters.")
    .regex(
      /^[a-zA-Z0-9\s\-&.]+$/,
      "Brand name can only contain letters, numbers, spaces, hyphens, ampersands, and periods."
    ),
  logoUrl: z.string().url().optional(),
});

type FormData = z.infer<typeof addBrandSchema>;

// API response types
interface ErrorResponse {
  message: string;
}

interface BrandResponse {
  message: string;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export default function AddBrandPage() {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(addBrandSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
    },
  });

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setFileToUpload(file);

    // Debug: Log file information
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Debug: Check environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    console.log("Environment variables:", {
      cloudName: cloudName ? "Set" : "Missing",
      uploadPreset: uploadPreset ? "Set" : "Missing",
    });

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary configuration is missing");
      return;
    }

    const toastId = toast.loading("Uploading logo to Cloudinary...");

    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataURI = `data:${file.type};base64,${base64}`;

      console.log("Data URI length:", dataURI.length);
      console.log("Data URI preview:", dataURI.substring(0, 100) + "...");

      // Upload to Cloudinary directly
      const formData = new FormData();
      formData.append("file", dataURI);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "pixel-panic-brands");

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log("Upload URL:", uploadUrl);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary error response:", errorText);
        throw new Error(
          `Failed to upload to Cloudinary: ${response.status} ${response.statusText}`
        );
      }

      const result = (await response.json()) as CloudinaryResponse;
      console.log("Cloudinary response:", result);

      const imageUrl = result.secure_url;

      setUploadedImageUrl(imageUrl);
      form.setValue("logoUrl", imageUrl);

      toast.success("Logo uploaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        `Failed to upload logo: ${error instanceof Error ? error.message : "Unknown error"}`,
        { id: toastId }
      );
      setFileToUpload(null);
    }
  };

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    const toastId = toast.loading("Adding brand...");

    try {
      // Use the uploaded image URL if available
      const logoUrl = uploadedImageUrl || data.logoUrl;

      const brandData = {
        name: data.name,
        logoUrl: logoUrl,
      };

      const response = await fetch(`${WORKER_API_URL}/api/admin/add-brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandData),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.message || "Failed to create brand");
      }

      const result = (await response.json()) as BrandResponse;

      // Reset form
      form.reset();
      setUploadedImageUrl("");
      setFileToUpload(null);

      toast.success(result.message || "Brand created successfully!", {
        id: toastId,
      });
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create brand",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Brand</CardTitle>
          <CardDescription>
            Add a new phone brand to the system. Brand names must be unique.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Brand Logo Upload using your FileUpload component */}
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Logo</FormLabel>
                    <FormControl>
                      <FileUpload onChange={handleFileUpload} />
                    </FormControl>
                    {uploadedImageUrl && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                        <img
                          src={uploadedImageUrl}
                          alt="Brand logo"
                          className="w-16 h-16 object-contain rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Logo uploaded successfully
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {uploadedImageUrl}
                          </p>
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Apple, Samsung, Google"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="w-full"
              >
                {isSubmitting ? "Adding Brand..." : "Add Brand"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
