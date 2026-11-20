import { NextResponse } from "next/server";
import { verifyCatalogDownloadToken } from "@/lib/catalog-download-token";
import { readCatalogPdf } from "@/lib/catalog-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  let isValid: boolean;
  try {
    isValid = verifyCatalogDownloadToken(
      new URL(request.url).searchParams.get("token"),
    );
  } catch (error) {
    console.error("Could not verify catalog download link:", error);
    return NextResponse.json(
      { error: "Catalog downloads are temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!isValid) {
    return NextResponse.json(
      { error: "This download link is invalid or has expired." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const pdf = await readCatalogPdf();
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="ss-elevator-components.pdf"',
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Could not read the catalog PDF:", error);
    return NextResponse.json(
      { error: "The catalog is temporarily unavailable." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
