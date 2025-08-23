// apps/pixel-panic-web/app/(admin)/orders/page.tsx

import { Suspense } from "react";
import { OrdersTable } from "../components/orders-table";
import { TOrderSummary } from "@/types/admin";
import { apiFetch } from "@/server";

async function getAllOrders(): Promise<TOrderSummary[]> {
  const response = await apiFetch("/admin/orders", {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders.");
  }

  return response.json();
}

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
        All Orders
      </h1>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-neutral-900">
        <Suspense fallback={<p className="p-4">Loading orders...</p>}>
          <OrdersTable orders={orders} />
        </Suspense>
      </div>
    </div>
  );
}
