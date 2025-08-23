"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    const isAbsolute = /^https?:\/\//i.test(text);
    const toCopy = isAbsolute
      ? text
      : `${window.location.origin}${text.startsWith("/") ? "" : "/"}${text}`;
    await navigator.clipboard.writeText(toCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <Button type="button" size="sm" onClick={onCopy}>
      {copied ? "Copied" : "Copy Link"}
    </Button>
  );
}
