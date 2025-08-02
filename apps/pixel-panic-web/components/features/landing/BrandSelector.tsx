// apps/pixel-panic-web/components/features/landing/BrandSelector.tsx
// Best Practice: Store logo URLs in the database alongside brand names, or map brand names to logo URLs in a config file. This allows dynamic logo rendering and easy updates. For now, only brand names are shown.

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Smartphone, ArrowRight } from "lucide-react";

interface Brand {
  id: number;
  name: string;
}

export default function BrandSelector() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const brandsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchBrands() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/brands`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch brands with status: ${res.status}`);
        }

        const responseText = await res.text();
        if (!responseText) {
          throw new Error("Received an empty response from the server.");
        }

        let data: Brand[];
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", responseText);
          throw new Error("Received an invalid response from the server.");
        }

        setBrands(data);
      } catch (err: any) {
        console.error("BrandSelector fetch error:", err.message);
        setError("Could not load brands. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBrandSelect = (brandName: string) => {
    setSelectedBrand(brandName);
    // Simulate navigation delay for premium feel
    setTimeout(() => {
      window.location.href = `/repair/${encodeURIComponent(brandName)}`;
    }, 300);
  };

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-white via-pp-green-bg/20 to-white overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-pp-green-light/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-pp-green-medium/8 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pp-green-dark/5 rounded-full blur-3xl animate-pulse-green" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl lg:text-6xl font-bold text-pp-green-dark mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Choose Your
            <span className="block bg-gradient-to-r from-pp-green-dark via-pp-green-medium to-pp-green-light bg-clip-text text-transparent">
              Premium Device
            </span>
          </motion.h2>

          <motion.p
            className="text-lg lg:text-xl text-pp-green-dark/70 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Select your device brand and experience our premium repair service
            with certified technicians and genuine parts.
          </motion.p>
        </motion.div>

        {/* Premium Search Bar */}
        <motion.div
          className="max-w-md mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pp-green-medium" />
            <input
              type="text"
              placeholder="Search your device brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-pp-green-light/30 rounded-2xl text-pp-green-dark placeholder-pp-green-dark/50 focus:outline-none focus:border-pp-green-medium transition-all duration-300 glass"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 bg-pp-green-medium rounded-full animate-pulse" />
              <div
                className="w-8 h-8 bg-pp-green-light rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-8 h-8 bg-pp-green-dark rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
            <p className="mt-4 text-pp-green-dark/70 font-medium">
              Loading premium brands...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Premium Brand Grid */}
        {!isLoading && !error && (
          <motion.div
            ref={brandsGridRef}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <AnimatePresence>
              {filteredBrands.map((brand, index) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBrandSelect(brand.name)}
                  className="group cursor-pointer"
                >
                  <div className="relative bg-white/90 backdrop-blur-sm border-2 border-pp-green-light/20 rounded-2xl p-6 h-32 flex flex-col items-center justify-center transition-all duration-300 hover:border-pp-green-medium hover:shadow-xl hover:shadow-pp-green-light/20 glass">
                    {/* Premium Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-pp-green-light to-pp-green-medium rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>

                    {/* Brand Name */}
                    <h3 className="text-pp-green-dark font-semibold text-center group-hover:text-pp-green-medium transition-colors duration-300">
                      {brand.name}
                    </h3>

                    {/* Premium Arrow */}
                    <motion.div
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      <ArrowRight className="w-4 h-4 text-pp-green-medium" />
                    </motion.div>

                    {/* Premium Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pp-green-light/0 via-pp-green-light/0 to-pp-green-light/0 group-hover:from-pp-green-light/5 group-hover:via-pp-green-medium/5 group-hover:to-pp-green-dark/5 transition-all duration-300" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* No Results */}
        {!isLoading && !error && filteredBrands.length === 0 && searchTerm && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-pp-green-bg/50 rounded-2xl p-8 max-w-md mx-auto glass">
              <Smartphone className="w-12 h-12 text-pp-green-medium mx-auto mb-4" />
              <p className="text-pp-green-dark font-medium">
                No brands found for "{searchTerm}"
              </p>
              <p className="text-pp-green-dark/70 text-sm mt-2">
                Try searching for a different brand or contact us for custom
                repairs.
              </p>
            </div>
          </motion.div>
        )}

        {/* Premium CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <p className="text-pp-green-dark/70 mb-4">
            Don't see your device? We repair all brands!
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center space-x-2 text-pp-green-medium hover:text-pp-green-dark font-medium transition-colors duration-300"
          >
            <span>Contact us for custom repairs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
