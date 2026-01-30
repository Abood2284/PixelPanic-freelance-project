"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddTechnicianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTechnicianDialog({
  open,
  onOpenChange,
}: AddTechnicianDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.phoneNumber.trim()) {
        toast.error("Phone number is required");
        setLoading(false);
        return;
      }

      // Basic phone number validation (10 digits)
      const phoneRegex = /^[0-9]{10}$/;
      const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        toast.error("Phone number must be 10 digits");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/technicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          name: formData.name.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          (data as { message: string }).message || "Failed to create technician"
        );
      }

      toast.success("Technician added successfully");
      setFormData({ phoneNumber: "", name: "" });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create technician");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Technician</DialogTitle>
          <DialogDescription>
            Create a new technician account. The phone number will be used for
            login.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="9876543210"
              maxLength={10}
            />
            <p className="text-xs text-slate-500">
              10-digit phone number (no spaces or dashes)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="John Doe"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Technician"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
