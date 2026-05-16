#!/usr/bin/env node
/// Mirror kata's `public/starter-courses/` into our own `public/`.
/// The course detail page hydrates a sample lesson from
/// /starter-courses/<id>.json at runtime, so we need the JSON files in
/// our deploy. Bundling them into the JS chunk would inflate the
/// homepage payload by ~5MB; serving them as static files lets the
/// browser cache + lazy-fetch on detail page open.
///
/// Idempotent. Skips silently if the kata checkout isn't around.

import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const DEST = join(SITE_ROOT, "public", "starter-courses");
/// Bundled-into-JS catalog manifest. The /courses page imports this at
/// build time so the grid renders without an extra fetch. Keep it in
/// lockstep with the runtime manifest in public/ — otherwise covers,
/// new packs, or sizeBytes drift between the two.
const BUNDLED_MANIFEST = join(SITE_ROOT, "src", "data", "courses-manifest.json");

// Env override — accept both the new `LIBRE_SRC` and legacy
// `FISHBONES_SRC` names so existing CI keeps working.
const env = process.env.LIBRE_SRC ?? process.env.FISHBONES_SRC;
// The app repo went through two renames: kata → Fishbones →
// Libre.academy. Each fallback rung covers checkouts that haven't
// caught up yet.
const candidates = [
  ...(env ? [env] : []),
  resolve(SITE_ROOT, "..", "..", "Apps", "Libre.academy"),
  resolve(SITE_ROOT, "..", "Libre.academy"),
  resolve(SITE_ROOT, "..", "..", "Apps", "Fishbones"),
  resolve(SITE_ROOT, "..", "Fishbones"),
  resolve(SITE_ROOT, "..", "..", "Apps", "kata"),
  resolve(SITE_ROOT, "..", "kata"),
  resolve(SITE_ROOT, "..", "..", "kata"),
];
const fishbonesRoot = candidates.find((p) => existsSync(join(p, "package.json")));

if (!fishbonesRoot) {
  console.warn(
    "[sync-courses] Fishbones checkout not found — skipping. Course detail pages will show the 'preview unavailable' state until starter-courses are staged.",
  );
  process.exit(0);
}

const src = join(fishbonesRoot, "public", "starter-courses");
if (!existsSync(src)) {
  console.warn(
    `[sync-courses] Fishbones starter-courses missing at ${src}. Run \`node scripts/extract-starter-courses.mjs\` over there first.`,
  );
  process.exit(0);
}

console.log(`[sync-courses] copying ${src} → ${DEST}`);
await rm(DEST, { recursive: true, force: true });
await mkdir(DEST, { recursive: true });
await cp(src, DEST, { recursive: true });

// Keep the bundled manifest (imported by src/data/courses.ts at build
// time) byte-identical to the runtime one. Without this the catalog
// grid renders with whatever stale snapshot was last committed —
// missing covers, missing courses, drifted sizeBytes — even after
// the runtime files in /starter-courses/ get fresh.
const srcManifest = join(src, "manifest.json");
if (existsSync(srcManifest)) {
  await copyFile(srcManifest, BUNDLED_MANIFEST);
  console.log(`[sync-courses] bundled manifest updated → ${BUNDLED_MANIFEST}`);
} else {
  console.warn(
    `[sync-courses] no manifest.json at ${srcManifest}; bundled manifest left as-is`,
  );
}

console.log("[sync-courses] done.");
