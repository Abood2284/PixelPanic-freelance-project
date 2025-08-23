export default function AdminForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="text-sm text-muted-foreground">
        You are signed in but do not have admin permissions for this area.
      </p>
      <a href="/" className="text-sm underline">
        Go to homepage
      </a>
    </main>
  );
}
