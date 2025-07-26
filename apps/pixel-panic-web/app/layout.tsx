// apps/pixel-panic-web/app/layout.tsx
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { CartProvider } from "@/context/CartProvider";
import { Toaster } from "@/components/ui/sonner";
import {
  harmonSemiBoldCondensedFont,
  nohemi,
  yeagerOne,
} from "@/public/fonts/fonts";

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
      motion-safe:scroll-smooth 
      ${harmonSemiBoldCondensedFont.className}
      ${nohemi.className}
      ${yeagerOne.className}
    `}
    >
      <body className={cn("min-h-screen bg-background antialiased")}>
        <div className="">
          <CartProvider>{children}</CartProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
// <script
//   dangerouslySetInnerHTML={{
//     __html: `
//       if (typeof window !== 'undefined') {
//         window.addEventListener('mousemove', e => {
//           document.documentElement.style.setProperty('--x', e.clientX + 'px');
//           document.documentElement.style.setProperty('--y', e.clientY + 'px');
//         });
//       }
//     `,
//   }}
// />;
