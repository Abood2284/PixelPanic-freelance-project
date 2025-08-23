import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { CopyButton } from "@/components/admin/copy-button";
import { apiFetch } from "@/server";
import { requireAdmin } from "@/lib/auth-middleware";

const InviteSchema = z.object({
  phoneNumber: z.string().min(8).max(32),
  name: z.string().min(2).max(256).optional(),
});

export default async function TechnicianInvitationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Use centralized auth middleware - supports both dev and production modes
  const auth = await requireAdmin("/admin/sign-in");

  const listRes = await apiFetch("/admin/technician-invites", {
    cache: "no-store",
  });
  const invites = (await listRes.json()) as InviteRow[];

  async function createInvite(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const raw = {
      phoneNumber: String(formData.get("phoneNumber") || ""),
      name: (formData.get("name") as string) || undefined,
    };
    const parsed = InviteSchema.safeParse(raw);
    if (!parsed.success) return;
    await apiFetch("/admin/technician-invites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    revalidatePath("/admin/technician-invitations");
  }

  async function revokeInvite(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id)) return;
    await apiFetch(`/admin/technician-invites/${id}/revoke`, {
      method: "POST",
    });
    revalidatePath("/admin/technician-invitations");
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Technician Invitations</h1>

      <section className="rounded-md border p-4 space-y-3">
        <h2 className="font-medium">Create invite</h2>
        <form
          action={createInvite}
          className="grid grid-cols-1 md:grid-cols-3 gap-2 md:items-end"
        >
          <div>
            <label className="text-sm font-medium">Phone number</label>
            <Input name="phoneNumber" placeholder="+91 9876543210" required />
          </div>
          <div>
            <label className="text-sm font-medium">Name (optional)</label>
            <Input name="name" placeholder="Full name" />
          </div>
          <div>
            <Button type="submit" className="w-full md:w-auto">
              Create Invite
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-md border p-4 space-y-3">
        <h2 className="font-medium">Active & recent invites</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <p className="text-sm text-muted-foreground">
                    No invites yet.
                  </p>
                </TableCell>
              </TableRow>
            )}
            {invites.map((i) => {
              const status = getInviteStatus(i);
              const link = `${process.env.NEXT_PUBLIC_APP_BASE_URL ?? ""}/technician/invite/${i.token}`;
              return (
                <TableRow key={i.id}>
                  <TableCell>{i.phoneNumber}</TableCell>
                  <TableCell>{i.name ?? "—"}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-neutral-100">
                      {status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(i.expiresAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <CopyButton text={link} />
                    {status === "active" && (
                      <form action={revokeInvite} className="inline">
                        <input type="hidden" name="id" value={i.id} />
                        <Button type="submit" size="sm" variant="secondary">
                          Revoke
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableCaption>
            Invite technicians securely via tokenized links.
          </TableCaption>
        </Table>
      </section>
    </main>
  );
}

function getInviteStatus(i: InviteRow) {
  const now = Date.now();
  if (i.usedAt) return "used";
  if (new Date(i.expiresAt).getTime() < now) return "expired";
  return "active";
}

// Copy button moved to client component at components/admin/copy-button

interface InviteRow {
  id: number;
  phoneNumber: string;
  name: string | null;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}
