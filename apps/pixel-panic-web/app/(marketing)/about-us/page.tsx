export default function AboutUsPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="px-4 sm:px-6 lg:px-16 py-16 sm:py-20 lg:py-24 max-w-5xl mx-auto">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500 font-semibold mb-4">
          About PixelPanic
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
          Mumbai&apos;s most reliable doorstep mobile repair experts.
        </h1>
        <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
          PixelPanic was born in Mumbai with a simple promise: fast, honest, and
          high-quality mobile repairs without the runaround. We bring the repair
          studio to your home or office, so your phone gets fixed while you
          continue with your day. No more waiting in traffic, no more shady
          service centers—just transparent pricing, genuine parts, and trained
          technicians who respect your time.
        </p>
      </section>

      <section className="bg-orange-50 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Our Story</h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              We started PixelPanic after experiencing first-hand how stressful
              a broken device can be—especially in a city that runs on mobiles.
              From booking a slot to hunting for a trustworthy technician, the
              process was filled with uncertainty. So, we set out to create a
              service that Mumbaikars could rely on: certified specialists,
              upfront quotes, and respectful service at your doorstep.
            </p>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
              What Makes Us Different
            </h2>
            <ul className="space-y-4 text-base sm:text-lg text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500"></span>
                <span>
                  <strong>Doorstep convenience:</strong> Technicians arrive with
                  calibrated tools and spares, complete most repairs within one
                  visit, and clean up before they leave.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500"></span>
                <span>
                  <strong>Certified expertise:</strong> Every technician works
                  through an internal training program focused on the latest
                  Apple, Samsung, OnePlus, and Xiaomi models.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500"></span>
                <span>
                  <strong>Transparent pricing:</strong> Instant estimates, clear
                  invoices, and warranty on every eligible repair.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-500"></span>
                <span>
                  <strong>Mumbai-first approach:</strong> We know the city, the
                  monsoon, and the pace. Our slots are designed for busy
                  schedules and quick turnarounds.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 grid gap-10 lg:grid-cols-[1.25fr,1fr] items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
              Our Mission
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              To simplify mobile repairs for every household and office in the
              Mumbai Metropolitan Region. We believe technology should make life
              smoother—not create panic. That is why we respond quickly, repair
              responsibly, and stand behind our work.
            </p>
          </div>
          <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-6">
            <h3 className="text-xl font-semibold text-orange-600 mb-3">
              Service Areas
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              We currently serve South Mumbai, Central suburbs, Western line up
              to Borivali, and Navi Mumbai. New neighbourhoods are added every
              month—drop us a message if you want PixelPanic in your area.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            Looking to partner with us?
          </h2>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8">
            From corporate device maintenance to housing society drives, we love
            working with communities that rely on strong connectivity. Reach out
            and we&apos;ll curate a service plan that fits your needs.
          </p>
          <a
            href="/support"
            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow hover:bg-orange-600 transition"
          >
            Talk to our team
          </a>
        </div>
      </section>
    </main>
  );
}
