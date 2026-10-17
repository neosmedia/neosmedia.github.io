"use client";

import { useEffect, useRef } from "react";
import { createRainbow } from "@/lib/rainbow";

// Pattern frequency: the letters use 1.5; the small discs zoom in (1.2) for big, bold shapes.
const SCALE = 1.2;

/**
 * A circle filled with the rainbow shader (same one the balloon letters use).
 * Sits behind its parent's content; the parent needs `position: relative`.
 * `seed` shifts each disc to a different part of the pattern.
 */
export default function ShaderDisc({ seed = 0 }: { seed?: number }) {
  const hostRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const rb = createRainbow();
    if (!rb) return; // no WebGL: the CSS background colour stays
    const size = host.clientWidth || 72;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // circular stencil
    const mask = document.createElement("canvas");
    mask.width = mask.height = Math.round(size * dpr);
    const mc = mask.getContext("2d");
    if (!mc) return;
    mc.fillStyle = "#000";
    mc.beginPath();
    mc.arc(mask.width / 2, mask.height / 2, mask.width / 2, 0, Math.PI * 2);
    mc.fill();

    rb.resize(size, size, dpr);
    host.appendChild(rb.canvas);

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offset = 12 + seed * 17; // a different slice of the pattern per disc
    let raf = 0;
    let visible = true;
    let lastDraw = 0;
    const t0 = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || now - lastDraw < 33) return; // ~30fps is plenty for a small disc
      lastDraw = now;
      rb.render(mask, 1, offset + (calm ? 0 : (now - t0) / 1000), SCALE, size * 0.42);
    };
    rb.render(mask, 1, offset, SCALE, size * 0.42);
    if (!calm) raf = requestAnimationFrame(frame);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
          })
        : null;
    io?.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      rb.destroy();
    };
  }, [seed]);

  return <span ref={hostRef} className="shader-disc" aria-hidden="true" />;
}
