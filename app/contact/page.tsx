import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Contact — Tyler Lange" };

export default function ContactPage() {
  return (
    <main className="page page-contact">
      <ContactSection />
      <SiteFooter />
    </main>
  );
}
