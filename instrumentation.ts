/**
 * Next.js instrumentation hook — runs once when the server process starts.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Used here to verify the SMTP connection at startup so misconfiguration
 * appears in deployment logs immediately rather than surfacing as a 502
 * when a user submits the contact or catalog form.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { verifySmtpConnection } = await import("@/lib/email");
    await verifySmtpConnection();
  }
}
