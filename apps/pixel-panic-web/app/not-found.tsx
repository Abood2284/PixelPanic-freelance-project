import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p>Could not find the requested page.</p>
      <Link href="/" className="underline">
        Return Home
      </Link>
    </main>
  );
}
