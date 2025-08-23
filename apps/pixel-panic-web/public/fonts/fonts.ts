import { PT_Serif } from "next/font/google";
import localFont from "next/font/local";

// PT Serif Font from Google Fonts - Elegant serif font
export const ptSerif = PT_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--pt-serif-font",
  weight: ["400", "700"],
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
