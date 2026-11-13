import { NextResponse } from "next/server";
import { Resend } from "resend";
import { SITE } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const name = typeof body.name === "string"
    ? body.name.trim().replace(/\s+/g, " ")
    : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string"
    ? body.company.trim().replace(/\s+/g, " ")
    : "";
  const website = typeof body.website === "string" ? body.website.trim() : "";

  if (website) {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }
  if (
    !name ||
    name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    company.length > 160 ||
    body.consent !== "yes"
  ) {
    return NextResponse.json(
      { error: "Please provide valid details and agree to the notice." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("RESEND_API_KEY or RESEND_FROM_EMAIL is not configured.");
    return NextResponse.json(
      { error: "Catalog downloads are temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from,
      to: process.env.CATALOG_NOTIFICATION_EMAIL || SITE.email,
      replyTo: email,
      subject: "Catalog PDF download request",
      text: [
        "A visitor requested the SS Elevator components catalog.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || "Not provided"}`,
        `Requested at: ${new Date().toISOString()}`,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend rejected the catalog notification:", error);
      return NextResponse.json(
        { error: "We could not process your request. Please try again later." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Failed to send the catalog notification:", error);
    return NextResponse.json(
      { error: "We could not process your request. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
