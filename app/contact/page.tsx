import { pageMeta, pageJsonLd } from "@/lib/seo";
import { Sections, PageHead } from "@/components/HomeSections";
import Button from "@/components/Button";
import NameChip from "@/components/NameChip";
import SocialLinks from "@/components/SocialLinks";
import ContactForm from "@/components/ContactForm";
import SiteFooter from "@/components/SiteFooter";
import { CTA_STATUS, EMAIL } from "@/lib/site";

export const metadata = pageMeta({
  title: "Hire a Freelance Product Designer",
  description:
    "Contact Tyler Lange, a freelance product designer and UX designer in Vancouver, about your next project.",
  path: "/contact/",
});

const CONTACT_JSON_LD = pageJsonLd(
  "ContactPage",
  "/contact/",
  "Contact Tyler Lange",
  "Get in touch with Tyler Lange about product design and UX projects."
);

export default function ContactPage() {
  return (
    <main className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CONTACT_JSON_LD) }} />
      <Sections page>
        <PageHead title="Let’s talk" lede="Tell me about your project, or just say hello." />
        <section className="sec container contact-page">
          <div className="contact-side">
            <NameChip showName={false} showDot={false} />
            <Button href={`mailto:${EMAIL}`} iconLeft="mail">{EMAIL}</Button>
            <SocialLinks />
            <p className="avail">
              <span className="dot" aria-hidden="true" />
              {CTA_STATUS}
            </p>
          </div>
          <ContactForm />
        </section>
        <SiteFooter />
      </Sections>
    </main>
  );
}
