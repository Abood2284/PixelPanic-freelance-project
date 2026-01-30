const faqs = [
  {
    question: "How fast can you repair my phone?",
    answer:
      "Most doorstep repairs are completed within 45–90 minutes depending on the device and issue. If we need to source a rare part, we will update you with the exact timeline before starting.",
  },
  {
    question: "Do you use genuine parts?",
    answer:
      "Yes. We work with authorised part distributors across Mumbai. Every repair comes with a warranty slip so you always know what was replaced and for how long it is covered.",
  },
  {
    question: "What happens if the issue returns?",
    answer:
      "If the same problem appears within the warranty period, simply reach out with your job ID. We will schedule a priority revisit at no additional service charge.",
  },
  {
    question: "Can you visit my office?",
    answer:
      "Absolutely. We regularly service offices, co-working spaces, and residential societies. Choose the address while booking or mention it to our support team and we will coordinate the slot.",
  },
];

export default function SupportPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="px-4 sm:px-6 lg:px-16 py-16 sm:py-20 lg:py-24 max-w-5xl mx-auto">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500 font-semibold mb-4">
          Need Help?
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
          We&apos;re here to keep your phone—and your day—running smoothly.
        </h1>
        <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
          Whether you have a question before booking, need an update on an
          ongoing repair, or want to plan a bulk service for your team, the
          PixelPanic support crew is ready to help. Pick the channel that works
          best for you and we&apos;ll take it from there.
        </p>
      </section>

      <section className="bg-orange-50 py-14 sm:py-18">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 grid gap-8 sm:grid-cols-2">
          <div className="rounded-xl bg-white/90 border border-orange-100 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-orange-600 mb-3">Call</h2>
            <p className="text-base text-slate-700 mb-4">
              Talk directly with a service coordinator who can check part
              availability, confirm pricing, or reschedule your slot in minutes.
            </p>
            <a
              href="tel:+919326108547"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600 transition"
            >
              +91 93261 08547
            </a>
            <p className="text-xs text-slate-500 mt-3">
              Lines open 9:00 AM – 9:00 PM, Monday to Sunday.
            </p>
          </div>

          <div className="rounded-xl bg-white/90 border border-orange-100 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-orange-600 mb-3">
              WhatsApp / Chat
            </h2>
            <p className="text-base text-slate-700 mb-4">
              Get quick answers, share photos of the damage, or track your
              technician in real time. Perfect for busy workdays or noisy
              commutes.
            </p>
            <a
              href="https://wa.me/919326108547"
              className="inline-flex items-center justify-center rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-600 transition"
            >
              Message us on WhatsApp
            </a>
            <p className="text-xs text-slate-500 mt-3">
              Typical response time: under 10 minutes during working hours.
            </p>
          </div>

          <div className="rounded-xl bg-white/90 border border-orange-100 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-orange-600 mb-3">Email</h2>
            <p className="text-base text-slate-700 mb-4">
              Need a detailed estimate, invoice copy, or corporate proposal?
              Send us a note and we&apos;ll respond with all the details you need.
            </p>
            <a
              href="mailto:support@pixelpanic.in"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
            >
              support@pixelpanic.in
            </a>
            <p className="text-xs text-slate-500 mt-3">
              We reply within 4 business hours. Attach your job ID for faster
              support.
            </p>
          </div>

          <div className="rounded-xl bg-white/90 border border-orange-100 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-orange-600 mb-3">
              Book a Technician
            </h2>
            <p className="text-base text-slate-700 mb-4">
              Ready to schedule a visit? Choose your device and issue, pick a
              time slot, and our expert will be at your doorstep.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600 transition"
            >
              Start a booking
            </a>
            <p className="text-xs text-slate-500 mt-3">
              Same-day appointments available across most Mumbai neighbourhoods.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-slate-200 p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-base text-slate-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            Still have questions?
          </h2>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8">
            Leave your details and our team will call you back with a personalised
            solution. We promise straight answers—no jargon, no pressure.
          </p>
          <a
            href="mailto:support@pixelpanic.in"
            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow hover:bg-orange-600 transition"
          >
            Request a call-back
          </a>
        </div>
      </section>
    </main>
  );
}
