import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import { SITE } from "@/lib/config";
import type { RequestMetadata } from "@/lib/request-metadata";

export interface DownloadLead {
  name: string;
  email: string;
  company: string;
}

export interface DownloadRequestDetails extends RequestMetadata {
  downloadUrl: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  customerType: string;
  message: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

const NOT_AVAILABLE = "Not Available";
let transporter: Transporter | undefined;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function smtpConfig(): SmtpConfig {
  const rawPort = process.env.SMTP_PORT?.trim();
  const port = rawPort ? Number(rawPort) : 587;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port.");
  }

  return {
    host: requiredEnv("SMTP_HOST"),
    port,
    username: requiredEnv("SMTP_USERNAME"),
    password: requiredEnv("SMTP_PASSWORD"),
  };
}

function getTransporter(): { client: Transporter; config: SmtpConfig } {
  const config = smtpConfig();
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      requireTLS: config.port !== 465,
      auth: {
        user: config.username,
        pass: config.password,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return { client: transporter, config };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function emailShell(preheader: string, content: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f3f6f7;font-family:Arial,Helvetica,sans-serif;color:#1c2d36;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6f7;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;">
          <tr><td style="padding:24px 32px;background:#123b4a;color:#ffffff;">
            <div style="font-size:12px;letter-spacing:2px;font-weight:bold;color:#f0b547;">${escapeHtml(SITE.name)}</div>
            <div style="font-size:14px;margin-top:5px;color:#e2edef;">${escapeHtml(SITE.tagline)}</div>
          </td></tr>
          <tr><td style="padding:32px;">${content}</td></tr>
          <tr><td style="padding:20px 32px;background:#f3f7f5;color:#61717a;font-size:12px;line-height:1.6;">
            ${escapeHtml(SITE.name)} · ${escapeHtml(SITE.tagline)}<br>
            <a href="mailto:${escapeHtml(SITE.email)}" style="color:#123b4a;">${escapeHtml(SITE.email)}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function emailTable(fields: Array<[string, string, boolean]>): string {
  const rows = fields
    .map(([label, value, highlighted]) => {
      const background = highlighted ? "#fff5dc" : "#ffffff";
      const weight = highlighted ? "bold" : "normal";
      return `<tr style="background:${background};">
        <th align="left" style="width:34%;padding:11px 12px;border:1px solid #d9e3e3;font-size:13px;color:#123b4a;">${escapeHtml(label)}</th>
        <td style="padding:11px 12px;border:1px solid #d9e3e3;font-size:13px;line-height:1.5;font-weight:${weight};word-break:break-word;white-space:pre-wrap;">${escapeHtml(value || NOT_AVAILABLE)}</td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">${rows}</table>`;
}

function userDownloadHtml(name: string, downloadUrl: string): string {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(downloadUrl);
  const year = new Date().getFullYear();
  return emailShell(
    "Your requested SS Elevator catalog is ready to download.",
    `<h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:#123b4a;">Your catalog is ready</h1>
     <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">Hello ${safeName},</p>
     <p style="font-size:16px;line-height:1.7;margin:0 0 24px;">Thank you for downloading the SS Elevator components catalog. The requested file is ready.</p>
     <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
       <tr><td align="center" bgcolor="#e4a52e" style="border-radius:24px;">
         <a href="${safeUrl}" style="display:inline-block;padding:14px 26px;color:#123b4a;text-decoration:none;font-weight:bold;font-size:15px;">Download File</a>
       </td></tr>
     </table>
     <p style="font-size:13px;line-height:1.6;color:#61717a;margin:0 0 6px;">If the button does not work, copy and paste this link:</p>
     <p style="font-size:13px;line-height:1.6;word-break:break-all;margin:0 0 24px;"><a href="${safeUrl}" style="color:#123b4a;">${safeUrl}</a></p>
     <p style="font-size:14px;line-height:1.7;margin:0 0 18px;">Need help? Contact us at <a href="mailto:${escapeHtml(SITE.email)}" style="color:#123b4a;">${escapeHtml(SITE.email)}</a>.</p>
     <p style="font-size:12px;color:#61717a;margin:0;">© ${year} ${escapeHtml(SITE.name)}. All rights reserved.</p>`,
  );
}

function ownerNotificationHtml(
  lead: DownloadLead,
  details: DownloadRequestDetails,
): string {
  const fields: Array<[string, string, boolean]> = [
    ["User Name", lead.name, true],
    ["User Email", lead.email, true],
    ["Company Name", lead.company || NOT_AVAILABLE, true],
    ["Date & Time (Server, UTC)", details.requestedAt, false],
    ["Browser", details.browser, false],
    ["Operating System", details.operatingSystem, false],
    ["Device Type", details.deviceType, false],
    ["User Agent", details.userAgent, false],
    ["IP Address", details.ipAddress, false],
    ["Referrer", details.referrer, false],
    ["Language", details.language, false],
    ["Requested Download URL", details.downloadUrl, false],
    ["Request ID", details.requestId, false],
  ];

  return emailShell(
    `New catalog download request from ${lead.name}.`,
    `<h1 style="margin:0 0 8px;font-size:23px;line-height:1.3;color:#123b4a;">New Download Request Received</h1>
     <p style="font-size:14px;line-height:1.6;color:#61717a;margin:0 0 20px;">A visitor requested the SS Elevator components catalog.</p>
     ${emailTable(fields)}`,
  );
}

function contactPhone(submission: ContactSubmission): string {
  if (!submission.phone) return "Not Provided";
  return `${submission.phone} (country code ${submission.phoneCountryCode})`;
}

function ownerContactHtml(
  submission: ContactSubmission,
  metadata: RequestMetadata,
): string {
  const fields: Array<[string, string, boolean]> = [
    ["Name", submission.name, true],
    ["Email", submission.email, true],
    ["Phone Number", contactPhone(submission), true],
    ["Customer Type", submission.customerType, true],
    ["Message", submission.message, false],
    ["Date & Time (Server, UTC)", metadata.requestedAt, false],
    ["Browser", metadata.browser, false],
    ["Operating System", metadata.operatingSystem, false],
    ["Device Type", metadata.deviceType, false],
    ["IP Address", metadata.ipAddress, false],
    ["User Agent", metadata.userAgent, false],
    ["Preferred Language", metadata.language, false],
    ["Referrer", metadata.referrer, false],
    ["Request ID", metadata.requestId, false],
  ];

  return emailShell(
    `New website enquiry from ${submission.name}.`,
    `<p style="margin:0 0 20px;font-size:18px;line-height:1.5;font-weight:bold;color:#123b4a;">📩 A new enquiry has been submitted through the website.</p>
     ${emailTable(fields)}`,
  );
}

function customerAcknowledgementHtml(submission: ContactSubmission): string {
  const summaryFields: Array<[string, string, boolean]> = [
    ["Name", submission.name, false],
    ["Email", submission.email, false],
    ...(submission.phone
      ? [["Phone Number", contactPhone(submission), false] as [string, string, boolean]]
      : []),
    ["Customer Type", submission.customerType, false],
    ["Message", submission.message, false],
  ];

  return emailShell(
    "We have received your enquiry.",
    `<h1 style="margin:0 0 18px;font-size:25px;line-height:1.25;color:#123b4a;">We've received your message</h1>
     <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">Hello ${escapeHtml(submission.name)},</p>
     <p style="font-size:15px;line-height:1.7;margin:0 0 12px;">Thank you for contacting ${escapeHtml(SITE.name)}. Your enquiry has been received successfully.</p>
     <p style="font-size:15px;line-height:1.7;margin:0 0 22px;">Our team will review your message and get back to you shortly.</p>
     <h2 style="margin:0 0 12px;font-size:17px;color:#123b4a;">Your enquiry summary</h2>
     ${emailTable(summaryFields)}
     <p style="font-size:13px;line-height:1.6;color:#61717a;margin:22px 0 0;">Support Team · © ${new Date().getFullYear()} ${escapeHtml(SITE.name)}</p>`,
  );
}

function ownerContactText(
  submission: ContactSubmission,
  metadata: RequestMetadata,
): string {
  return [
    "📩 A new enquiry has been submitted through the website.",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Phone Number: ${contactPhone(submission)}`,
    `Customer Type: ${submission.customerType}`,
    `Message: ${submission.message}`,
    `Date & Time (Server, UTC): ${metadata.requestedAt}`,
    `Browser: ${metadata.browser}`,
    `Operating System: ${metadata.operatingSystem}`,
    `Device Type: ${metadata.deviceType}`,
    `IP Address: ${metadata.ipAddress}`,
    `User Agent: ${metadata.userAgent}`,
    `Preferred Language: ${metadata.language}`,
    `Referrer: ${metadata.referrer}`,
    `Request ID: ${metadata.requestId}`,
  ].join("\n");
}

function customerAcknowledgementText(submission: ContactSubmission): string {
  return [
    `Hello ${submission.name},`,
    "",
    `Thank you for contacting ${SITE.name}. Your enquiry has been received successfully.`,
    "Our team will review your message and get back to you shortly.",
    "",
    "Your enquiry summary:",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    ...(submission.phone ? [`Phone Number: ${contactPhone(submission)}`] : []),
    `Customer Type: ${submission.customerType}`,
    `Message: ${submission.message}`,
    "",
    `Support Team · © ${new Date().getFullYear()} ${SITE.name}`,
    SITE.email,
  ].join("\n");
}

function userDownloadText(name: string, downloadUrl: string): string {
  return [
    `Hello ${name},`,
    "",
    "Thank you for downloading the SS Elevator components catalog. The requested file is ready.",
    "",
    `Download File: ${downloadUrl}`,
    "",
    `Support: ${SITE.email}`,
    `© ${new Date().getFullYear()} ${SITE.name}. All rights reserved.`,
  ].join("\n");
}

function ownerNotificationText(
  lead: DownloadLead,
  details: DownloadRequestDetails,
): string {
  return [
    "New Download Request Received",
    `User Name: ${lead.name}`,
    `User Email: ${lead.email}`,
    `Company Name: ${lead.company || NOT_AVAILABLE}`,
    `Date & Time (Server, UTC): ${details.requestedAt}`,
    `Browser: ${details.browser}`,
    `Operating System: ${details.operatingSystem}`,
    `Device Type: ${details.deviceType}`,
    `User Agent: ${details.userAgent}`,
    `IP Address: ${details.ipAddress}`,
    `Referrer: ${details.referrer}`,
    `Language: ${details.language}`,
    `Requested Download URL: ${details.downloadUrl}`,
    `Request ID: ${details.requestId}`,
  ].join("\n");
}

async function sendEmail(
  message: Parameters<Transporter["sendMail"]>[0],
): Promise<void> {
  const { client, config } = getTransporter();
  await client.sendMail({
    from: { name: SITE.name, address: config.username },
    ...message,
  });
}

export async function sendUserDownloadEmail(
  lead: DownloadLead,
  downloadUrl: string,
): Promise<void> {
  await sendEmail({
    to: lead.email,
    subject: "Your Download is Ready",
    html: userDownloadHtml(lead.name, downloadUrl),
    text: userDownloadText(lead.name, downloadUrl),
  });
}

export async function sendOwnerNotificationEmail(
  lead: DownloadLead,
  details: DownloadRequestDetails,
): Promise<void> {
  await sendEmail({
    to: requiredEnv("OWNER_EMAIL"),
    replyTo: lead.email,
    subject: "New Download Request Received",
    html: ownerNotificationHtml(lead, details),
    text: ownerNotificationText(lead, details),
  });
}

export async function sendOwnerContactEmail(
  submission: ContactSubmission,
  metadata: RequestMetadata,
): Promise<void> {
  await sendEmail({
    to: requiredEnv("OWNER_EMAIL"),
    replyTo: submission.email,
    subject: "New Contact Form Submission",
    html: ownerContactHtml(submission, metadata),
    text: ownerContactText(submission, metadata),
  });
}

export async function sendCustomerAcknowledgementEmail(
  submission: ContactSubmission,
): Promise<void> {
  await sendEmail({
    to: submission.email,
    subject: "We've Received Your Message",
    html: customerAcknowledgementHtml(submission),
    text: customerAcknowledgementText(submission),
  });
}
