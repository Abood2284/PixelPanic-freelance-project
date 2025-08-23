"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/shared/AuthModal";
import { useAuthModal } from "@/hooks/use-auth-modal";

export interface InviteClientProps {
  apiBase: string;
  token: string;
  inviteOk: boolean;
  invitePhone?: string;
  mePhone?: string;
}

export function InviteClient({
  apiBase,
  token,
  inviteOk,
  invitePhone,
  mePhone,
}: InviteClientProps) {
  const { openModal } = useAuthModal();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function accept() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(
        `${apiBase}/api/technicians/invites/${token}/complete`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ phoneNumber: mePhone }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      window.location.href = "/technician";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to accept invite");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <AuthModal />
      {!inviteOk && (
        <p className="text-sm text-destructive">Invalid or expired invite.</p>
      )}
      {inviteOk && (
        <>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Technician Invite</h1>
            <p className="text-sm text-muted-foreground">
              Phone on invite: {invitePhone}
            </p>
          </div>
          {!mePhone && (
            <div className="space-y-2">
              <p className="text-sm">Verify your phone to continue.</p>
              <Button onClick={openModal}>Verify phone</Button>
            </div>
          )}
          {mePhone && mePhone !== invitePhone && (
            <p className="text-sm text-destructive">
              Signed-in phone does not match invite.
            </p>
          )}
          {mePhone && mePhone === invitePhone && (
            <Button disabled={submitting} onClick={accept}>
              {submitting ? "Joining..." : "Accept invite"}
            </Button>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}
