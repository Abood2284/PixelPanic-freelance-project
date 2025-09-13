"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface Brand {
  id: number;
  name: string;
  logoUrl: string | null;
  createdAt: string;
}

interface BrandGridProps {
  brands: Brand[];
  searchPlaceholder: string;
}

// Selective brands to show by default in correct order
const SELECTIVE_BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Google",
  "Oppo",
  "Vivo",
  "Xiaomi",
  "Realme",
  "Poco",
  "iQOO",
  "Honor",
  "Nothing",
];

export function BrandGrid({ brands, searchPlaceholder }: BrandGridProps) {
  const [query, setQuery] = useState("");
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  // Fetch all brands from backend
  useEffect(() => {
    async function fetchAllBrands() {
      try {
        // Use the Next.js proxy instead of direct worker URL
        const apiUrl =
          process.env.NODE_ENV === "development"
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/brands`
            : "/api/brands";

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch brands");
        }

        const data = (await response.json()) as Brand[];
        setAllBrands(data);
      } catch (err) {
        console.error("❌ Error fetching brands:", err);
        // Fallback to props brands if API fails
        console.log("🔄 Using fallback brands:", brands.length);
        setAllBrands(brands);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllBrands();
  }, [brands]);

  // Track viewport to switch behavior on desktop
  useEffect(() => {
    function updateIsDesktop() {
      // Tailwind lg breakpoint (>= 1024px)
      setIsDesktop(window.innerWidth >= 1024);
    }

    updateIsDesktop();
    window.addEventListener("resize", updateIsDesktop);
    return () => window.removeEventListener("resize", updateIsDesktop);
  }, []);

  // Determine which brands to display
  let displayBrands: Brand[];

  if (query.trim()) {
    // When searching, search through ALL brands
    displayBrands = allBrands.filter((b) =>
      b.name.toLowerCase().includes(query.toLowerCase())
    );
  } else {
    if (isDesktop) {
      // On desktop, show ALL brands by default
      displayBrands = allBrands;
    } else {
      // Create a complete list using ONLY our selective brands
      displayBrands = SELECTIVE_BRANDS.map((brandName) => {
        // Try to find the brand in backend data (case-insensitive)
        const backendBrand = allBrands.find(
          (b) => b.name.toLowerCase() === brandName.toLowerCase()
        );

        if (backendBrand) {
          // Use backend brand with logo URL
          return backendBrand;
        } else {
          // Use fallback brand from props
          const fallbackBrand = brands.find((b) => b.name === brandName);
          return (
            fallbackBrand || {
              id: SELECTIVE_BRANDS.indexOf(brandName) + 1,
              name: brandName,
              logoUrl: null,
              createdAt: "",
            }
          );
        }
      });
    }
  }

  return (
    <>
      <div className="mx-auto mt-4 max-w-sm">
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 text-center"
          aria-label="Search brands"
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4">
        {displayBrands.map((brand) => (
          <Link
            href={`/repair/${encodeURIComponent(brand.name)}`}
            key={brand.id}
            className=""
            aria-label={`Select ${brand.name}`}
          >
            <div className="flex h-32 flex-col items-center justify-center transition-all hover:border-pp-orange hover:shadow-lg hover:-translate-y-1 border rounded-lg bg-white cursor-pointer group">
              <div className="h-16 w-16 flex items-center justify-center rounded-md mb-2 overflow-hidden">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-full h-full object-contain rounded-md"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-800 font-bold text-xs text-center">
                    {brand.name}
                  </div>
                )}
              </div>
              {/* <p className="text-xs font-semibold text-center group-hover:text-pp-orange transition-colors">
                {brand.name}
              </p> */}
            </div>
          </Link>
        ))}
      </div>
      {!isLoading && !displayBrands.length && (
        <p className="text-center text-muted-foreground mt-4">
          {query ? `No brands found for "${query}"` : "No brands available"}
        </p>
      )}
    </>
  );
}
