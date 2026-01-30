// apps/pixel-panic-web/app/(admin)/admin/technicians/page.tsx

import { Suspense } from "react";
import { AddTechnicianButton } from "../components/add-technician-button";
import { TechniciansTable } from "../components/technicians-table";
import { TTechnicianSummary } from "@/types/admin";
import { apiFetch } from "@/server";
import { UnauthorizedState } from "../components/unauthorized-state";

export const dynamic = "force-dynamic";

async function getTechnicians(): Promise<TTechnicianSummary[]> {
  const response = await apiFetch(`/api/admin/technicians`, {
    next: { revalidate: 60 },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error("FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch technicians.");
  }

  return response.json();
}

export default async function TechniciansPage() {
  try {
    const technicians = await getTechnicians();

    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Technician Management
          </h1>
          <AddTechnicianButton />
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-neutral-900">
          <Suspense fallback={<p className="p-4">Loading technicians...</p>}>
            <TechniciansTable technicians={technicians} />
          </Suspense>
        </div>
      </div>
    );
  } catch (err: any) {
    const message = String(err?.message || "");
    if (message === "UNAUTHORIZED") return <UnauthorizedState status={401} />;
    if (message === "FORBIDDEN") return <UnauthorizedState status={403} />;
    throw err;
  }
}
