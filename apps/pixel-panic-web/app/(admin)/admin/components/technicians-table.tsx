// apps/pixel-panic-web/app/(admin)/admin/components/technicians-table.tsx
"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TTechnicianSummary } from "@/types/admin";
import {
  IconStarFilled,
  IconCheck,
  IconClock,
  IconX,
  IconUser,
} from "@tabler/icons-react";

interface TechniciansTableProps {
  technicians: TTechnicianSummary[];
}

const statusVariantMap: Record<
  TTechnicianSummary["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  on_leave: "secondary",
  inactive: "outline",
};

const statusIconMap: Record<
  TTechnicianSummary["status"],
  React.ReactNode
> = {
  active: <IconCheck className="h-3 w-3" />,
  on_leave: <IconClock className="h-3 w-3" />,
  inactive: <IconX className="h-3 w-3" />,
};

const statusColorMap: Record<
  TTechnicianSummary["status"],
  string
> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  on_leave: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  inactive: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

function formatPhoneNumber(phone: string): string {
  // Format Indian phone numbers: 9876543210 -> +91 98765 43210
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

export function TechniciansTable({ technicians }: TechniciansTableProps) {
  if (!technicians || technicians.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-6 dark:bg-slate-800">
          <IconUser className="h-12 w-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          No Technicians Yet
        </h3>
        <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Get started by adding your first technician to the system. They'll be
          able to receive and manage repair orders.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Technician</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Avg. Time</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicians.map((tech) => (
              <TableRow
                key={tech.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={tech.imageUrl}
                        alt={tech.name}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full border-2 border-slate-200 object-cover dark:border-slate-700"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            tech.name
                          )}&background=6366f1&color=fff&size=128`;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900 dark:text-slate-100">
                        {tech.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {formatPhoneNumber(tech.phoneNumber)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`flex w-fit items-center gap-1.5 capitalize ${statusColorMap[tech.status]}`}
                  >
                    {statusIconMap[tech.status]}
                    {tech.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {tech.avgCompletionTimeMinutes > 0 ? (
                    <span className="text-slate-700 dark:text-slate-300">
                      {tech.avgCompletionTimeMinutes} min
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">
                      N/A
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {tech.rating > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <IconStarFilled className="h-4 w-4 text-amber-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {tech.rating.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">
                      No rating
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/technicians/${tech.id}`}>
                      View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 p-4 md:hidden">
        {technicians.map((tech) => (
          <div
            key={tech.id}
            className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <img
                  src={tech.imageUrl}
                  alt={tech.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border-2 border-slate-200 object-cover dark:border-slate-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      tech.name
                    )}&background=6366f1&color=fff&size=128`;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">
                    {tech.name}
                  </h3>
                  <Badge
                    className={`flex items-center gap-1 capitalize ${statusColorMap[tech.status]}`}
                  >
                    {statusIconMap[tech.status]}
                    <span className="hidden sm:inline">
                      {tech.status.replace("_", " ")}
                    </span>
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatPhoneNumber(tech.phoneNumber)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t pt-3 dark:border-slate-800">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Avg. Time
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {tech.avgCompletionTimeMinutes > 0
                    ? `${tech.avgCompletionTimeMinutes} min`
                    : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Rating
                </div>
                <div className="flex items-center gap-1.5">
                  {tech.rating > 0 ? (
                    <>
                      <IconStarFilled className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {tech.rating.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500">
                      No rating
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/admin/technicians/${tech.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
