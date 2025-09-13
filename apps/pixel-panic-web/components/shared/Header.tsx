// src/components/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/hooks/use-auth-modal";

// Define the component's props, if any are needed in the future
type HeaderProps = {};

const Header: React.FC<HeaderProps> = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const { openModal } = useAuthModal();

  // State to manage the entrance animation and compact view on scroll
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isCompact, setIsCompact] = useState<boolean>(false);

  // Ref to the header element to calculate its height for the spacer
  const headerRef = useRef<HTMLElement>(null);
  // State to hold the dynamically calculated height for the spacer div
  const [spacerHeight, setSpacerHeight] = useState<number>(0);

  // Effect for the entrance animation
  useEffect(() => {
    // Trigger the animation shortly after the component mounts
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Effect to handle scroll-based UI changes
  useEffect(() => {
    const handleScroll = () => {
      // Add 'compact' class when user scrolls down more than 40px
      setIsCompact(window.scrollY > 40);
    };

    // Set initial state on mount
    handleScroll();

    // Listen for scroll events
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to calculate and update the spacer height
  useEffect(() => {
    const updateSpacerHeight = () => {
      if (headerRef.current) {
        // The spacer height should be equal to the header's height plus its top offset
        const headerTopOffset = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--hdr-top-base"
          ),
          10
        );
        const headerHeight = headerRef.current.offsetHeight;
        setSpacerHeight(headerHeight + headerTopOffset);
      }
    };

    // Calculate on mount and on window resize
    updateSpacerHeight();
    window.addEventListener("resize", updateSpacerHeight);

    // Cleanup listener
    return () => window.removeEventListener("resize", updateSpacerHeight);
  }, []);

  // Don't show anything while determining auth state
  if (isLoading) {
    return null;
  }

  // Only show header on the landing page (/)
  if (pathname !== "/") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <>
      {/* The fixed header element.
        - Uses dynamic classes for animation and scroll effects.
        - Styling is a direct translation of the original CSS to Tailwind CSS, using arbitrary values for precision.
      */}
      <header
        ref={headerRef}
        id="nmimsHeader"
        style={{ "--hdr-top": "var(--hdr-top-base)" } as React.CSSProperties}
        className={`
          fixed left-1/2 z-[9999] w-[calc(100%-28px)] max-w-[1180px] mt-5
          rounded-2xl border border-white/40 bg-white/[.58]
          text-black shadow-[0_10px_28px_rgba(0,0,0,.12)]
          backdrop-blur-lg backdrop-saturate-150
          transition-all duration-300 ease-in-out
          
          ${
            isReady
              ? "opacity-100 translate-x-[-50%] translate-y-0"
              : "opacity-0 translate-x-[-50%] -translate-y-2.5"
          }
          
          ${isCompact ? "shadow-[0_8px_22px_rgba(0,0,0,.14)]" : ""}
        `}
      >
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4 px-2.5 md:h-[64px]">
          {/* Logo and Brand Text */}
          <div className="flex min-w-0 flex-shrink items-center gap-3">
            <Link
              href="/"
              className="text-lg font-bold text-black hover:text-gray-700 transition-colors duration-150"
            >
              Pixel Panic
            </Link>
          </div>

          {/* Right Side - Profile Icon with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="
                  inline-flex items-center justify-center
                  rounded-full bg-white/80 p-2 text-black
                  shadow-[0_2px_8px_rgba(0,0,0,.1)]
                  transition-all duration-150 ease-in-out
                  hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,.15)]
                  hover:-translate-y-0.5
                "
              >
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={openModal}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Spacer element.
        This div occupies the space left behind by the fixed header,
        preventing content from being hidden underneath it.
        Its height is dynamically set based on the header's actual rendered height.
      */}
      <div
        style={{ height: `${spacerHeight}px` }}
        className="nmims-header-spacer"
      />
    </>
  );
};

export default Header;
