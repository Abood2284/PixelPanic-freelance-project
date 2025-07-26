import { DM_Sans, Nunito_Sans, Recursive } from "next/font/google";
import localFont from "next/font/local";

// Heading Font: used in the Gold Shine template
export const harmonSemiBoldCondensedFont = localFont({
  src: "./Harmond-SemiBoldCondensed.otf",
  display: "swap",
  variable: "--harmon-semi-bold-condensed-font",
  adjustFontFallback: false,
});

// Nohemi Font Family - Modern sans-serif with complete weight range
export const nohemi = localFont({
  src: [
    { path: "./Nohemi-Thin.woff2", weight: "100", style: "normal" },
    { path: "./Nohemi-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "./Nohemi-Light.woff2", weight: "300", style: "normal" },
    { path: "./Nohemi-Regular.woff2", weight: "400", style: "normal" },
    { path: "./Nohemi-Medium.woff2", weight: "500", style: "normal" },
    { path: "./Nohemi-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./Nohemi-Bold.woff2", weight: "700", style: "normal" },
    { path: "./Nohemi-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./Nohemi-Black.woff2", weight: "900", style: "normal" },
  ],
  display: "swap",
  variable: "--nohemi-font",
  adjustFontFallback: false,
});

//  Could be used for Normal Text in landing page
export const yeagerOne = localFont({
  src: [
    {
      path: "./Yeager-Light.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "./Yeager-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--yeager-one-font",
  adjustFontFallback: false,
});
