import { pageMeta } from "@/lib/seo";
import { Sections, PageHead } from "@/components/HomeSections";
import Button from "@/components/Button";
import NameChip from "@/components/NameChip";
import SocialLinks from "@/components/SocialLinks";
import ContactForm from "@/components/ContactForm";
import SiteFooter from "@/components/SiteFooter";
import { CTA_STATUS, EMAIL } from "@/lib/site";

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
        <div className="container contact-chip">
          <NameChip />
        </div>
        <section className="sec container contact-page">
          <div className="contact-side">
            <p className="avail">
              <span className="dot" aria-hidden="true" />
              {CTA_STATUS}
            </p>
            <Button href={`mailto:${EMAIL}`} iconLeft="mail">{EMAIL}</Button>
            <SocialLinks />
          </div>
          <ContactForm />
        </section>
        <SiteFooter />
      </Sections>
    </main>
  );
}
