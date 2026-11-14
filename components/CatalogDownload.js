"use client";

import { useState } from "react";

export default function CatalogDownload() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  async function submitRequest(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setStatus("");

    try {
      const formData = new FormData(form);
      const response = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Could not prepare the catalog download.");
      }

      setStatus("The download link has been emailed to you. Please check your inbox.");
      form.reset();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="catalog-download">
        <p>Need a copy for your records?</p>
        <button className="btn" type="button" onClick={() => {
          setStatus("");
          setIsOpen(true);
        }}>
          Download PDF
        </button>
      </div>

      {isOpen && (
        <div
          className="catalog-modal-backdrop"
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
        >
          <section
            className="catalog-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-form-title"
          >
            <button
              className="catalog-modal-close"
              type="button"
              aria-label="Close download form"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
            <h2 id="catalog-form-title">Download the catalog</h2>
            <p className="sub">
              Share your details and we will email you a link to the catalog.
            </p>
            <form onSubmit={submitRequest}>
              <label>
                Name
                <input
                  name="name"
                  autoComplete="name"
                  maxLength="120"
                  autoFocus
                  required
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength="254"
                  required
                />
              </label>
              <label>
                Company <span>(optional)</span>
                <input name="company" autoComplete="organization" maxLength="160" />
              </label>
              <div className="catalog-honeypot" aria-hidden="true">
                <label>
                  Website
                  <input name="website" tabIndex="-1" autoComplete="off" />
                </label>
              </div>
              <label className="catalog-consent">
                <input name="consent" type="checkbox" value="yes" required />
                <span>
                  I agree to share these details with SS Elevator for this
                  catalog request.
                </span>
              </label>
              <button className="btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending email..." : "Email me the download link"}
              </button>
              <p className="catalog-status" role="status" aria-live="polite">
                {status}
              </p>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
