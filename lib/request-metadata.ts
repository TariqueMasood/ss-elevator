import { randomUUID } from "node:crypto";

export interface RequestMetadata {
  requestId: string;
  requestedAt: string;
  browser: string;
  operatingSystem: string;
  deviceType: string;
  userAgent: string;
  language: string;
  ipAddress: string;
  referrer: string;
}

function headerValue(request: Request, name: string, maxLength = 1000): string {
  return request.headers.get(name)?.trim().slice(0, maxLength) || "Not Available";
}

function detectBrowser(userAgent: string): string {
  if (userAgent === "Not Available") return userAgent;
  if (/EdgA?\/|EdgiOS\//i.test(userAgent)) return "Microsoft Edge";
  if (/OPR\/|Opera/i.test(userAgent)) return "Opera";
  if (/SamsungBrowser\//i.test(userAgent)) return "Samsung Internet";
  if (/CriOS\/|Chrome\//i.test(userAgent)) return "Google Chrome";
  if (/FxiOS\/|Firefox\//i.test(userAgent)) return "Mozilla Firefox";
  if (/Safari\//i.test(userAgent)) return "Apple Safari";
  return "Not Available";
}

function detectOperatingSystem(userAgent: string): string {
  if (userAgent === "Not Available") return userAgent;
  if (/Windows NT/i.test(userAgent)) return "Windows";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Mac OS X|Macintosh/i.test(userAgent)) return "macOS";
  if (/CrOS/i.test(userAgent)) return "Chrome OS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Not Available";
}

function detectDeviceType(userAgent: string): string {
  if (userAgent === "Not Available") return userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) return "Tablet";
  if (/Android/i.test(userAgent)) {
    return /Mobile/i.test(userAgent) ? "Mobile" : "Tablet";
  }
  if (/Mobile|iPhone|iPod/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function clientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (realIp || forwardedIp || "Not Available").slice(0, 128);
}

export function collectRequestMetadata(request: Request): RequestMetadata {
  const userAgent = headerValue(request, "user-agent");
  return {
    requestId: randomUUID(),
    requestedAt: new Date().toISOString(),
    browser: detectBrowser(userAgent),
    operatingSystem: detectOperatingSystem(userAgent),
    deviceType: detectDeviceType(userAgent),
    userAgent,
    language: headerValue(request, "accept-language", 256),
    ipAddress: clientIp(request),
    referrer: headerValue(request, "referer", 2048),
  };
}
