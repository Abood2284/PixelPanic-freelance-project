// apps/pixel-panic-web/app/(admin)/technicians/page.tsx

import { TechniciansTable } from "../components/technicians-table";
import { fakeTechnicians } from "./fake-data";
import { Button } from "@/components/ui/button";

export default async function TechniciansPage() {
  const technicians = fakeTechnicians;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Technician Management
        </h1>
        <Button>Add New Technician</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-neutral-900">
        <TechniciansTable technicians={technicians} />
      </div>
    </div>
  );
}
