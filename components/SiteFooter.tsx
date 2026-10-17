import { EMAIL, TOOLS } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="site-footer container">
      <div className="footer-top">
        <div>
          <p className="label">Stay in touch</p>
          <a className="footer-mail" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </div>
        <div>
          <p className="label">A few tools of the trade</p>
          <ul className="tools">
            {TOOLS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2027 Tyler Lange</span>
        <span>Thoughtfully made. Always evolving.</span>
      </div>
    </footer>
  );
}
