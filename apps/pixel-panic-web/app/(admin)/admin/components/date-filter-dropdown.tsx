"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IconCalendar } from "@tabler/icons-react";

export type DateFilterDuration = "today" | "yesterday" | "custom";

interface DateFilterDropdownProps {
  duration: DateFilterDuration;
  startDate?: string;
  endDate?: string;
  onDurationChange: (duration: DateFilterDuration) => void;
  onCustomDateChange: (startDate: string, endDate: string) => void;
}

export function DateFilterDropdown({
  duration,
  startDate,
  endDate,
  onDurationChange,
  onCustomDateChange,
}: DateFilterDropdownProps) {
  const [localStartDate, setLocalStartDate] = useState(
    startDate || new Date().toISOString().split("T")[0]
  );
  const [localEndDate, setLocalEndDate] = useState(
    endDate || new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (startDate) setLocalStartDate(startDate);
  }, [startDate]);

  useEffect(() => {
    if (endDate) setLocalEndDate(endDate);
  }, [endDate]);

  const dateError = useMemo(() => {
    if (!localStartDate || !localEndDate) return "Select both dates.";
    const start = new Date(localStartDate);
    const end = new Date(localEndDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Enter a valid date.";
    }
    if (end < start) return "End date must be on or after start date.";
    return "";
  }, [localStartDate, localEndDate]);

  const handleApplyCustomDates = () => {
    if (!dateError) {
      onCustomDateChange(localStartDate, localEndDate);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex items-center gap-2">
        <IconCalendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <Label htmlFor="duration-select" className="text-sm font-medium">
          Period:
        </Label>
        <Select value={duration} onValueChange={onDurationChange}>
          <SelectTrigger id="duration-select" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {duration === "custom" && (
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1">
            <Label htmlFor="start-date" className="text-xs text-slate-500">
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="end-date" className="text-xs text-slate-500">
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
          <Button
            onClick={handleApplyCustomDates}
            size="sm"
            className="w-full sm:w-auto"
            disabled={Boolean(dateError)}
          >
            Apply
          </Button>
          {dateError ? (
            <div className="text-xs text-rose-600">{dateError}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
