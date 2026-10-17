import ContactForm from "./ContactForm";
import { BOOKING_URL } from "@/lib/site";

export default function ContactSection() {
  return (
    <section className="contact container" id="contact">
      <div className="contact-left">
        <p className="label">Have something in mind?</p>
        <h2 className="balloon">
          Let’s build
          <br />
          together.
        </h2>
        <p className="avail">
          <span className="dot" aria-hidden="true" />
          Available for November 2026 to work on full-time or contract design projects.
        </p>
        <a className="btn btn-outline" href={BOOKING_URL}>
          Book a time to chat <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="contact-right">
        <ContactForm />
      </div>
    </section>
  );
}
