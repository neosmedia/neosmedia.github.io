"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAUNCHED } from "@/lib/site";

/** Fired by the logo; the coming soon page listens for it to open the info modal. */
export const TOGGLE_INFO = "toggle-info";

/** Logo mark: the "T" from the favicon on a white circle (public/logo.png). */
function Logo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="avatar-color" src="/logo.png" alt="" width={40} height={40} decoding="async" />
  );
}

export default function NavAvatar() {
  const pathname = usePathname();
  const onComingSoon = !LAUNCHED && (pathname === "/" || pathname === "");

  // On the coming soon page the logo opens the info modal;
  // everywhere else it's a link home.
  if (onComingSoon) {
    return (
      <button
        type="button"
        className="nav-avatar"
        aria-label="About Tyler Lange"
        onClick={() => window.dispatchEvent(new Event(TOGGLE_INFO))}
      >
        <Logo />
      </button>
    );
  }

  return (
    <Link href="/" className="nav-avatar" aria-label="Tyler Lange — home">
      <Logo />
    </Link>
  );
}
