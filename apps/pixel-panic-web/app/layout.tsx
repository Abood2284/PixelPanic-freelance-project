// apps/pixel-panic-web/app/layout.tsx
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { CartProvider } from "@/context/CartProvider";
import { Toaster } from "@/components/ui/sonner";
import { ptSerif, yeagerOne } from "@/public/fonts/fonts";
import { AuthModal } from "@/components/shared/AuthModal";
import { ScrollTrigger } from "gsap/all";
import gsap from "gsap";
import GSAPProvider from "@/components/gsap/GSAPProvider";
import { DevIndicator } from "@/components/dev/dev-indicator";

gsap.registerPlugin(ScrollTrigger);

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
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PKQJ7JPD');",
          }}
        />
        {/* End Google Tag Manager */}
        {/* Preconnect to your asset CDN/bucket for the fastest handshake (DNS + TLS) */}
        <link
          rel="preconnect"
          href="https://pub-e75db92e1a5e4c81aa5e94b6ad9d0a98.r2.dev"
        />
        {/* Preload 3D GLB model as fetch (for useGLTF, XHR, etc.) */}
        <link
          rel="preload"
          as="fetch"
          href="https://pub-e75db92e1a5e4c81aa5e94b6ad9d0a98.r2.dev/models/iphone-16-final.glb"
          crossOrigin="anonymous"
        />
        {/* Preload poster image for optimal LCP */}
        <link
          rel="preload"
          as="image"
          href="https://pub-e75db92e1a5e4c81aa5e94b6ad9d0a98.r2.dev/models/iphone-16-final.webp"
          imageSrcSet="https://pub-e75db92e1a5e4c81aa5e94b6ad9d0a98.r2.dev/models/iphone-16-final.webp 1x"
          type="image/webp"
        />
        {/* Preload video (if it's above the fold/needed instantly). 
          Omit or defer this if it's not needed for LCP or early content!
        */}
        <link
          rel="preload"
          as="video"
          href="https://pub-e75db92e1a5e4c81aa5e94b6ad9d0a98.r2.dev/models/pixel-panic.mp4"
          type="video/mp4"
          crossOrigin="anonymous"
        />
      </head>
      <body className={cn("min-h-screen bg-background antialiased")}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PKQJ7JPD"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
