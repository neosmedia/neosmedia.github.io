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
        <h1 className="nf-title">Pop! That page is gone.</h1>
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
