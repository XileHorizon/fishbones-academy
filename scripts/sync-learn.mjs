#!/usr/bin/env node
/// Build the Fishbones web variant from the upstream Fishbones repo and
/// stage the resulting `dist-web/` under `public/learn/`. Vite's `public/`
/// is copied verbatim into `dist/` at build, so the learn app ends up
/// at libre.academy/learn/ in production.
///
/// Resolution order for the Fishbones checkout:
///   1. $FISHBONES_SRC env var
///   2. ../../Apps/Fishbones (typical local layout: /Development/{Apps,Web})
///   3. ../Fishbones, ../../Fishbones (sibling fallbacks)
///
/// If the Fishbones source isn't found, we leave whatever's already in
/// `public/learn/` alone (or write a stub coming-soon page if the
/// directory is empty), and the marketing site still builds fine —
/// the /learn/ route just renders the stub instead of the real app.
///
/// Usage:
///   node scripts/sync-learn.mjs                # build + stage
///   node scripts/sync-learn.mjs --skip         # noop, fast exit
///   node scripts/sync-learn.mjs --use-existing # copy existing
///                                                dist-web/ without rebuilding
///   FISHBONES_SRC=/path/to/Fishbones node scripts/sync-learn.mjs

import { execSync } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const LEARN_DEST = join(SITE_ROOT, "public", "learn");

const args = new Set(process.argv.slice(2));

if (args.has("--skip")) {
  console.log("[sync-learn] --skip flag set, leaving public/learn/ as-is.");
  await ensureStubIfEmpty();
  process.exit(0);
}

const fishbonesRoot = resolveFishbonesRoot();

if (!fishbonesRoot) {
  console.warn("[sync-learn] Fishbones checkout not found at any of:");
  for (const p of [
    "$FISHBONES_SRC",
    "../../Apps/Fishbones",
    "../Fishbones",
    "../../Fishbones",
  ]) {
    console.warn(`  - ${p}`);
  }
  console.warn(
    "[sync-learn] writing the coming-soon stub to public/learn/ (set FISHBONES_SRC=… and re-run to embed the real build).",
  );
  await ensureStubIfEmpty();
  process.exit(0);
}

console.log(`[sync-learn] using Fishbones source at ${fishbonesRoot}`);

if (!args.has("--use-existing")) {
  // FISHBONES_BASE pins Fishbones' Vite `base` to /learn/ (the path
  // we mount the embed at on libre.academy). Without this,
  // Fishbones defaults to its legacy mattssoftware path
  // /fishbones/learn/, which produces asset URLs that 404 here
  // because nothing's served at that path on this host.
  console.log(
    "[sync-learn] running `npm run build:web` in Fishbones with base=/learn/…",
  );
  try {
    execSync("npm run build:web", {
      cwd: fishbonesRoot,
      stdio: "inherit",
      env: { ...process.env, FISHBONES_BASE: "/learn/" },
    });
  } catch (err) {
    console.error(
      "[sync-learn] Fishbones build failed:",
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  }
}

const fishbonesDist = join(fishbonesRoot, "dist-web");
if (!existsSync(fishbonesDist)) {
  console.error(
    `[sync-learn] expected Fishbones dist-web/ at ${fishbonesDist} but it's missing.`,
  );
  process.exit(1);
}

console.log(`[sync-learn] copying ${fishbonesDist} → ${LEARN_DEST}`);
await rm(LEARN_DEST, { recursive: true, force: true });
await mkdir(LEARN_DEST, { recursive: true });
await cp(fishbonesDist, LEARN_DEST, { recursive: true });
console.log("[sync-learn] done.");

function resolveFishbonesRoot() {
  const env = process.env.FISHBONES_SRC;
  if (env) {
    if (existsSync(join(env, "package.json"))) return env;
    console.error(
      `[sync-learn] FISHBONES_SRC=${env} doesn't look like a Fishbones checkout (no package.json).`,
    );
    process.exit(1);
  }
  const candidates = [
    resolve(SITE_ROOT, "..", "..", "Apps", "Fishbones"),
    resolve(SITE_ROOT, "..", "Fishbones"),
    resolve(SITE_ROOT, "..", "..", "Fishbones"),
  ];
  return candidates.find((p) => existsSync(join(p, "package.json")));
}

async function ensureStubIfEmpty() {
  let empty = !existsSync(LEARN_DEST);
  if (!empty) {
    try {
      empty = readdirSync(LEARN_DEST).length === 0;
    } catch {
      empty = true;
    }
  }
  if (!empty) return;

  await mkdir(LEARN_DEST, { recursive: true });
  await writeFile(
    join(LEARN_DEST, "index.html"),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Fishbones Web — coming soon</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0; url=/" />
    <style>
      body {
        background: #09090b; color: #fafafa;
        font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
        display: grid; place-items: center; min-height: 100vh; margin: 0;
        padding: 24px; text-align: center;
      }
      a { color: #fafafa; }
      h1 { font-size: 28px; letter-spacing: -0.02em; margin: 0 0 8px; font-weight: 800; }
      p { color: rgba(255,255,255,0.65); margin: 0 0 16px; max-width: 480px; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <h1>The browser app is being staged.</h1>
      <p>Run <code>npm run sync:learn</code> against a Fishbones checkout to embed the live build here. <a href="/">Back to libre.academy →</a></p>
    </main>
  </body>
</html>
`,
    "utf-8",
  );
  console.log(`[sync-learn] wrote stub to ${LEARN_DEST}/index.html`);
}
