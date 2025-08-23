"use client";

import { Badge } from "@/components/ui/badge";

export function DevIndicator() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge
        variant="secondary"
        className="bg-yellow-100 text-yellow-800 border-yellow-200"
      >
        🧪 Dev Mode
      </Badge>
    </div>
  );
}
