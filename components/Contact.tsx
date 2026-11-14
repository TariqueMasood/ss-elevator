"use client";

import { useState, type FormEvent } from "react";
import PhoneInput, {
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import { SITE } from "@/lib/config";

const CUSTOMER_TYPES = ["Customer", "Supplier", "Career"] as const;
type CustomerType = (typeof CUSTOMER_TYPES)[number];
type FormField = "name" | "email" | "customerType" | "message" | "phone";
type ContactForm = {
  name: string;
  email: string;
  customerType: CustomerType | "";
  message: string;
  phone: string;
};
type FormErrors = Partial<Record<FormField, string>>;
type FormStatus = { type: "success" | "error"; message: string } | null;

const INITIAL_FORM: ContactForm = {
  name: "",
  email: "",
  customerType: "Customer",
  message: "",
  phone: "",
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;

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
  if (message.length < MIN_MESSAGE_LENGTH) {
    errors.message = `Please enter at least ${MIN_MESSAGE_LENGTH} characters.`;
  }
  if (form.phone && !isValidPhoneNumber(form.phone)) {
    errors.phone = "Please enter a valid international phone number.";
  }

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
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const parsedPhone = form.phone ? parsePhoneNumber(form.phone) : undefined;
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          customerType: form.customerType,
          message: form.message.trim(),
          phone: form.phone,
          phoneCountryCode: parsedPhone
            ? `+${parsedPhone.countryCallingCode}`
            : "",
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

      setForm(INITIAL_FORM);
      setErrors({});
      setStatus({
        type: "success",
        message:
          "Thank you for contacting us. Your enquiry has been submitted successfully. Our team will get back to you shortly.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
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
        <div>
          <h2>Get in Touch</h2>
          <p className="sub">
            Send us your enquiry and our team will be in touch.
          </p>
          <p>
            <b>Phone:</b> <a href={`tel:+${SITE.phone}`}>{SITE.phoneDisplay}</a>
          </p>
          <p>
            <b>Email:</b> <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
          <p>
            <b>Web:</b>{" "}
            <a href={SITE.web} target="_blank" rel="noopener noreferrer">
              {SITE.web}
            </a>
          </p>
          <p>
            <b>Address:</b> {SITE.address}
          </p>
        </div>
        <div className="card">
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
              <label htmlFor="contact-phone">Phone Number (optional)</label>
              <PhoneInput
                id="contact-phone"
                name="phone"
                className="phone-input"
                international
                defaultCountry="IN"
                countryCallingCodeEditable={false}
                value={form.phone || undefined}
                onChange={(value) => updateField("phone", value || "")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={
                  errors.phone ? "contact-phone-error" : undefined
                }
              />
              {errors.phone && (
                <p className="field-error" id="contact-phone-error">
                  {errors.phone}
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

            <button className="btn whatsapp" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            {status && (
              <p
                className={`contact-status ${status.type}`}
                role={status.type === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {status.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
