// Best Practice: Store logo URLs in the database alongside brand names, or map brand names to logo URLs in a config file. This allows dynamic logo rendering and easy updates. For now, only brand names are shown.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Brand {
  id: number;
  name: string;
}

export default function BrandSelector() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrands() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/brands`
        );
        if (!res.ok) throw new Error("Failed to fetch brands");
        const data = (await res.json()) as Brand[];
        setBrands(data);
      } catch (err) {
        setError("Could not load brands. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBrands();
  }, []);

  return (
    <section id="brand-selector" className="py-8 bg-white">
      <div className="w-full max-w-md mx-auto px-2">
        <h2 className="text-center text-xl font-bold font-nohemi text-black mb-6">
          Which phone do you need fixed?
        </h2>
        {isLoading ? (
          <div className="text-center text-gray-500">Loading brands...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/repair/${encodeURIComponent(brand.name)}`}
              >
                <div className="group flex items-center gap-3 rounded-xl bg-black hover:bg-neutral-900 active:bg-neutral-800 transition-colors px-4 py-3 min-h-[56px] shadow-sm cursor-pointer">
                  {/* Add logo here when available */}
                  <span className="text-white font-nohemi text-base font-semibold">
                    {brand.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
