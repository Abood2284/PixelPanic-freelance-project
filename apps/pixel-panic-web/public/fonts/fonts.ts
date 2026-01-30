import {
  Inter,
  Space_Grotesk,
  Montserrat,
  Merriweather,
  Abril_Fatface,
} from "next/font/google";

// Admin headings use Space Grotesk
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

// Admin body copy uses Inter
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

// Display / Headings: Montserrat (700/600)
export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["600", "700"],
});

// Body / UI: Merriweather (400/500)
export const merriweather = Merriweather({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-merriweather",
  weight: ["400", "700"],
});

// Display / Headings: Abril Fatface (regular)
export const abrilFatface = Abril_Fatface({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-abril-fatface",
  weight: "400",
});
