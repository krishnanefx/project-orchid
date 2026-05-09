"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#students", label: "Students" },
  { href: "#societies", label: "Societies" },
  { href: "#about", label: "About" },
];

export function NavigationHeader() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center max-w-container-max mx-auto px-gutter py-4">
        <div className="font-display text-h2 font-bold text-primary">Project Orchid</div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-on-surface-variant font-label hover:text-primary transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-6 py-2 rounded-full bg-primary text-on-primary font-label hover:bg-primary-container hover:text-on-primary transition-colors duration-150 shadow-md active:scale-95"
          >
            Login
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="md:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary outline-none"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="md:hidden border-t border-outline-variant/50">
          <nav aria-label="Mobile navigation" className="flex flex-col px-gutter py-3 gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={close}
                className="px-4 py-3.5 rounded-xl font-label text-on-surface hover:bg-surface-container transition-colors duration-150"
              >
                {label}
              </a>
            ))}
            <div className="mt-3 pt-3 border-t border-outline-variant/50">
              <Link
                href="/login"
                onClick={close}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-on-primary font-label font-bold hover:bg-primary-container hover:text-on-primary transition-colors duration-150"
              >
                Login to Dashboard
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
