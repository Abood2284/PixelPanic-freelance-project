"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface Model {
  id: number;
  name: string;
  imageUrl?: string | null;
}

interface Brand {
  id: number;
  name: string;
}

interface ModelGridProps {
  models: Model[];
  brand: Brand;
  searchPlaceholder: string;
}

export function ModelGrid({
  models,
  brand,
  searchPlaceholder,
}: ModelGridProps) {
  const [query, setQuery] = useState("");
  const filtered = query
    ? models.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
    : models;

  return (
    <>
      <div className="mx-auto mt-8 max-w-sm">
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 text-center"
          aria-label="Search models"
        />
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((model) => (
          <Link
            href={`/repair/${encodeURIComponent(brand.name)}/${encodeURIComponent(model.name)}`}
            key={model.id}
            className=""
            aria-label={`Select ${model.name}`}
          >
            <div className="flex h-40 flex-col items-center justify-center p-4 transition-all hover:border-pp-orange hover:shadow-lg hover:-translate-y-1 border rounded-lg bg-white cursor-pointer group">
              <div className="h-20 w-20 flex items-center justify-center text-pp-slate rounded-md mb-2 overflow-hidden">
                {model.imageUrl ? (
                  <img
                    src={model.imageUrl}
                    alt={model.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center text-pp-slate ${model.imageUrl ? "hidden" : ""}`}
                >
                  <span className="text-xs font-medium">
                    {model.name.split(" ")[0]}
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold text-pp-navy text-center group-hover:text-pp-orange transition-colors">
                {model.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <p className="text-center text-muted-foreground mt-4">
          No models found.
        </p>
      )}
    </>
  );
}
