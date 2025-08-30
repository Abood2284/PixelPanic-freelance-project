// apps/pixel-panic-web/components/modals/AuthModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

export function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();

  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch OTP functionality using Web OTP API
  useEffect(() => {
    if (step === 2) {
      const handleWebOTP = () => {
        // Check if Web OTP API is supported
        if ("OTPCredential" in window) {
          // @ts-ignore - Web OTP API is experimental
          navigator.credentials
            .get({
              // @ts-ignore - Web OTP API is experimental
              otp: { transport: ["sms"] },
            })
            .then((credential: any) => {
              if (credential && credential.code) {
                setOtp(credential.code);
              }
            })
            .catch((error: any) => {
              // Silently fail - this is expected on unsupported browsers
              console.log("Web OTP not available:", error);
            });
        }
      };

      // Try Web OTP API
      handleWebOTP();
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phoneNumber }),
      });
      const rawText = await response.text();
      let data: { message?: string; verificationId?: string } | null = null;
      try {
        data = rawText ? (JSON.parse(rawText) as any) : null;
      } catch {}

      if (!response.ok) {
        const msg =
          (data &&
            (data.message || (data as any).error || (data as any).detail)) ||
          (rawText ? rawText.trim() : "Failed to send OTP");
        throw new Error(msg);
      }

      setVerificationId(data?.verificationId || "");
      setStep(2); // Move to OTP verification step
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otpCode: otp, verificationId }),
        credentials: "include",
      });
      const rawText = await response.text();
      let data: { message?: string } | null = null;
      try {
        data = rawText ? (JSON.parse(rawText) as any) : null;
      } catch {}

      if (!response.ok) {
        const msg =
          (data &&
            (data.message || (data as any).error || (data as any).detail)) ||
          (rawText ? rawText.trim() : "OTP verification failed");
        throw new Error(msg);
      }

      // On successful login, close the modal and route to stored next (if present)
      closeModal();
      const next = (() => {
        try {
          const n = localStorage.getItem("nextAfterLogin");
          if (n) return n;
        } catch {}
        return "/";
      })();
      window.location.assign(next);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing the modal
    closeModal();
    setTimeout(() => {
      setStep(1);
      setPhoneNumber("");
      setOtp("");
      setError(null);
    }, 300); // Delay reset to allow for closing animation
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Login or Sign Up" : "Verify your Phone"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter your phone number to receive a verification code."
              : `We've sent a 6-digit code to +91 ${phoneNumber}.`}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md border bg-slate-100 p-2 text-sm">
                +91
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length < 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Continue
            </Button>
            <Button
              variant="link"
              size="sm"
              className="w-full text-slate-500"
              onClick={() => setStep(1)}
            >
              Use a different number
            </Button>
          </form>
        )}

        {error && <p className="text-sm text-center text-red-600">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
