import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { InviteClient } from "@/components/technician/InviteClient";

export default async function TechnicianInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("auth_token")?.value;

  const inviteRes = await fetch(`${apiBase}/api/technicians/invites/${token}`, {
    cache: "no-store",
  });
  const ok = inviteRes.ok;
  const data = ok
    ? ((await inviteRes.json()) as {
        ok: true;
        invite: { phoneNumber: string; name?: string };
      })
    : null;

  let me: { user?: { id: string; phoneNumber: string; role: string } } = {};
  if (tokenCookie) {
    const res = await fetch(`${apiBase}/api/auth/me`, {
      headers: { Cookie: `auth_token=${tokenCookie}` },
      cache: "no-store",
    });
    if (res.ok) me = await res.json();
  }

  // Hydrate client for modal usage
  return (
    <main className="p-6 max-w-md mx-auto space-y-4">
      <InviteClient
        apiBase={apiBase}
        token={token}
        inviteOk={ok}
        invitePhone={data?.invite.phoneNumber}
        mePhone={me.user?.phoneNumber}
      />
    </main>
  );
}
