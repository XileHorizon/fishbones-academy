#!/usr/bin/env node
/// Mirror kata's `public/starter-courses/` into our own `public/`.
/// The course detail page hydrates a sample lesson from
/// /starter-courses/<id>.json at runtime, so we need the JSON files in
/// our deploy. Bundling them into the JS chunk would inflate the
/// homepage payload by ~5MB; serving them as static files lets the
/// browser cache + lazy-fetch on detail page open.
///
/// Idempotent. Skips silently if the kata checkout isn't around.

import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const DEST = join(SITE_ROOT, "public", "starter-courses");

const env = process.env.FISHBONES_SRC;
const candidates = [
  ...(env ? [env] : []),
  resolve(SITE_ROOT, "..", "..", "Apps", "kata"),
  resolve(SITE_ROOT, "..", "kata"),
  resolve(SITE_ROOT, "..", "..", "kata"),
];
const kataRoot = candidates.find((p) => existsSync(join(p, "package.json")));

if (!kataRoot) {
  console.warn(
    "[sync-courses] kata checkout not found — skipping. Course detail pages will show the 'preview unavailable' state until starter-courses are staged.",
  );
  process.exit(0);
}

const src = join(kataRoot, "public", "starter-courses");
if (!existsSync(src)) {
  console.warn(
    `[sync-courses] kata starter-courses missing at ${src}. Run \`node scripts/extract-starter-courses.mjs\` over there first.`,
  );
  process.exit(0);
}

console.log(`[sync-courses] copying ${src} → ${DEST}`);
await rm(DEST, { recursive: true, force: true });
await mkdir(DEST, { recursive: true });
await cp(src, DEST, { recursive: true });
console.log("[sync-courses] done.");
