import Link from "next/link";
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
        <h1 className="nf-title">Pop! That page is gone.</h1>
      </section>

      <section className="nf-balloons" aria-label="404">
        <BalloonName mode="hero" word="404" />
      </section>

      <section className="nf-links">
        <Link className="btn btn-outline" href="/">
          Float back home
        </Link>
        <Link className="btn btn-outline" href="/contact/">
          Contact
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
