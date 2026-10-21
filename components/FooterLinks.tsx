"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/work/", label: "Work" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

/** Footer page links. Client component only so the current page can be greyed out. */
export default function FooterLinks() {
  const path = usePathname() ?? "";
  return (
    <ul className="footer-links">
      {PAGES.map((l) => {
        const active = l.href === "/" ? path === "/" : path.startsWith(l.href.slice(0, -1));
        return (
          <li key={l.href}>
            <Link href={l.href} aria-current={active ? "page" : undefined}>
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
