import { NextResponse } from "next/server";
import {
  sendOwnerNotificationEmail,
  sendUserDownloadEmail,
  type DownloadLead,
  type DownloadRequestDetails,
} from "@/lib/email";
import { SITE } from "@/lib/config";
import { collectRequestMetadata } from "@/lib/request-metadata";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const lead: DownloadLead = {
    name: cleanText(payload.name, 120),
    email: typeof payload.email === "string" ? payload.email.trim() : "",
    company: cleanText(payload.company, 160),
  };
  const website = cleanText(payload.website, 200);

  if (website) {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }
  if (
    !lead.name ||
    !EMAIL_PATTERN.test(lead.email) ||
    lead.email.length > 254 ||
    payload.consent !== "yes"
  ) {
    return NextResponse.json(
      { error: "Please provide valid details and agree to the notice." },
      { status: 400 },
    );
  }

  const details = collectRequestMetadata(request);
  const downloadUrl = new URL(
    "/ss-elevator-components.pdf",
    SITE.web,
  ).toString();
  const requestInfo: DownloadRequestDetails = { ...details, downloadUrl };

  const notifications = await Promise.allSettled([
    sendUserDownloadEmail(lead, downloadUrl),
    sendOwnerNotificationEmail(lead, requestInfo),
  ]);

  const [userEmailResult, ownerEmailResult] = notifications;
  if (userEmailResult.status === "rejected") {
    console.error(
      `Failed to send user download email for request ${details.requestId}:`,
      userEmailResult.reason,
    );
    return NextResponse.json(
      { error: "We could not email your download link. Please try again later." },
      { status: 502 },
    );
  }
  if (ownerEmailResult.status === "rejected") {
    console.error(
      `Failed to send owner notification for request ${details.requestId}:`,
      ownerEmailResult.reason,
    );
  }

  return NextResponse.json({ success: true });
}
