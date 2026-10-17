import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="page page-contact">
      <ContactSection />
      <SiteFooter />
    </main>
  );
}
