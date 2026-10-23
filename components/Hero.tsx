"use client";

/**
 * The home hero: balloon letters + the drifting info balloon + the avatar.
 * Clicking / tapping the balloon opens a small info panel; the letters move aside to make a hole for it
 * (BalloonName does that, sized from `infoRef`). Esc, or a click anywhere else, closes it.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import BalloonName from "./BalloonName";
import HeroAvatar from "./HeroAvatar";

export default function Hero() {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const openedAt = useRef(0);

  const set = useCallback((v: boolean) => {
    openRef.current = v;
    setOpen(v);
  }, []);

  const onBalloonClick = useCallback(() => {
    openedAt.current = performance.now(); // (stops the outside-tap handler from also firing)
    set(!openRef.current);
  }, [set]);

  useEffect(() => {
    if (!open) return;
    let down: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const onUp = (e: PointerEvent) => {
      if (!down || performance.now() - openedAt.current < 120) return;
      const quick = performance.now() - down.t < 600;
      const still = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8;
      down = null;
      // a drag (of a letter or the balloon) keeps it open; a plain tap elsewhere closes it
      if (quick && still && !(e.target as Element).closest?.(".hero-info-btn")) set(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") set(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, set]);

  return (
    <section className="hero">
      <BalloonName mode="hero" balloon clearing={open} infoRef={infoRef} onBalloonClick={onBalloonClick} />
      <div
        id="hero-info"
        ref={infoRef}
        className={`hero-info${open ? " is-open" : ""}`}
        role="region"
        aria-label="How to play"
        aria-hidden={!open}
      >
        <p className="hero-info-title">Drag the letters</p>
        <p>Move the letters around to see the shaders. Don’t hold too long or the letter will pop!</p>
      </div>
      {/* keyboard / screen-reader way to open the info (the balloon itself is pointer-only) */}
      <button
        type="button"
        className="hero-info-btn"
        aria-expanded={open}
        aria-controls="hero-info"
        onClick={() => {
          openedAt.current = performance.now();
          set(!openRef.current);
        }}
      >
        {open ? "Hide info" : "Show info"}
      </button>
      <HeroAvatar />
    </section>
  );
}
