import { Header } from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import { Suspense } from "react";
import { ModelGrid } from "@/components/features/repair/ModelGrid";

interface Model {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface ModelSelectPageProps {
  params: Promise<{
    brand: string;
  }>;
}

async function fetchModelsAndBrand(
  brand: string
): Promise<{ brand: Brand; models: Model[] }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/models?brand=${encodeURIComponent(brand)}`,
    {
      // SSR, no cache for always-fresh data. Use ISR if you want caching.
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

export default async function ModelSelectPage({
  params,
}: ModelSelectPageProps) {
  const { brand } = await params;
  const { brand: brandObj, models } = await fetchModelsAndBrand(brand);

  const wizardCopy = {
    header: `Select your ${brandObj.name} model`,
    helperText: "Don't see your model?",
    helperLinkText: "Contact us",
    searchPlaceholder: `Search ${brandObj.name} model...`,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-slate-50">
        <div className="container py-12 lg:py-16 text-center px-4">
          <div className="text-sm text-pp-slate mb-4">
            <Link href="/" className="hover:text-pp-orange">
              Home
            </Link>
            <span className="mx-2">&gt;</span>
            <span>{brandObj.name}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-pp-navy">
            {wizardCopy.header}
          </h1>
          <Suspense fallback={<div>Loading models...</div>}>
            <ModelGrid
              models={models}
              brand={brandObj}
              searchPlaceholder={wizardCopy.searchPlaceholder}
            />
          </Suspense>
          <p className="mt-8 text-sm text-pp-slate">
            {wizardCopy.helperText}{" "}
            <Link
              href="/contact"
              className="font-semibold text-pp-orange underline"
            >
              {wizardCopy.helperLinkText}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Cloudflare Image Optimization Best Practice:
// For MVP, store images in /public/images/. For production, use Cloudflare Images or R2 for originals and let Cloudflare handle resizing, WebP conversion, and CDN delivery. Store only the original asset; let Cloudflare optimize for each device.
