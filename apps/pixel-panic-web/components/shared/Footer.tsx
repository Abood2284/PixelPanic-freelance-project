export default function Footer() {
  return (
    <footer className="bg-pp-navy text-white">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <p className="text-sm leading-loose text-slate-400">
          © {new Date().getFullYear()} PixelPanic. All Rights Reserved.
        </p>

        <nav className="flex items-center space-x-6 text-slate-400">
          <a
            href="/faq#parts"
            className="text-sm hover:text-white transition-colors"
          >
            Are parts original?
          </a>
          <a
            href="/faq#guarantee"
            className="text-sm hover:text-white transition-colors"
          >
            What if it's not fixed?
          </a>
          <a
            href="/faq#data"
            className="text-sm hover:text-white transition-colors"
          >
            Is my data safe?
          </a>
        </nav>
      </div>
    </footer>
  );
}
