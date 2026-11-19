"use client";

import { useState, type FormEvent } from "react";
import { SITE } from "@/lib/config";

const CUSTOMER_TYPES = ["Customer", "Supplier", "Career"] as const;
type CustomerType = (typeof CUSTOMER_TYPES)[number];
type FormField = "name" | "email" | "customerType" | "message";
type ContactForm = {
  name: string;
  email: string;
  customerType: CustomerType | "";
  message: string;
};
type FormErrors = Partial<Record<FormField, string>>;
type FormStatus = { type: "success" | "error"; message: string } | null;

const INITIAL_FORM: ContactForm = {
  name: "",
  email: "",
  customerType: "Customer",
  message: "",
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isCustomerType(value: string): value is CustomerType {
  return CUSTOMER_TYPES.some((customerType) => customerType === value);
}

function validateForm(form: ContactForm): FormErrors {
  const errors: FormErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const message = form.message.trim();

  if (!name) errors.name = "Please enter your name.";
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!isCustomerType(form.customerType)) {
    errors.customerType = "Please select a customer type.";
  }
  if (!message) errors.message = "Please enter your message.";
  return errors;
}

function isApiError(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

function isApiSuccess(
  value: unknown,
): value is { success: true; message?: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === true &&
    (!("message" in value) || typeof value.message === "string")
  );
}

export default function Contact() {
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof ContactForm>(
    field: K,
    value: ContactForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setStatus(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    setStatus(null);
    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Please correct the highlighted fields before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          customerType: form.customerType,
          message: form.message.trim(),
        }),
      });

      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          isApiError(result)
            ? result.error
            : "We could not submit your enquiry. Please try again.",
        );
      }

      if (!isApiSuccess(result)) {
        throw new Error(
          "We could not confirm that your enquiry was submitted. Please try again.",
        );
      }

      setForm(INITIAL_FORM);
      setErrors({});
      setStatus({
        type: "success",
        message: result.message
          ?? "Your enquiry was sent successfully. Our team will get back to you shortly.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof TypeError
            ? "We could not connect to the server. Check your internet connection and try again."
            : error instanceof Error
              ? error.message
              : "We could not submit your enquiry. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="alt" id="contact">
      <div className="w two">
        <div data-reveal>
          <h2>Get in Touch</h2>
          <p className="sub">
            Send us your enquiry and our team will be in touch.
          </p>
          <div className="contact-details">
            <p>
              <b>Phone</b>
              <a href={`tel:+${SITE.phone}`}>{SITE.phoneDisplay}</a>
            </p>
            <p>
              <b>Email</b>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            <p>
              <b>Address</b>
              <span>{SITE.address}</span>
            </p>
          </div>
        </div>
        <div className="card" data-reveal>
          <form className="contact-form" noValidate onSubmit={submit}>
            <div className="contact-field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                autoComplete="name"
                maxLength={120}
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
              />
              {errors.name && (
                <p className="field-error" id="contact-name-error">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "contact-email-error" : undefined
                }
              />
              {errors.email && (
                <p className="field-error" id="contact-email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="contact-field">
              <label htmlFor="contact-customer-type">Customer Type</label>
              <select
                id="contact-customer-type"
                name="customerType"
                required
                value={form.customerType}
                onChange={(event) => {
                  if (isCustomerType(event.target.value)) {
                    updateField("customerType", event.target.value);
                  }
                }}
                aria-invalid={Boolean(errors.customerType)}
                aria-describedby={
                  errors.customerType
                    ? "contact-customer-type-error"
                    : undefined
                }
              >
                {CUSTOMER_TYPES.map((customerType) => (
                  <option key={customerType} value={customerType}>
                    {customerType}
                  </option>
                ))}
              </select>
              {errors.customerType && (
                <p className="field-error" id="contact-customer-type-error">
                  {errors.customerType}
                </p>
              )}
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                maxLength={4000}
                required
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={
                  errors.message ? "contact-message-error" : undefined
                }
              />
              {errors.message && (
                <p className="field-error" id="contact-message-error">
                  {errors.message}
                </p>
              )}
            </div>

            <button className="btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
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
                  aria-label="Dismiss contact form notification"
                  onClick={() => setStatus(null)}
                >
                  ×
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
