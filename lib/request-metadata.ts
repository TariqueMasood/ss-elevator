import { randomUUID } from "node:crypto";

export interface RequestMetadata {
  requestId: string;
  requestedAt: string;
  deviceType: string;
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

export function collectRequestMetadata(request: Request): RequestMetadata {
  const userAgent =
    request.headers.get("user-agent")?.trim().slice(0, 1000) || "Not Available";
  return {
    requestId: randomUUID(),
    requestedAt: new Date().toISOString(),
    deviceType: detectDeviceType(userAgent),
  };
}
