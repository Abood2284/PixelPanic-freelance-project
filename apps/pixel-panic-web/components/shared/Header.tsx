import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Logo />
        <nav className="flex items-center space-x-2">
          <Button variant="ghost">
            <MessageCircle className="mr-2 h-4 w-4" />
            {headerContent.cta.chat}
          </Button>
          <Button variant="outline">
            <Phone className="mr-2 h-4 w-4" />
            {headerContent.cta.call}
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Link
      href={headerContent.logo.href}
      className="flex items-center space-x-2"
    >
      {/* <Icons.logo className="h-6 w-6" /> // Future placeholder for an SVG icon */}
      <span className="font-display text-2xl font-bold text-pp-navy">
        {headerContent.logo.text}
      </span>
    </Link>
  );
}

// Static content is separated for clarity and easier maintenance.
// This also prepares the component for internationalization (i18n) if needed.
const headerContent = {
  logo: {
    href: "/",
    text: "PixelPanic",
  },
  cta: {
    chat: "Chat on WhatsApp",
    call: "Call Us",
  },
};

export { Header };
