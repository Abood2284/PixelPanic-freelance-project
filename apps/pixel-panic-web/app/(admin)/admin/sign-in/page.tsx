import { Suspense } from "react";
import { AdminSignInClient } from "./AdminSignInClient";

export default function AdminSignInPage() {
  return (
    <Suspense fallback={<AdminSignInFallback />}>
      <AdminSignInClient />
    </Suspense>
  );
}

function AdminSignInFallback() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Admin sign-in required</h1>
      <p className="text-sm text-muted-foreground">
        Your session has expired or you don't have access. Please sign in to
        continue.
      </p>
      <div className="flex gap-2">
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </main>
  );
}
