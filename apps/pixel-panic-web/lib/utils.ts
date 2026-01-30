import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a PostgreSQL timestamp string as UTC.
 * PostgreSQL returns timestamps without timezone info (e.g., "2026-01-25 10:19:01.264462").
 * This function ensures they are parsed as UTC, not local time.
 */
function parseUTCTimestamp(timestamp: string): Date {
  // If timestamp already has timezone info (Z, +HH:MM, or -HH:MM format), use it directly
  // Check for timezone patterns: Z at end, or +/- followed by digits (timezone offset)
  const hasTimezone =
    timestamp.endsWith("Z") ||
    /[+-]\d{2}:?\d{2}$/.test(timestamp) ||
    /[+-]\d{4}$/.test(timestamp)
  
  if (hasTimezone) {
    return new Date(timestamp)
  }
  
  // Otherwise, append 'Z' to force UTC parsing
  // Handle both formats: "2026-01-25 10:19:01.264462" and "2026-01-25T10:19:01.264462"
  const utcTimestamp = timestamp.includes("T")
    ? `${timestamp}Z`
    : `${timestamp.replace(" ", "T")}Z`
  return new Date(utcTimestamp)
}

/**
 * Formats a timestamp as date only in IST (e.g., "25 Jan 2026").
 * All timestamps are displayed consistently in IST regardless of device timezone.
 */
export function formatOrderDate(timestamp: string): string {
  const date = parseUTCTimestamp(timestamp)
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

/**
 * Formats a timestamp as date and time in IST (e.g., "25 January 2026, 3:49 PM").
 * All timestamps are displayed consistently in IST regardless of device timezone.
 */
export function formatOrderDateTime(timestamp: string): string {
  const date = parseUTCTimestamp(timestamp)
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

/**
 * Formats a timestamp as time only in IST (e.g., "3:49 PM").
 * All timestamps are displayed consistently in IST regardless of device timezone.
 */
export function formatOrderTime(timestamp: string): string {
  const date = parseUTCTimestamp(timestamp)
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}
