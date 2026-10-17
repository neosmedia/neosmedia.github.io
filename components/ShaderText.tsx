"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createRainbow } from "@/lib/rainbow";

// Pattern frequency for the text (the balloon letters use 1.5).
const SCALE = 2.2;

/**
 * Text filled with the rainbow shader. The real text stays in the page (so layout,
 * selection and screen readers are unaffected); a transparent WebGL canvas painted
 * through a text-shaped stencil sits on top of it.
 */
export default function ShaderText({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rb = createRainbow();
    if (!rb) return; // no WebGL: the normal text colour stays

    const host = document.createElement("span");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:absolute;pointer-events:none;display:block;";
    host.appendChild(rb.canvas);
    el.appendChild(host);

    const mask = document.createElement("canvas");
    const mc = mask.getContext("2d");
    if (!mc) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let lastDraw = 0;
    let ready = false;
    const t0 = performance.now();

    let bevel = 10;

    const layout = () => {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const pad = Math.ceil(fs * 0.25); // room for glyph overshoot
      bevel = Math.max(6, fs * 0.09); // roughly the stroke radius of the letters
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      host.style.left = `${-pad}px`;
      host.style.top = `${-pad}px`;
      host.style.width = `${w + pad * 2}px`;
      host.style.height = `${h + pad * 2}px`;
      rb.resize(w + pad * 2, h + pad * 2, dpr);

      mask.width = Math.round((w + pad * 2) * dpr);
      mask.height = Math.round((h + pad * 2) * dpr);
      mc.setTransform(dpr, 0, 0, dpr, 0, 0);
      mc.clearRect(0, 0, mask.width, mask.height);
      mc.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      mc.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      mc.fillStyle = "#000";
      mc.textBaseline = "alphabetic";
      const m = mc.measureText(el.textContent || "");
      const asc = m.fontBoundingBoxAscent ?? fs * 0.8;
      const desc = m.fontBoundingBoxDescent ?? fs * 0.2;
      // CSS centres the font's content area inside the line box
      mc.fillText(el.textContent || "", pad, pad + (h + asc - desc) / 2);
      ready = true;
      el.classList.add("shader-text-on");
      rb.render(mask, 1, 20 + (calm ? 0 : (performance.now() - t0) / 1000), SCALE, bevel);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!ready || !visible || now - lastDraw < 33) return;
      lastDraw = now;
      rb.render(mask, 1, 20 + (now - t0) / 1000, SCALE, bevel);
    };
    if (!calm) raf = requestAnimationFrame(frame);

    // draw once the web font is in
    document.fonts?.ready.then(layout);
    layout();

    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
          })
        : null;
    io?.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      el.classList.remove("shader-text-on");
      rb.destroy();
      host.remove();
    };
  }, []);

  return (
    <span ref={ref} className="shader-text">
      {children}
    </span>
  );
}
