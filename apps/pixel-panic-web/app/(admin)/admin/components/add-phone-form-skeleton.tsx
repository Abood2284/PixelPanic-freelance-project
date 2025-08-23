// components/admin/add-phone-form-skeleton.tsx

export function AddPhoneFormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-slate-20/30" />
          <div className="h-10 w-full rounded-md bg-slate-20/20" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-slate-20/30" />
          <div className="h-10 w-full rounded-md bg-slate-20/20" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-4 w-40 rounded bg-slate-20/30" />
        <div className="h-4 w-3/4 rounded bg-slate-20/20" />
        <div className="mt-4 space-y-2 border rounded-md p-4">
          <div className="h-8 w-full rounded-md bg-slate-20/20" />
          <div className="h-8 w-full rounded-md bg-slate-20/20" />
          <div className="h-8 w-full rounded-md bg-slate-20/20" />
        </div>
      </div>

      <div className="h-12 w-36 rounded-md bg-slate-20/30" />
    </div>
  );
}
