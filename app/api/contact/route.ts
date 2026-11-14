import { NextResponse } from "next/server";
import {
  isValidPhoneNumber,
  parsePhoneNumber,
} from "libphonenumber-js/min";
import {
  sendCustomerAcknowledgementEmail,
  sendOwnerContactEmail,
  type ContactSubmission,
} from "@/lib/email";
import { collectRequestMetadata } from "@/lib/request-metadata";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CUSTOMER_TYPES = ["Customer", "Supplier", "Career"] as const;
type CustomerType = (typeof CUSTOMER_TYPES)[number];
const MIN_MESSAGE_LENGTH = 10;

function isCustomerType(value: unknown): value is CustomerType {
  return (
    typeof value === "string" &&
    CUSTOMER_TYPES.some((customerType) => customerType === value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  if (!isRecord(payload)) {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const name = cleanText(payload.name, 120);
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const phoneCountryCode = cleanText(payload.phoneCountryCode, 5);
  const customerType = payload.customerType;

  if (
    !name ||
    !EMAIL_PATTERN.test(email) ||
    email.length > 254 ||
    !isCustomerType(customerType) ||
    message.length < MIN_MESSAGE_LENGTH ||
    message.length > 4000 ||
    (payload.phone !== undefined && typeof payload.phone !== "string")
  ) {
    return NextResponse.json(
      { error: "Please check your name, email, customer type, and message." },
      { status: 400 },
    );
  }

  let normalizedPhone = "";
  let normalizedPhoneCountryCode = "";
  if (phone) {
    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid international phone number." },
        { status: 400 },
      );
    }

    const parsedPhone = parsePhoneNumber(phone);
    if (!parsedPhone) {
      return NextResponse.json(
        { error: "Please enter a valid international phone number." },
        { status: 400 },
      );
    }
    normalizedPhone = parsedPhone.number;
    normalizedPhoneCountryCode = `+${parsedPhone.countryCallingCode}`;

    if (
      !/^\+\d{1,4}$/.test(phoneCountryCode) ||
      phoneCountryCode !== normalizedPhoneCountryCode
    ) {
      return NextResponse.json(
        { error: "Please select a valid country code for your phone number." },
        { status: 400 },
      );
    }
  }

  const submission: ContactSubmission = {
    name,
    email,
    phone: normalizedPhone,
    phoneCountryCode: normalizedPhoneCountryCode,
    customerType,
    message,
  };
  const metadata = collectRequestMetadata(request);

  const results = await Promise.allSettled([
    sendOwnerContactEmail(submission, metadata),
    sendCustomerAcknowledgementEmail(submission),
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const emailType = index === 0 ? "owner contact notification" : "customer acknowledgement";
      console.error(
        `Failed to send ${emailType} for request ${metadata.requestId}:`,
        result.reason,
      );
    }
  });

  return NextResponse.json({ success: true });
}
