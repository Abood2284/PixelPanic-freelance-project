// apps/pixel-panic-web/components/shared/CallToAction.tsx
import Link from "next/link";

export default function CallToAction() {
  return (
    // This section is separate from the footer.
    <section className="relative z-10 bg-black text-white py-24 md:py-32 flex flex-col items-center justify-center text-center">
      <h2 className="text-7xl md:text-9xl font-bold">PixelPanic</h2>
      <p className="mt-4 text-xl text-gray-300">
        Ready for a hassle-free repair?
      </p>
      <Link
        href="/repair" // Link to the start of the repair flow
        className="mt-8 inline-block px-10 py-4 bg-orange-500 text-white font-semibold rounded-full text-lg hover:bg-orange-600 transition-colors duration-300"
      >
        Book Your Repair Now
      </Link>
    </section>
  );
}
