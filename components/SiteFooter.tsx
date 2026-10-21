import Link from "next/link";
import { EMAIL, TOOLS } from "@/lib/site";

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/work/", label: "Work" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer container">
      <div className="footer-top">
        <div>
          <p className="label">Get in touch</p>
          <a className="footer-mail" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </div>
        <nav aria-label="Footer">
          <p className="label">Pages</p>
          <ul className="footer-links">
            {PAGES.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="label">Design Stack</p>
          <ul className="tools">
            {TOOLS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Tyler Lange</span>
        <span>Thoughtfully made in Canada.</span>
      </div>
    </footer>
  );
}
