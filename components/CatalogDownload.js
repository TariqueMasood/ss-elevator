"use client";

import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CatalogDownload() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  async function submitRequest(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const nextErrors = {};

    if (!name) nextErrors.name = "Please enter your name.";
    if (!email) {
      nextErrors.email = "Please enter your email address.";
    } else if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (formData.get("consent") !== "yes") {
      nextErrors.consent = "Please agree to share your details.";
    }

    setErrors(nextErrors);
    setStatus(null);
    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Please complete the required fields highlighted below.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company: String(formData.get("company") ?? "").trim(),
          website: String(formData.get("website") ?? ""),
          consent: formData.get("consent"),
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result &&
            typeof result === "object" &&
            "error" in result &&
            typeof result.error === "string"
            ? result.error
            : "Could not email your download link. Please try again.",
        );
      }

      if (
        !result ||
        typeof result !== "object" ||
        !("success" in result) ||
        result.success !== true
      ) {
        throw new Error(
          "We could not confirm that your request was submitted. Please try again.",
        );
      }

      setStatus({
        type: "success",
        message:
          "The download link has been emailed to you. Please check your inbox.",
      });
      setErrors({});
      form.reset();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof TypeError
            ? "We could not connect to the server. Check your internet connection and try again."
            : error instanceof Error
              ? error.message
              : "Could not email your download link. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearFieldError(field) {
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setStatus(null);
  }

  return (
    <>
      <div className="catalog-download" data-reveal>
        <p>Need a copy for your records?</p>
        <button className="btn" type="button" onClick={() => {
          setStatus(null);
          setErrors({});
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
            <form noValidate onSubmit={submitRequest}>
              <div className="contact-field">
                <label htmlFor="catalog-name">Name</label>
                <input
                  id="catalog-name"
                  name="name"
                  autoComplete="name"
                  maxLength="120"
                  autoFocus
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "catalog-name-error" : undefined}
                  onChange={() => clearFieldError("name")}
                />
                {errors.name && (
                  <p className="field-error" id="catalog-name-error">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="contact-field">
                <label htmlFor="catalog-email">Email</label>
                <input
                  id="catalog-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength="254"
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "catalog-email-error" : undefined
                  }
                  onChange={() => clearFieldError("email")}
                />
                {errors.email && (
                  <p className="field-error" id="catalog-email-error">
                    {errors.email}
                  </p>
                )}
              </div>
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
                <input
                  name="consent"
                  type="checkbox"
                  value="yes"
                  required
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={
                    errors.consent ? "catalog-consent-error" : undefined
                  }
                  onChange={() => clearFieldError("consent")}
                />
                <span>
                  I agree to share these details with SS Elevator for this
                  catalog request.
                </span>
              </label>
              {errors.consent && (
                <p className="field-error" id="catalog-consent-error">
                  {errors.consent}
                </p>
              )}
              <button className="btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending email..." : "Email me the download link"}
              </button>
              {status && (
                <div
                  className={`contact-status ${status.type}`}
                  role={status.type === "error" ? "alert" : "status"}
                  aria-live={status.type === "error" ? "assertive" : "polite"}
                  aria-atomic="true"
                >
                  <span className="contact-status-icon" aria-hidden="true">
                    {status.type === "success" ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8.5 12.5 2.5 2.5 5-5" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v5" />
                        <path d="M12 16h.01" />
                      </svg>
                    )}
                  </span>
                  <span className="contact-status-message">{status.message}</span>
                  <button
                    className="contact-status-close"
                    type="button"
                    aria-label="Dismiss catalog request notification"
                    onClick={() => setStatus(null)}
                  >
                    ×
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>
      )}
    </>
  );
}
