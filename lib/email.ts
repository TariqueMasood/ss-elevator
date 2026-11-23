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
const EMAIL_BODY_FONT = "'DM Sans', Arial, Helvetica, sans-serif";
const EMAIL_HEADING_FONT =
  "'Plus Jakarta Sans', 'DM Sans', Arial, Helvetica, sans-serif";

/** Cached SMTP client and the config it was built from, kept in sync. */
let cachedTransporter:
  | { client: Transporter; config: SmtpConfig }
  | undefined;

function formatRequestedAt(value: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  const date = `${part("month")} ${part("day")}, ${part("weekday")}, ${part("year")}`;
  const time = `${part("hour")}:${part("minute")} ${part("dayPeriod")} ${part("timeZoneName")}`;
  return `${date} at ${time}`;
}

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
  if (cachedTransporter) return cachedTransporter;

  const config = smtpConfig();
  const client = nodemailer.createTransport({
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

  cachedTransporter = { client, config };
  return cachedTransporter;
}

/**
 * Verifies the SMTP connection using the configured credentials.
 * Call this once at server startup (e.g. in a Next.js instrumentation hook)
 * to surface misconfiguration in logs before any user request hits the email path.
 *
 * Example — create `instrumentation.ts` in the project root:
 *
 *   export async function register() {
 *     if (process.env.NEXT_RUNTIME === "nodejs") {
 *       const { verifySmtpConnection } = await import("@/lib/email");
 *       await verifySmtpConnection();
 *     }
 *   }
 */
export async function verifySmtpConnection(): Promise<void> {
  try {
    const { client } = getTransporter();
    await client.verify();
    console.log("[email] SMTP connection verified successfully.");
  } catch (error) {
    // Log the error clearly but don't crash the process — the app can still
    // serve pages; only form submissions will fail until SMTP is fixed.
    console.error(
      "[email] SMTP connection verification failed. Check SMTP_HOST, SMTP_PORT, SMTP_USERNAME and SMTP_PASSWORD in your environment.",
      error,
    );
  }
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

// ─── Design tokens (mirrors globals.css) ───────────────────────────────────
// Email clients cannot use CSS variables, so values are inlined here.
// Update these whenever the app palette changes.
const E = {
  // Surfaces
  pageBg:    "#f4f5fb",   // --color-bg
  altBg:     "#ecedf7",   // --color-bg-alt
  cardBg:    "#ffffff",   // --color-surface

  // Primary navy
  pri:       "#1e1b5e",   // --color-primary
  priMid:    "#2d2882",   // --color-primary-mid
  priLight:  "#3d35b5",   // --color-primary-light
  priPale:   "#ebebf8",   // --color-primary-pale

  // Accent gold
  acc:       "#d4891a",   // --color-accent
  accLight:  "#e9a84c",   // --color-accent-light
  accBright: "#f5c272",   // --color-accent-bright
  accPale:   "#fef5e7",   // --color-accent-pale

  // Text
  text:      "#16143d",   // --color-text
  muted:     "#56537a",   // --color-text-muted
  faint:     "#9693b8",   // --color-text-faint
  onPri:     "#ffffff",   // --on-primary
  onAcc:     "#1a1540",   // --on-accent

  // Hero (header band)
  heroStart: "#0d0b35",   // --hero-start
  heroMid:   "#1e1b5e",   // --hero-middle
  heroText:  "#dddaf5",   // --hero-text

  // Footer band
  footerText: "#ccc9ec",  // --footer-text
  footerLink: "#a8a4d8",  // --footer-link
  footerMut:  "#7a76aa",  // --footer-muted

  // Borders
  border:    "#d8d6ef",   // --color-border
};

function emailShell(preheader: string, content: string): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(SITE.name)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:${E.pageBg};font-family:${EMAIL_BODY_FONT};color:${E.text};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
         style="background:${E.pageBg};padding:40px 16px;">
    <tr><td align="center">

      <!-- Card shell: max 600px -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0"
             style="width:100%;max-width:600px;background:${E.cardBg};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(14,12,50,0.12);">

        <!-- ── Header band ───────────────────────────────── -->
        <tr>
          <td style="padding:0;background:linear-gradient(135deg,${E.heroStart} 0%,${E.heroMid} 100%);">
            <!--[if mso]><table role="presentation" width="100%"><tr><td style="padding:28px 36px;background:${E.heroMid};"><!
            [endif]-->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding:28px 36px;">
                  <!-- Brand name -->
                  <div style="font-family:${EMAIL_HEADING_FONT};font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:${E.accBright};">${escapeHtml(SITE.name)}</div>
                  <!-- Tagline -->
                  <div style="font-family:${EMAIL_BODY_FONT};font-size:13px;margin-top:4px;color:${E.heroText};opacity:0.85;">${escapeHtml(SITE.tagline)}</div>
                </td>
                <!-- Decorative gold accent bar on right -->
                <td width="6" style="background:linear-gradient(180deg,${E.accBright} 0%,${E.acc} 100%);width:6px;min-width:6px;"></td>
              </tr>
            </table>
            <!--[if mso]></td></tr></table><![endif]-->
          </td>
        </tr>

        <!-- ── Thin gold divider line ────────────────────── -->
        <tr>
          <td height="3" style="background:linear-gradient(90deg,${E.priLight},${E.accLight});height:3px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- ── Body content ──────────────────────────────── -->
        <tr>
          <td style="padding:40px 36px;background:${E.cardBg};">
            ${content}
          </td>
        </tr>

        <!-- ── Footer band ───────────────────────────────── -->
        <tr>
          <td style="padding:24px 36px;background:${E.altBg};border-top:1px solid ${E.border};">
            <p style="margin:0 0 4px;font-family:${EMAIL_HEADING_FONT};font-size:12px;font-weight:bold;color:${E.pri};letter-spacing:0.5px;">
              ${escapeHtml(SITE.name)} &nbsp;·&nbsp; ${escapeHtml(SITE.tagline)}
            </p>
            <p style="margin:0;font-family:${EMAIL_BODY_FONT};font-size:12px;color:${E.muted};line-height:1.6;">
              <a href="mailto:${escapeHtml(SITE.email)}" style="color:${E.priLight};text-decoration:none;">${escapeHtml(SITE.email)}</a>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <span style="color:${E.faint};">© ${year} ${escapeHtml(SITE.name)}. All rights reserved.</span>
            </p>
          </td>
        </tr>

      </table>
      <!-- /Card shell -->

    </td></tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`;
}

function emailTable(fields: Array<[string, string, boolean]>): string {
  const rows = fields
    .map(([label, value, highlighted]) => {
      const rowBg   = highlighted ? E.accPale  : E.cardBg;
      const labelCl = highlighted ? E.pri      : E.muted;
      const weight  = highlighted ? "bold"     : "normal";
      const valueCl = highlighted ? E.text     : E.text;
      return `<tr style="background:${rowBg};">
        <th align="left"
            style="width:34%;padding:8px 12px;border:1px solid ${E.border};
                   font-family:${EMAIL_BODY_FONT};font-size:12px;
                   line-height:1.4;
                   font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;
                   color:${labelCl};white-space:nowrap;">
          ${escapeHtml(label)}
        </th>
        <td style="padding:8px 12px;border:1px solid ${E.border};
                   font-family:${EMAIL_BODY_FONT};font-size:13px;
                   line-height:1.4;font-weight:${weight};color:${valueCl};
                   word-break:break-word;white-space:pre-wrap;">
          ${escapeHtml(value || NOT_AVAILABLE)}
        </td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;
                 border:1px solid ${E.border};">
    ${rows}
  </table>`;
}

// Reusable CTA button — gold gradient, pill shape, matches app .btn style
function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
    <tr>
      <td align="center"
          style="background:linear-gradient(145deg,${E.accLight},${E.acc});
                 border-radius:6px;
                 box-shadow:0 4px 16px rgba(212,137,26,0.35);">
        <a href="${href}"
           style="display:inline-block;padding:14px 32px;
                  font-family:${EMAIL_HEADING_FONT};font-size:15px;
                  font-weight:bold;letter-spacing:0.3px;
                  color:${E.onAcc};text-decoration:none;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

// Section heading used inside email body — matches app h2 style
function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 20px;font-family:${EMAIL_HEADING_FONT};
                     font-size:24px;line-height:1.2;font-weight:bold;
                     letter-spacing:-0.5px;color:${E.pri};">
    ${escapeHtml(text)}
  </h1>`;
}

function emailH2(text: string): string {
  return `<h2 style="margin:28px 0 12px;font-family:${EMAIL_HEADING_FONT};
                     font-size:16px;line-height:1.3;font-weight:bold;
                     color:${E.pri};border-bottom:2px solid ${E.accLight};
                     padding-bottom:8px;">
    ${escapeHtml(text)}
  </h2>`;
}

function emailBody(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${EMAIL_BODY_FONT};
                    font-size:15px;line-height:1.72;color:${E.text};">
    ${html}
  </p>`;
}

function emailMuted(html: string): string {
  return `<p style="margin:0 0 10px;font-family:${EMAIL_BODY_FONT};
                    font-size:13px;line-height:1.6;color:${E.muted};">
    ${html}
  </p>`;
}

function userDownloadHtml(name: string, downloadUrl: string): string {
  const safeName = escapeHtml(name);
  const safeUrl  = escapeHtml(downloadUrl);
  return emailShell(
    "Your requested SS Elevator catalog is ready to download.",
    `${emailHeading("Your catalog is ready")}
     ${emailBody(`Hello ${safeName},`)}
     ${emailBody("Thank you for downloading the SS Elevator components catalog. Your requested file is ready — click the button below to access it.")}
     ${emailButton(safeUrl, "Download Catalog")}
     ${emailMuted(`If the button does not work, copy and paste this link into your browser:`)}
     <p style="margin:0 0 24px;font-family:${EMAIL_BODY_FONT};font-size:12px;
               line-height:1.6;word-break:break-all;color:${E.priLight};">
       <a href="${safeUrl}" style="color:${E.priLight};text-decoration:underline;">${safeUrl}</a>
     </p>
     ${emailMuted(`Need help? Reply to this email or contact us at <a href="mailto:${escapeHtml(SITE.email)}" style="color:${E.priLight};text-decoration:none;">${escapeHtml(SITE.email)}</a>.`)}`,
  );
}

function ownerNotificationHtml(
  lead: DownloadLead,
  details: DownloadRequestDetails,
): string {
  const fields: Array<[string, string, boolean]> = [
    ["User Name",             lead.name,                           true],
    ["User Email",            lead.email,                          true],
    ["Company Name",          lead.company || NOT_AVAILABLE,       true],
    ["Date & Time (UTC)",     formatRequestedAt(details.requestedAt), false],
    ["Device Type",           details.deviceType,                  false],
    ["Download URL",          details.downloadUrl,                 false],
    ["Request ID",            details.requestId,                   false],
  ];

  return emailShell(
    `New catalog download request from ${lead.name}.`,
    `<!-- Alert badge -->
     <div style="display:inline-block;margin:0 0 20px;padding:6px 14px;
                 background:${E.priPale};border-radius:999px;
                 font-family:${EMAIL_BODY_FONT};font-size:11px;
                 font-weight:bold;letter-spacing:1px;text-transform:uppercase;
                 color:${E.priLight};">
       📥 &nbsp;New Download Request
     </div>
     ${emailHeading("Catalog Download Received")}
     ${emailMuted("A visitor has requested the SS Elevator components catalog. Their details are below.")}
     ${emailTable(fields)}`,
  );
}

function ownerContactHtml(
  submission: ContactSubmission,
  metadata: RequestMetadata,
): string {
  const fields: Array<[string, string, boolean]> = [
    ["Name",             submission.name,          true],
    ["Email",            submission.email,          true],
    ["Customer Type",    submission.customerType,   true],
    ["Message",          submission.message,        false],
    ["Date & Time (UTC)", formatRequestedAt(metadata.requestedAt), false],
    ["Device Type",      metadata.deviceType,       false],
    ["Request ID",       metadata.requestId,        false],
  ];

  return emailShell(
    `New website enquiry from ${submission.name}.`,
    `<!-- Alert badge -->
     <div style="display:inline-block;margin:0 0 20px;padding:6px 14px;
                 background:${E.priPale};border-radius:999px;
                 font-family:${EMAIL_BODY_FONT};font-size:11px;
                 font-weight:bold;letter-spacing:1px;text-transform:uppercase;
                 color:${E.priLight};">
       📩 &nbsp;New Contact Enquiry
     </div>
     ${emailHeading("New Enquiry via Website")}
     ${emailMuted("Someone submitted the contact form. Their message and details are below.")}
     ${emailTable(fields)}`,
  );
}

function customerAcknowledgementHtml(submission: ContactSubmission): string {
  const summaryFields: Array<[string, string, boolean]> = [
    ["Name",          submission.name,          false],
    ["Email",         submission.email,          false],
    ["Customer Type", submission.customerType,   false],
    ["Message",       submission.message,        false],
  ];

  return emailShell(
    "We have received your enquiry.",
    `${emailHeading("We've received your message")}
     ${emailBody(`Hello ${escapeHtml(submission.name)},`)}
     ${emailBody(`Thank you for contacting ${escapeHtml(SITE.name)}. Your enquiry has been received and our team will get back to you shortly.`)}
     ${emailH2("Your enquiry summary")}
     ${emailTable(summaryFields)}
     ${emailMuted("If you have any additional questions in the meantime, simply reply to this email.")}`,
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
    `Customer Type: ${submission.customerType}`,
    `Message: ${submission.message}`,
    `Date & Time (UTC): ${formatRequestedAt(metadata.requestedAt)}`,
    `Device Type: ${metadata.deviceType}`,
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
    `Date & Time (UTC): ${formatRequestedAt(details.requestedAt)}`,
    `Device Type: ${details.deviceType}`,
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
