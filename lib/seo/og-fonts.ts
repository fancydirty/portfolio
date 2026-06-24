import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Load the Geist fonts used by the OG cards as an `ImageResponse` `fonts` array.
 * Files live in `assets/fonts/` (copied from the `geist` package) so they are
 * bundled into the serverless function; `process.cwd()` is the project root.
 */
export async function loadOgFonts() {
  const dir = join(process.cwd(), "assets", "fonts");
  const [black, medium, mono] = await Promise.all([
    readFile(join(dir, "Geist-Black.ttf")),
    readFile(join(dir, "Geist-Medium.ttf")),
    readFile(join(dir, "GeistMono-Regular.ttf")),
  ]);
  return [
    { name: "Geist", data: black, weight: 900 as const, style: "normal" as const },
    { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
    {
      name: "Geist Mono",
      data: mono,
      weight: 400 as const,
      style: "normal" as const,
    },
  ];
}
