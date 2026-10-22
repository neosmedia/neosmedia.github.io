import { EMAIL, LINKEDIN_URL, PHONE_TEL } from "@/lib/site";

/** Email, phone (keypad) and LinkedIn icon buttons. Shared by the nav and the footer. */
export default function ContactIcons() {
  return (
    <>
      <a className="icon-btn" href={`mailto:${EMAIL}`} aria-label="Email Tyler" title="Email">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </a>
      <a className="icon-btn" href={PHONE_TEL} aria-label="Call Tyler" title="Call">
          {/* keypad: 3 x 4 grid of dots */}
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <path d="M6 3.5h.01M12 3.5h.01M18 3.5h.01M6 9.5h.01M12 9.5h.01M18 9.5h.01M6 15.5h.01M12 15.5h.01M18 15.5h.01M12 21h.01" />
          </svg>
        </a>
      <a className="icon-btn" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="Tyler on LinkedIn" title="LinkedIn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
    </>
  );
}
