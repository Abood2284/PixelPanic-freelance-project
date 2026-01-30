import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.8:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-e75db92e1a5e4c81aa5e94b6ad9d0a98.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Optimize for Cloudflare Workers
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "react-icons",
      "framer-motion",
      "@radix-ui/react-accordion",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-select",
      "@radix-ui/react-slot",
      "@radix-ui/react-tooltip",
    ],
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  // Optimize output
  output: "standalone",
  /* config options here */
  async rewrites() {
    const rules = [] as { source: string; destination: string }[];
    if (process.env.NODE_ENV === "development") {
      rules.push({
        source: "/api/:path*",
        destination: "http://localhost:8787/api/:path*",
      });
    }
    // Proxy API in production as well, to keep cookies first-party
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      rules.push({
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
      });
    }
    return rules;
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
