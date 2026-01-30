// src/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CardNav from "@/components/CardNav";
import { useAuth } from "@/hooks/use-auth";
import { useAuthModal } from "@/hooks/use-auth-modal";

interface HeaderProps {}

function Header(_: HeaderProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { openModal } = useAuthModal();

  const [isReady, setIsReady] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return null;
  }

  const showOnPaths = [
    "/",
    "/repair",
    "/device",
    "/support",
    "/track",
    "/about-us",
    "/contact-us",
  ];

  const isMarketingPage =
    showOnPaths.some((path) => pathname === path) ||
    pathname.startsWith("/repair/") ||
    pathname.startsWith("/device/");

  if (!isMarketingPage) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const getNavigationItems = () => {
    if (isAuthenticated) {
      return [
        {
          label: "Track Order",
          bgColor: "#ffffff",
          textColor: "#0f0f0f",
          links: [
            {
              label: "Go to tracker",
              href: "/orders",
              ariaLabel: "Go to your order tracker",
            },
          ],
        },
        {
          label: "Sign Out",
          bgColor: "#f9fafb",
          textColor: "#0f0f0f",
          links: [
            {
              label: "Log out",
              href: "#",
              ariaLabel: "Sign out of PixelPanic",
              onClick: handleLogout,
            },
          ],
        },
      ];
    }

    return [
      {
        label: "Track Repair",
        bgColor: "#ffffff",
        textColor: "#0f0f0f",
        links: [
          {
            label: "Check status",
            href: "#",
            ariaLabel: "Track a repair",
            onClick: openModal,
          },
        ],
      },
      {
        label: "Sign In",
        bgColor: "#f9fafb",
        textColor: "#0f0f0f",
        links: [
          {
            label: "Access your account",
            href: "#",
            ariaLabel: "Sign in to PixelPanic",
            onClick: openModal,
          },
        ],
      },
    ];
  };

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-in-out
        ${isReady ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
        ${isCompact ? "transform scale-95" : ""}
      `}
    >
      <CardNav
        logoText="PixelPanic"
        logoAlt="Pixel Panic"
        items={getNavigationItems()}
        baseColor="#ffffff"
        menuColor="#0f0f0f"
        buttonBgColor="#0f0f0f"
        buttonTextColor="#f8f7f3"
        customButton={null}
        showDefaultButton={false}
        logoPosition="left"
        hamburgerAlign="right"
      />
    </div>
  );
}

export default Header;
