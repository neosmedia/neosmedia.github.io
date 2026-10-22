import { pageMeta } from "@/lib/seo";
import { Sections, PageHead } from "@/components/HomeSections";
import ContactForm from "@/components/ContactForm";
import SiteFooter from "@/components/SiteFooter";
import { CTA_STATUS, DRIBBBLE_URL, EMAIL, LINKEDIN_URL } from "@/lib/site";

export const metadata = pageMeta({
  title: "Contact",
  description:
    "Contact Tyler Lange, a freelance product designer and UX designer in Vancouver, about your next project.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <main className="page">
      <Sections page>
        <PageHead title="Let’s talk" lede="Tell me about your project, or just say hello." />
        <section className="sec container contact-page">
          <div className="contact-side">
            <p className="avail">
              <span className="dot" aria-hidden="true" />
              {CTA_STATUS}
            </p>
            <a className="btn btn-solid" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a className="btn btn-outline" href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
            <a className="btn btn-outline" href={DRIBBBLE_URL} target="_blank" rel="noreferrer">Dribbble <span aria-hidden="true">↗</span></a>
            <p className="contact-handle mono">@tylerlangebc</p>
          </div>
          <ContactForm />
        </section>
        <SiteFooter />
      </Sections>
    </main>
  );
}
