"use client";
import { Suspense } from "react"; // <-- 1. Import Suspense
import { IconTools } from "@tabler/icons-react";
import { LoginForm } from "./components/login-form";

export default function AuthenticationPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md bg-orange-500 text-white">
            <IconTools className="size-4" />
          </div>
          PixelPanic Admin
        </a>

        {/* 2. Wrap the client component in a Suspense boundary */}
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
