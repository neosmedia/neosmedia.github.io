"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ROLE_TITLE } from "@/lib/site";

const SHOW_AFTER_MS = 900; // let the balloons pop in first
const SHOW_FOR_MS = 2000; // the title fades away again after this long

/**
 * Small photo that sits on top of the hero balloons (it doesn't interact with them).
 * The job title shows briefly on load, then fades; hover / tap / focus shows it again.
 */
export default function HeroAvatar() {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const set = useCallback((next: boolean) => {
    if (openRef.current === next) return;
    openRef.current = next;
    setOpen(next);
  }, []);

  // default: appear once, then fade after 2s
  useEffect(() => {
    const show = window.setTimeout(() => {
      set(true);
      timer.current = window.setTimeout(() => set(false), SHOW_FOR_MS);
    }, SHOW_AFTER_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(timer.current);
    };
  }, [set]);

  const hold = (next: boolean) => {
    window.clearTimeout(timer.current); // the user took over: no more auto-hide
    set(next);
  };

  return (
    <button
      type="button"
      className={`hero-avatar${open ? " is-open" : ""}`}
      aria-describedby="hero-avatar-tip"
      onMouseEnter={() => hold(true)}
      onMouseLeave={() => hold(false)}
      onFocus={() => hold(true)}
      onBlur={() => hold(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
      <img src="/ty-color.jpg" alt="Tyler Lange" width={48} height={48} decoding="async" />
      <span id="hero-avatar-tip" role="tooltip" className="hero-avatar-tip">
        {ROLE_TITLE}
      </span>
    </button>
  );
}
