"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAUNCHED } from "@/lib/site";

/** Fired by the photo; the coming soon page listens for it to open the info modal. */
export const TOGGLE_INFO = "toggle-info";

function Photos() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="avatar-color" src="/ty-color.jpg" alt="" width={40} height={40} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="avatar-bw" src="/ty-bw.jpg" alt="" aria-hidden="true" width={40} height={40} />
    </>
  );
}

export default function NavAvatar() {
  const pathname = usePathname();
  const onComingSoon = !LAUNCHED && (pathname === "/" || pathname === "");

  // On the coming soon page the photo opens the info modal;
  // everywhere else it's a link home.
  if (onComingSoon) {
    return (
      <button
        type="button"
        className="nav-avatar"
        aria-label="About Tyler Lange"
        onClick={() => window.dispatchEvent(new Event(TOGGLE_INFO))}
      >
        <Photos />
      </button>
    );
  }

  return (
    <Link href="/" className="nav-avatar" aria-label="Tyler Lange — home">
      <Photos />
    </Link>
  );
}
