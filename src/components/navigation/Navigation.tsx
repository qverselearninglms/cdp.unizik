"use client";

import React, { useState, useEffect, useRef } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuthContext } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Menu,
  X,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "../ui/mood-toggle";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, logout, isLoggingOut } = useAuthContext();
  const pathname = usePathname();

  const navRef = useRef<HTMLDivElement>(null);

  const isOnAdmissionPage =
    pathname.startsWith("/process-admission") ||
    pathname.startsWith("/verify-payments");

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <>
      {/* ───────── NAVBAR ───────── */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled && "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border/40"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* NAV ITEMS */}
            <nav className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map((item) =>
                item.isDropdown && item.subItems ? (
                  <div key={item.href} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(item.label);
                      }}
                      className="
                        px-4 py-2
                        rounded-xl
                        font-semibold
                        text-sm
                        text-foreground
                        hover:bg-accent
                        transition
                        flex items-center gap-1
                      "
                    >
                      {item.label}
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openDropdown === item.label && "rotate-90"
                        )}
                      />
                    </button>

                    {/* DROPDOWN */}
                    {openDropdown === item.label && (
                      <div
                        className="
                          absolute top-full left-0 mt-2 w-56
                          bg-background/95 backdrop-blur-xl
                          border border-border/40
                          rounded-xl shadow-xl
                          overflow-hidden
                        "
                      >
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setOpenDropdown(null)}
                            className="
                              block px-4 py-3
                              text-sm font-medium
                              hover:bg-accent
                              transition
                            "
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="
                      px-4 py-2
                      rounded-xl
                      font-semibold
                      text-sm
                      text-muted-foreground
                      hover:text-foreground
                      hover:bg-accent
                      transition
                    "
                  >
                    {item.label}
                  </button>
                )
              )}
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2">
              <ModeToggle />

              {/* AUTH */}
              {user ? (
                <>
                  {!isOnAdmissionPage && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="
                        hidden md:flex
                        rounded-xl
                        font-semibold
                        gap-2
                      "
                    >
                      <Link href="/process-admission">
                        <BookOpen className="h-4 w-4" />
                        Admission
                      </Link>
                    </Button>
                  )}

                  <div className="hidden md:flex items-center gap-2 rounded-xl border px-3 py-1 bg-muted/40">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={(user as any)?.avatar} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">
                      {user.first_name}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout()}
                    loading={isLoggingOut}
                    className="hidden md:flex rounded-xl"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  className="hidden md:flex rounded-3xl font-semibold px-8"
                >
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              )}

              {/* MOBILE MENU */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ───────── MOBILE DRAWER ───────── */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          isMobileMenuOpen ? "visible" : "invisible"
        )}
      >
        {/* BACKDROP */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* DRAWER */}
        <aside
          className={cn(
            "absolute right-0 top-0 h-full w-[88%] max-w-sm",
            "bg-background/95 backdrop-blur-xl",
            "border-l border-border/40 shadow-2xl",
            "flex flex-col transition-transform duration-300",
            "rounded-l-2xl",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex justify-center pt-2">
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* NAV */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-1">
            {NAV_ITEMS.map((item) =>
              item.isDropdown && item.subItems ? (
                <div key={item.href} className="space-y-1">
                  <p className="px-3 py-2 text-sm font-semibold">
                    {item.label}
                  </p>

                  <div className="ml-2 space-y-1">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="
                          flex items-center justify-between
                          px-3 py-2 rounded-xl
                          text-sm font-medium
                          hover:bg-accent
                        "
                      >
                        {sub.label}
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="
                    w-full flex items-center justify-between
                    px-4 py-3 rounded-xl
                    text-sm font-semibold
                    hover:bg-accent
                  "
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </button>
              )
            )}
          </nav>

          {/* FOOTER */}
          <div className="p-4 border-t border-border/40">
            {user ? (
              <Button
                className="w-full rounded-xl font-semibold"
                variant="destructive"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                loading={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button
                asChild
                className="w-full rounded-full font-semibold"
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};