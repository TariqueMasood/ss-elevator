import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
const TOKEN_PATTERN = /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/;

interface CatalogDownloadPayload {
  expiresAt: number;
  nonce: string;
}

function getSigningSecret(): Buffer {
  const secret = process.env.CATALOG_DOWNLOAD_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(
      "CATALOG_DOWNLOAD_SECRET must be configured with at least 32 bytes.",
    );
  }

  return Buffer.from(secret, "utf8");
}

export function createCatalogDownloadToken(): string {
  const payload: CatalogDownloadPayload = {
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload).toString()).toString(
    "base64url",
  );
  const signature = createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyCatalogDownloadToken(
  token: string | null,
): boolean {
  if (!token || token.length > 1024) return false;

  const match = TOKEN_PATTERN.exec(token);
  if (!match) return false;

  const [, encodedPayload, encodedSignature] = match;
  const expectedSignature = createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest();
  const providedSignature = Buffer.from(encodedSignature, "base64url");

  if (
    providedSignature.length !== expectedSignature.length ||
    providedSignature.toString("base64url") !== encodedSignature ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return false;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch {
    return false;
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("expiresAt" in payload) ||
    !("nonce" in payload) ||
    typeof payload.expiresAt !== "number" ||
    !Number.isInteger(payload.expiresAt) ||
    typeof payload.nonce !== "string" ||
    !/^[A-Za-z0-9_-]{22}$/.test(payload.nonce)
  ) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return (
    payload.expiresAt > now &&
    payload.expiresAt <= now + TOKEN_LIFETIME_SECONDS + 60
  );
}
