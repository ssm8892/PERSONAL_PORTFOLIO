"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ChevronLeft } from "@/lib/icons";

const NAV = [
  { href: "/developer", label: "Developer" },
  { href: "/artist", label: "Artist" },
];

export function SiteNav({ name }: { name: string }) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  // Scroll-edge effect: the hairline only appears once content is underneath.
  useEffect(() => {
    const el = ref.current!;
    const onScroll = () => el.classList.toggle("is-scrolled", window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header ref={ref} className="chrome">
      <div className="wrap chrome-inner">
        <Link className="chrome-home" href="/">
          <ChevronLeft />
          <span>{name}</span>
        </Link>
        <nav className="chrome-nav" aria-label="Sections">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={pathname.startsWith(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
