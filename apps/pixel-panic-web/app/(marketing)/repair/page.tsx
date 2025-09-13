"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/shared/Footer";

interface Brand {
  id: number;
  name: string;
  logoUrl: string | null;
  createdAt: string;
}

function BrandsAllGrid() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        // Use the Next.js proxy instead of direct worker URL
        const apiUrl =
          process.env.NODE_ENV === "development"
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/brands`
            : "/api/brands";
        const res = await fetch(apiUrl);
        if (!res.ok) return setBrands([]);
        const data = (await res.json()) as Brand[];
        setBrands(data);
      } finally {
        setIsLoading(false);
      }
    }
    run();
  }, []);

  return (
    <div>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {brands.map((brand) => (
          <Link
            href={`/repair/${encodeURIComponent(brand.name)}`}
            key={brand.id}
            aria-label={`Select ${brand.name}`}
          >
            <div className="flex flex-col items-center justify-center transition-all hover:border-pp-orange hover:shadow-lg hover:-translate-y-1 border rounded-lg bg-white cursor-pointer group p-3">
              <div className="aspect-square w-20 sm:w-24 lg:w-20 flex items-center justify-center rounded-md overflow-hidden p-1">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-800 font-semibold text-[10px] sm:text-xs text-center px-1 leading-tight">
                    {brand.name}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!isLoading && !brands.length && (
        <p className="text-center text-muted-foreground mt-4">
          {"No brands available"}
        </p>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-pp-orange">
                Home
              </Link>
            </li>
            <li aria-hidden className="px-1">
              ›
            </li>
            <li className="text-gray-600">Repair</li>
          </ol>
        </nav>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
          Repair Your Mobile Phone
        </h1>

        <h2 className="mt-6 text-base sm:text-lg font-semibold text-black">
          Select Brand
        </h2>

        <div className="mt-4">
          <BrandsAllGrid />
        </div>

        {/* Info Section */}
        {/* <section className="mt-12 lg:mt-16">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black">
              BEST-IN-CLASS PHONE REPAIR SERVICE ONLINE - CERTIFIED EXPERTS
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Phone, tablet, Macbook, smartwatch repair at your home or work
            </p>
            <hr className="mt-6 border-t-2 border-pp-orange mx-auto w-11/12" />
          </div>

          <div className="mx-auto max-w-5xl text-left mt-6 space-y-8 text-gray-800">
            <p className="leading-7">
              In an era where mobile devices are lifelines, Mobile Repair Online
              stands as your reliable ally for swift solutions. Acknowledging
              the paramount role of seamlessly functioning devices in the
              Digital Age, our dedicated team ensures that your gadgets are
              restored to their optimal state. Enjoy the convenience of
              hassle-free repairs from the comfort of your home—just book our
              services online, and we'll handle the rest. With a commitment to
              proficiency and customer satisfaction, count on us to address any
              issue, providing a trustworthy solution to keep you seamlessly
              connected.
            </p>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-black">
                Multi-Device Expertise - Macbook, Tablets & More
              </h3>
              <p className="mt-2 leading-7">
                Our expertise extends beyond mobiles to include Macbooks,
                tablets and more. Whether you need a quick fix or thorough
                repair, our skilled technicians are ready. Discuss with us
                online or book a repair, and let our friendly experts bring your
                devices back to life.
              </p>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-black">
                Whatever the issue, Count on Us to Fix It!
              </h3>
              <p className="mt-2 leading-7">
                Fix your gadgets from home by booking our online service. We're
                equipped with extensive cross-device expertise, addressing
                issues like sluggish performance, quick battery drain,
                overheating, smashed screens, missing home buttons,
                malfunctioning devices, water damage, touch screen problems,
                stuck volume buttons, audio output issues, speaker damage, and
                loose charging ports. Trust us to resolve these common problems
                and keep your devices running smoothly.
              </p>
            </div>
          </div>
        </section> */}

        {/* FAQ Section */}
        {/* <section className="mt-12 lg:mt-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black">
              FAQ'S
            </h2>
            <hr className="mt-4 border-t-2 border-pp-orange mx-auto w-11/12" />

            <div className="mt-6 divide-y">
              {[
                {
                  q: "1. Which brand of phones does PixelPanic repair?",
                  a: "We service all major smartphone brands along with popular tablets and laptops. If your device isn't listed, contact us and we'll confirm availability.",
                },
                {
                  q: "2. How long does it take for PixelPanic to repair a device?",
                  a: "Most common issues are resolved the same day. Some diagnostics, part orders, or advanced repairs may take longer. You'll receive a clear time estimate before we begin.",
                },
                {
                  q: "3. How can I check the price of PixelPanic mobile repair service for my phone?",
                  a: "Select your brand and model to view issue-wise pricing. Final costs are confirmed after a quick on-site or in-store inspection.",
                },
                {
                  q: "4. Is the repair process with PixelPanic secure and reliable?",
                  a: "Yes. Your data stays safe. Our certified technicians follow strict handling protocols and we thoroughly test devices before returning them.",
                },
                {
                  q: "5. How can I book an appointment with PixelPanic for a doorstep service?",
                  a: "Choose your brand, model, and issue, then pick a convenient slot during checkout. We'll confirm the visit instantly.",
                },
                {
                  q: "6. What types of mobile repair services does PixelPanic offer?",
                  a: "Screen and back glass replacement, battery and charging issues, camera and speaker fixes, water damage treatment, diagnostics, and more.",
                },
              ].map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none py-5 text-base sm:text-lg font-semibold text-black [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <svg
                      className="h-5 w-5 text-black transition-transform duration-200 group-open:rotate-180"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="pb-5 text-gray-700 leading-7">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section> */}

        {/* Services Available */}
        {/* <section className="mt-12 lg:mt-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black">
              SERVICES AVAILABLE
            </h2>
            <hr className="mt-4 border-t-2 border-pp-orange mx-auto w-11/12" />

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Back Glass", icon: "🪞" },
                { label: "Screen", icon: "📱" },
                { label: "Battery", icon: "🔋" },
                { label: "Mic", icon: "🎤" },
                { label: "Receiver", icon: "📞" },
                { label: "Charging", icon: "⚡" },
                { label: "Speaker", icon: "🔊" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border bg-white p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-lg bg-gray-50 text-2xl">
                    <span aria-hidden>{s.icon}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section> */}
      </div>
      {/* Site Footer */}
      <Footer />
    </main>
  );
}
