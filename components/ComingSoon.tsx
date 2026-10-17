"use client";

import { useEffect, useState } from "react";
import BalloonName from "./BalloonName";
import { clearingFor } from "@/lib/softbody";
import { TOGGLE_INFO } from "./NavAvatar";
import Toolbox from "./Toolbox";

export default function ComingSoon() {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  // Size the text to the clearing the letters are pushed out of.
  useEffect(() => {
    const measure = () => {
      const c = clearingFor(window.innerWidth, window.innerHeight);
      setBox({ w: c.rx * 2 * 0.82, h: c.ry * 2 * 0.82 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // The photo in the nav toggles the modal too.
  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener(TOGGLE_INFO, toggle);
    return () => window.removeEventListener(TOGGLE_INFO, toggle);
  }, []);

  // While open: Esc closes, and so does a tap/click outside the text.
  // (Drags don't count, so letters can still be thrown around.)
  useEffect(() => {
    if (!open) return;
    let sx = 0;
    let sy = 0;
    let down = false;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      sx = e.clientX;
      sy = e.clientY;
      down = true;
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) return;
      const t = e.target as Element | null;
      if (t?.closest(".info, .footer-btn, .nav-avatar, .nav-actions")) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
    };
  }, [open]);

  return (
    <main>
      <div className="screen">
      <h1 className="sr-only">Tyler Lange — Freelance Product Designer and UX Designer in Vancouver</h1>
      <p className="sr-only">Freelance product designer and UX designer with over 18 years of experience, based in Vancouver, BC. Currently designing AI analytics for the semiconductor industry at PDF.com.</p>
      <BalloonName clearing={open} />
      <noscript>
        <p className="noscript">Tyler Lange</p>
      </noscript>

      <div
        id="info-panel"
        className={`info${open ? " info-open" : ""}`}
        role="dialog"
        aria-label="About Tyler Lange"
        aria-hidden={!open}
        inert={!open}
        style={box ? { width: box.w, maxHeight: box.h } : undefined}
      >
        <p>
          Tyler Lange is a Product Designer and UX Engineer with over 18 years of
          experience.
        </p>
        <p>
          Currently working at{" "}
          <a href="https://www.pdf.com" target="_blank" rel="noopener noreferrer">
            PDF.com
          </a>{" "}
          on AI Analytics for the Semiconductor industry. Formerly at{" "}
          <a href="https://www.ea.com/sports" target="_blank" rel="noopener noreferrer">
            EA Sports
          </a>
          ,{" "}
          <a href="https://www.sap.com" target="_blank" rel="noopener noreferrer">
            SAP
          </a>{" "}
          and{" "}
          <a href="https://www.gevernova.com/software" target="_blank" rel="noopener noreferrer">
            GE Digital
          </a>
          . He lives with family in Vancouver, BC.
        </p>
      </div>

      <footer className="footer">
        <span>Product Designer and UX Engineer</span>
        <span className="hint">
          <svg viewBox="0 0 12 8" width="10" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1.5 6.5 6 2l4.5 4.5" />
          </svg>
          Drag the letters
        </span>
        <button
          type="button"
          className="footer-btn"
          aria-expanded={open}
          aria-controls="info-panel"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Info"}
        </button>
      </footer>
      </div>

      <div className="below">
        <Toolbox />
        <p className="bottom-note">Projects and case studies coming soon</p>
      </div>
    </main>
  );
}
