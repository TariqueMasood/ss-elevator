import { readFile } from "node:fs/promises";
import { join } from "node:path";

export function readCatalogPdf(): Promise<Buffer> {
  return readFile(join(process.cwd(), "private", "ss-elevator-components.pdf"));
}
