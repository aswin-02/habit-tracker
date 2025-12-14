"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useState } from "react";

export default function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function linkClass(href: string) {
    const isActive = pathname === href;
    return `
      px-4 py-2 rounded-lg text-sm font-medium transition-colors
      ${isActive 
        ? "bg-blue-500 text-white shadow-md" 
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"}
    `;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const handleNavClick = (href: string) => {
    router.push(href);
    router.refresh();
    setIsMenuOpen(false);
  };

  return (
    <nav className="nav-background border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="font-bold text-lg sm:text-xl text-blue-600 dark:text-blue-400 whitespace-nowrap">
            HabitTracker
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => {
                router.push("/dashboard");
                router.refresh();
              }}
              className={linkClass("/dashboard")}
            >
              Dashboard
            </button>

            <Link href="/dashboard/habits" className={linkClass("/dashboard/habits")}>
              Manage Habits
            </Link>

            <Link href="/dashboard/profile" className={linkClass("/dashboard/profile")}>
              Profile
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1 hidden md:block" />

          {/* Desktop Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:block px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 rounded-lg transition-colors whitespace-nowrap"
          >
            Logout
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <button
              onClick={() => handleNavClick("/dashboard")}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-blue-500 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              Dashboard
            </button>

            <Link
              href="/dashboard/habits"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard/habits"
                  ? "bg-blue-500 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              Manage Habits
            </Link>

            <Link
              href="/dashboard/profile"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard/profile"
                  ? "bg-blue-500 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              Profile
            </Link>

            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
