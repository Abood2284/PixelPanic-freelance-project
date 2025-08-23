// apps/pixel-panic-web/app/layout.tsx
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { CartProvider } from "@/context/CartProvider";
import { Toaster } from "@/components/ui/sonner";
import { ptSerif, yeagerOne } from "@/public/fonts/fonts";
import { AuthModal } from "@/components/shared/AuthModal";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";
import gsap from "gsap";
import GSAPProvider from "@/components/gsap/GSAPProvider";
import { DevIndicator } from "@/components/dev/dev-indicator";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export const metadata: Metadata = {   
  title: "Mobile Repair in Mumbai – PixelPanic Doorstep & Store",
  description:
    "Same-day phone repair across Mumbai. Select brand-model-issue, book in 30 sec, 6-month warranty.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`
      ${yeagerOne.className}
      ${ptSerif.className}
    `}
    >
      <body className={cn("min-h-screen bg-background antialiased")}>
        <GSAPProvider>
          <div>
            <AuthModal />
            <CartProvider>{children}</CartProvider>
          </div>
        </GSAPProvider>
        <Toaster />
        <DevIndicator />
      </body>
    </html>
  );
}
