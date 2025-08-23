"use client";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";

export function PhotoUploader({
  apiBase,
  maxFiles = 5,
  onUploaded,
}: {
  apiBase: string;
  maxFiles?: number;
  onUploaded?: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!files?.length) return;
      const next = files.slice(0, Math.max(0, maxFiles - urls.length));
      if (!next.length) return;
      setUploading(true);
      setError(null);
      try {
        const newUrls: string[] = [];
        for (const file of next) {
          const form = new FormData();
          form.append("file", file);
          form.append("folder", "pixel-panic/technicians");
          const res = await fetch(`${apiBase}/api/technicians/upload`, {
            method: "POST",
            body: form,
            credentials: "include",
          });
          if (!res.ok) throw new Error(await res.text());
          const data = (await res.json()) as { url: string };
          newUrls.push(data.url);
        }
        const combined = [...urls, ...newUrls].slice(0, maxFiles);
        setUrls(combined);
        onUploaded?.(combined);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to upload");
      } finally {
        setUploading(false);
      }
    },
    [apiBase, maxFiles, onUploaded, urls]
  );

  function removeAt(index: number) {
    const next = urls.filter((_, i) => i !== index);
    setUrls(next);
    onUploaded?.(next);
  }

  return (
    <div className="space-y-2">
      <FileUpload onChange={handleFiles} />
      {!!urls.length && (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((u, i) => (
            <div key={i} className="relative group">
              <img
                src={u}
                alt="Uploaded"
                className="w-full h-24 object-cover rounded"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute top-1 right-1 h-7 px-2"
                onClick={() => removeAt(i)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {uploading && (
        <p className="text-sm text-muted-foreground">Uploading...</p>
      )}
    </div>
  );
}
