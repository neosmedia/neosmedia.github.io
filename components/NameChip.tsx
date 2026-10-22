"use client";

import { useEffect, useState } from "react";

const TIME_ZONE = "America/Vancouver";

/** "GMT-7" (summer) or "GMT-8" (winter): worked out in the browser so it is right all year. */
function gmtOffset(): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "shortOffset" }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

/** Name + location chip (About and Contact pages): green dot, name, pin, "Vancouver, CA GMT-7". */
export default function NameChip() {
  const [gmt, setGmt] = useState("");
  useEffect(() => setGmt(gmtOffset()), []);
  return (
    <p className="name-chip">
      <span className="name-chip-dot" aria-hidden="true" />
      <span className="name-chip-name">Tyler Lange</span>
      <span className="name-chip-sep" aria-hidden="true" />
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
      <span className="name-chip-place">
        Vancouver, CA{gmt && <span className="name-chip-gmt"> · {gmt}</span>}
      </span>
    </p>
  );
}
