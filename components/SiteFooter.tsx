import ContactIcons from "./ContactIcons";
import FooterLinks from "./FooterLinks";
import { EMAIL, TOOLS } from "@/lib/site";
import { TOOLBOX } from "@/lib/toolbox";

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
            {TOOLS.map((name) => {
              const icon = TOOLBOX.find((t) => t.name === name);
              return (
                <li key={name} title={name}>
                  {icon ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={name}>
                      <path d={icon.d} />
                    </svg>
                  ) : (
                    name
                  )}
                </li>
              );
            })}
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
