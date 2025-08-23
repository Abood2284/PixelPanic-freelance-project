"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoUploader } from "@/components/technician/photo-uploader";

export interface CompleteFormProps {
  apiBase: string;
  gigId: number;
}

export function CompleteForm({ apiBase, gigId }: CompleteFormProps) {
  const [otp, setOtp] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = useMemo(
    () => otp.trim().length > 0 && !isSubmitting,
    [otp, isSubmitting]
  );

  async function onSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase}/api/technicians/gigs/${gigId}/complete`,
        {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            otp: otp.trim(),
            notes: notes.trim() || undefined,
            photos: photoUrls,
          }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to complete gig");
      }
      window.location.href = "/technician";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">OTP</label>
        <Input
          inputMode="numeric"
          placeholder="Enter customer OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          aria-label="Completion OTP"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          aria-label="Technician notes"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Photos (up to 5)</label>
        <PhotoUploader
          apiBase={apiBase}
          maxFiles={5}
          onUploaded={setPhotoUrls}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button disabled={!canSubmit} onClick={onSubmit}>
        {isSubmitting ? "Submitting..." : "Complete Gig"}
      </Button>
    </div>
  );
}
