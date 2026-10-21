import Button from "@/components/Button";
import BalloonName from "@/components/BalloonName";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Page not found", robots: { index: false } };

/**
 * Shown for any unknown URL (GitHub Pages serves it as 404.html).
 * The 404 is spelled with the same balloon letters as the home hero: drag them around.
 */
export default function NotFound() {
  return (
    <main className="page nf">
      <section className="nf-top">
        <h1 className="nf-title">
          <span className="nf-kicker">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M12 7.5v5.5" />
              <circle cx="12" cy="16.4" r="0.6" fill="currentColor" />
            </svg>
            Pop!
          </span>
          That page is gone.
        </h1>
      </section>

      <section className="nf-balloons" aria-label="404">
        <BalloonName mode="hero" word="404" />
      </section>

      <section className="nf-links">
        <Button variant="outline" href="/" iconLeft="arrowLeft">
          Float back home
        </Button>
        <Button variant="primary" href="/work/" iconRight="arrowRight">
          See the work
        </Button>
      </section>
      <SiteFooter />
    </main>
  );
}
