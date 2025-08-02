// apps/pixel-panic-web/app/(admin)/orders/page.tsx

import { Suspense } from "react";
import { OrdersTable } from "../components/orders-table";
import { TOrderSummary } from "@/types/admin";

async function getAllOrders(): Promise<TOrderSummary[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${apiBase}/api/admin/orders`, {
    // Revalidate data every 5 minutes
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
