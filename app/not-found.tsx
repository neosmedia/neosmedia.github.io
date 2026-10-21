import Link from "next/link";
import { Sections } from "@/components/HomeSections";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Page not found", robots: { index: false } };

/** Shown for any unknown URL (GitHub Pages serves it as 404.html). */
export default function NotFound() {
  return (
    <main className="page">
      <Sections page>
        <section className="sec container page-intro">
          <h1 className="sec-title">Lost? Same.</h1>
          <p className="page-intro-lede">That page does not exist, or it moved. Here is a way back.</p>
          <div className="work-more">
            <Link className="btn btn-solid" href="/">Back home</Link>
            <Link className="btn btn-outline" href="/work/" style={{ marginLeft: 10 }}>See the work</Link>
          </div>
        </section>
        <SiteFooter />
      </Sections>
    </main>
  );
}
