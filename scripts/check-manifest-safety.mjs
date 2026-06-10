#!/usr/bin/env node
/// Pre-rsync guard: refuse to publish a starter-courses manifest
/// that would make live courses disappear.
///
/// Why this exists: dist/ is rsync'd to the VPS with `--delete`, so
/// whatever manifest the build produced REPLACES the live one
/// wholesale. Twice (2026-06-10) a full deploy shipped a manifest
/// regenerated from a local checkout that lagged behind surgical
/// fixes made directly on the VPS — live courses vanished along with
/// their JSON + cover files. This script diffs the about-to-deploy
/// manifest against the live one and fails the deploy when:
///
///   - dist/starter-courses/manifest.json is missing entirely
///     (rsync --delete would wipe the whole catalog), or
///   - any pack id present live is absent from the new manifest, or
///   - the manifest `version` field would regress.
///
/// Intentional removals: pass --allow-course-removal (or set
/// LIBRE_ALLOW_COURSE_REMOVAL=1) — and prune the ids from
/// Apps/Libre.academy/scripts/published-courses.json so the next
/// regen agrees.
///
/// If the live manifest can't be fetched (site down, first deploy)
/// we warn and let the deploy proceed — blocking on an unreachable
/// site would make the deploy that fixes it impossible.
///
/// Used by scripts/deploy.mjs AND .github/workflows/deploy.yml
/// (keep both call sites in lockstep).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");

const LIVE_MANIFEST_URL =
  process.env.LIBRE_LIVE_MANIFEST_URL ??
  "https://libre.academy/starter-courses/manifest.json";

const allowRemoval =
  process.argv.includes("--allow-course-removal") ||
  process.env.LIBRE_ALLOW_COURSE_REMOVAL === "1";

function fail(lines) {
  for (const line of lines) console.error(`[manifest-guard] ${line}`);
  if (allowRemoval) {
    console.error(
      "[manifest-guard] --allow-course-removal set — proceeding anyway.",
    );
    return;
  }
  console.error(
    "[manifest-guard] deploy REFUSED. If the removal is intentional, prune the",
  );
  console.error(
    "[manifest-guard] ids from Apps/Libre.academy/scripts/published-courses.json",
  );
  console.error(
    "[manifest-guard] and re-deploy with --allow-course-removal.",
  );
  process.exit(1);
}

// ── The manifest we're about to publish ─────────────────────────
const distManifestPath = join(
  SITE_ROOT,
  "dist",
  "starter-courses",
  "manifest.json",
);
if (!existsSync(distManifestPath)) {
  fail([
    `no manifest at ${distManifestPath} —`,
    "rsync --delete would wipe the entire live starter-courses catalog.",
    "Run the full build (npm run deploy without --rsync-only) first.",
  ]);
  process.exit(0); // only reached with --allow-course-removal
}
let next = null;
try {
  next = JSON.parse(readFileSync(distManifestPath, "utf-8"));
} catch (err) {
  fail([
    `dist manifest unparseable: ${err instanceof Error ? err.message : err}`,
  ]);
  process.exit(0); // only reached with --allow-course-removal
}

// ── The manifest currently live ──────────────────────────────────
let live = null;
try {
  const res = await fetch(LIVE_MANIFEST_URL, {
    signal: AbortSignal.timeout(15_000),
    headers: { "cache-control": "no-cache" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  live = await res.json();
} catch (err) {
  console.warn(
    `[manifest-guard] could not fetch live manifest (${err instanceof Error ? err.message : err}) — ` +
      "skipping the disappearing-course check. (Site down or first deploy?)",
  );
}

if (live && next) {
  const idOf = (c) => c.packId ?? c.id;
  const liveIds = new Set((live.courses ?? []).map(idOf));
  const nextIds = new Set((next.courses ?? []).map(idOf));
  const disappearing = [...liveIds].filter((id) => !nextIds.has(id)).sort();
  const appearing = [...nextIds].filter((id) => !liveIds.has(id)).sort();

  console.log(
    `[manifest-guard] live: v${live.version} ${liveIds.size} courses → ` +
      `deploying: v${next.version} ${nextIds.size} courses` +
      (appearing.length ? ` (+${appearing.length} new: ${appearing.join(", ")})` : ""),
  );

  const problems = [];
  if (disappearing.length > 0) {
    problems.push(
      `${disappearing.length} live course(s) would DISAPPEAR from the catalog:`,
      ...disappearing.map((id) => `  - ${id}`),
      "Likely cause: the local Apps/Libre.academy checkout is missing archives",
      "that were added to the live site (or to published-courses.json) elsewhere.",
    );
  }
  if (
    typeof live.version === "number" &&
    typeof next.version === "number" &&
    next.version < live.version
  ) {
    problems.push(
      `manifest version would REGRESS: live v${live.version} → v${next.version}.`,
      "Bump manifestVersion in Apps/Libre.academy/scripts/published-courses.json.",
    );
  }
  if (problems.length > 0) fail(problems);
}

console.log("[manifest-guard] OK — no live courses disappear.");
