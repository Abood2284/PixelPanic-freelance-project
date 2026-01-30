"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DateFilterDropdown,
  type DateFilterDuration,
} from "./date-filter-dropdown";

export function DashboardDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duration = (searchParams.get("duration") as DateFilterDuration) || "today";
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const tzOffsetMinutes = String(new Date().getTimezoneOffset());
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    if (params.get("tzOffsetMinutes")) return;
    params.set("tzOffsetMinutes", tzOffsetMinutes);
    if (duration === "custom") {
      const today = new Date().toISOString().split("T")[0];
      params.set("startDate", startDate ?? today);
      params.set("endDate", endDate ?? today);
    }
    router.replace(`?${params.toString()}`);
  }, [duration, endDate, router, searchParamsString, startDate, tzOffsetMinutes]);

  const handleDurationChange = (newDuration: DateFilterDuration) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("duration", newDuration);
    params.set("tzOffsetMinutes", tzOffsetMinutes);
    if (newDuration === "custom") {
      const today = new Date().toISOString().split("T")[0];
      params.set("startDate", startDate ?? today);
      params.set("endDate", endDate ?? today);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }
    router.push(`?${params.toString()}`);
  };

  const handleCustomDateChange = (newStartDate: string, newEndDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("duration", "custom");
    params.set("startDate", newStartDate);
    params.set("endDate", newEndDate);
    params.set("tzOffsetMinutes", tzOffsetMinutes);
    router.push(`?${params.toString()}`);
  };

  return (
    <DateFilterDropdown
      duration={duration}
      startDate={startDate}
      endDate={endDate}
      onDurationChange={handleDurationChange}
      onCustomDateChange={handleCustomDateChange}
    />
  );
}
