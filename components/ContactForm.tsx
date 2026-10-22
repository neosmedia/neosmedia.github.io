"use client";

import { useState, type FormEvent } from "react";
import { EMAIL, FORMSPREE_ID } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("_gotcha")) return; // honeypot: bots only

    // No Formspree ID yet: fall back to the visitor's mail app.
    if (!FORMSPREE_ID) {
      const subject = encodeURIComponent(`Note from ${data.get("name")}`);
      const body = encodeURIComponent(
        `${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`
      );
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h3 className="form-title">Or, drop me a note.</h3>
      <p className="form-to">To: {EMAIL}</p>

      <label className="field">
        <span>Your name</span>
        <input name="name" type="text" placeholder="Alex Smith" autoComplete="name" required />
      </label>
      <label className="field">
        <span>Email address</span>
        <input name="email" type="email" placeholder="alex@company.com" autoComplete="email" required />
      </label>
      <label className="field">
        <span>What are you thinking?</span>
        <textarea name="message" rows={3} placeholder="A little about you and your project…" required />
      </label>

      {/* honeypot */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />

      <button className="btn btn-outline" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"} <span aria-hidden="true">↗</span>
      </button>

      <p className="form-status" role="status" aria-live="polite">
        {status === "sent" && "Thanks! Your note is on its way."}
        {status === "error" && `Something went wrong. Please email ${EMAIL} directly.`}
      </p>
    </form>
  );
}
