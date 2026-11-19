import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// This program ships the front-page image held in the repository.
// It reads entry.png next to this file and writes the exact same
// bytes to the output directory, so every run is deterministic.

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.png");
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const targetPath = join(outputDir, "entry.png");

const bytes = await readFile(sourcePath);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(pngMagic)) {
  throw new Error("entry.png does not start with the PNG signature");
}
if (bytes.length > 1024 * 1024) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}
await mkdir(outputDir, { recursive: true });
await writeFile(targetPath, bytes);
const written = await readFile(targetPath);
if (!written.equals(bytes)) {
  throw new Error("output does not match entry.png byte for byte");
}
console.log(`wrote ${bytes.length} bytes to ${targetPath}`);
