import ContactIcons from "./ContactIcons";
import FooterLinks from "./FooterLinks";
import { EMAIL, TOOLS } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="site-footer container">
      <div className="footer-top">
        <div>
          <p className="label">Get in touch</p>
          <a className="footer-mail" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <div className="footer-icons">
            <ContactIcons />
          </div>
        </div>
        <nav aria-label="Footer">
          <p className="label">Pages</p>
          <FooterLinks />
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
        <span>©{new Date().getFullYear()} Tyler Lange</span>
        <span>Thoughtfully made in Canada.</span>
      </div>
    </footer>
  );
}
