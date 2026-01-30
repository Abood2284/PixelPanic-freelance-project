// apps/pixel-panic-web/app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";
import "./globals.css";
import { CartProvider } from "@/context/CartProvider";
import { Toaster } from "@/components/ui/sonner";
import { spaceGrotesk, inter } from "@/public/fonts/fonts";
import { AuthModal } from "@/components/shared/AuthModal";
import GSAPProvider from "@/components/gsap/GSAPProvider";
import { DevIndicator } from "@/components/dev/dev-indicator";
import TargetCursor from "@/components/TargetCursor";
import { AnalyticsRouteListener } from "@/components/analytics/route-listener";

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
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PKQJ7JPD');",
          }}
        />
        {/* End Google Tag Manager */}
        {/* Google Ads Global site tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17515114413"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || []
            function gtag(){dataLayer.push(arguments)}
            gtag('js', new Date())
            gtag('config', 'AW-17515114413')
          `}
        </Script>
        {/* End Google Ads Global site tag (gtag.js) */}
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
        {/* Contentsquare/Hotjar */}
        <link
          rel="preconnect"
          href="https://t.contentsquare.net"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="//t.contentsquare.net" />
        <Script
          id="hotjar-csq"
          src="https://t.contentsquare.net/uxa/344bdaf489b7a.js"
          strategy="afterInteractive"
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
        <Suspense fallback={null}>
          <AnalyticsRouteListener />
        </Suspense>
        <GSAPProvider>
          <div>
            <AuthModal />
            <CartProvider>
              <TargetCursor />
              {children}
            </CartProvider>
          </div>
        </GSAPProvider>
        <Toaster />
        <DevIndicator />
      </body>
    </html>
  );
}
