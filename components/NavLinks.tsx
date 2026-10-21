"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/work/", label: "Work" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

/** Primary navigation. Client component only so the current page can be highlighted. */
export default function NavLinks() {
  const path = usePathname() ?? "";
  return (
    <nav className="nav-links" aria-label="Primary">
      {LINKS.map((l) => {
        const active = path.startsWith(l.href.slice(0, -1));
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
