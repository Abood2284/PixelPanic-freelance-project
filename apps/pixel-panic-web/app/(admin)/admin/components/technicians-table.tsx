// apps/pixel-panic-web/app/(admin)/admin/components/technicians-table.tsx

import Link from "next/link";
import Image from "next/image";
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
import { IconStarFilled } from "@tabler/icons-react";

interface TechniciansTableProps {
  technicians: TTechnicianSummary[];
}

const statusVariantMap: Record<
  TTechnicianSummary["status"],
  "default" | "secondary" | "outline"
> = {
  active: "default",
  on_leave: "secondary",
  inactive: "outline",
};

export function TechniciansTable({ technicians }: TechniciansTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Technician</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Avg. Time</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {technicians.map((tech) => (
          <TableRow key={tech.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <Image
                  src={tech.imageUrl}
                  alt={tech.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div>{tech.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {tech.phoneNumber}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={statusVariantMap[tech.status]}
                className="capitalize"
              >
                {tech.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>{tech.avgCompletionTimeMinutes} min</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <IconStarFilled className="h-4 w-4 text-amber-400" />
                {tech.rating.toFixed(1)}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link href={`/technicians/${tech.id}`}>View Profile</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
