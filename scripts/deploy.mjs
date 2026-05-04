#!/usr/bin/env node
/// One-shot deploy of fishbones.academy.
///
/// Stitches together every step the live site depends on so a tier
/// bump or course-content change goes from "edited a file" → live in
/// one command:
///
///   1. sync:learn       — rebuild Fishbones with FISHBONES_BASE=/learn/
///                         and stage dist-web/ under public/learn/.
///                         The Fishbones build runs the
///                         extract-starter-courses script as part of
///                         build:web, so the manifest is regenerated
///                         from current course-tiers.mjs overrides.
///   2. sync:courses     — copy Fishbones' fresh public/starter-courses/
///                         into academy/public/starter-courses/ + mirror
///                         the manifest into src/data/courses-manifest.json
///                         so the bundled marketing catalog matches the
///                         runtime files.
///   3. npm run build    — Vite-build the academy → dist/.
///   4. rsync to VPS     — Mirrors `.github/workflows/deploy.yml`'s
///                         "Sync to VPS" step. Uses sshpass + the same
///                         password the CI workflow does.
///
/// Skip the rebuild and just rsync an existing dist/:
///   npm run deploy -- --rsync-only
///
/// Skip the rsync and just stage everything locally:
///   npm run deploy -- --no-rsync
///
/// Auth — VPS password resolution order:
///   1. $VPS_SSH_PASSWORD env var (matches the GH secret name)
///   2. $SSHPASS env var
///   3. Apps/Fishbones/api/.env  (VPS_PASSWORD=…)
///   4. Apps/tap/.env             (VPS_PASSWORD=…)
/// Fails with instructions if none are found.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");

const args = new Set(process.argv.slice(2));
const RSYNC_ONLY = args.has("--rsync-only");
const NO_RSYNC = args.has("--no-rsync");

const VPS_HOST = process.env.VPS_HOST ?? "149.28.120.197";
const VPS_USER = process.env.VPS_USER ?? "root";
const VPS_PORT = process.env.VPS_PORT ?? "22";
const VPS_TARGET_DIR =
  process.env.VPS_TARGET_DIR ?? "/var/www/fishbones-academy";

function step(name, fn) {
  const started = Date.now();
  process.stdout.write(`\n[deploy] ▶ ${name}\n`);
  try {
    fn();
    const ms = Date.now() - started;
    process.stdout.write(`[deploy] ✓ ${name} (${(ms / 1000).toFixed(1)}s)\n`);
  } catch (err) {
    process.stderr.write(`[deploy] ✗ ${name} failed:\n`);
    process.stderr.write(
      `  ${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.exit(1);
  }
}

function run(cmd, opts = {}) {
  execSync(cmd, {
    stdio: "inherit",
    cwd: opts.cwd ?? SITE_ROOT,
    env: opts.env ? { ...process.env, ...opts.env } : process.env,
  });
}

/// Look for VPS_PASSWORD=… in a dotenv-style file. Tolerant of quoting
/// styles ('foo', "foo", or bare). Returns null if file missing or
/// the key isn't present.
function readPasswordFromDotenv(path) {
  if (!existsSync(path)) return null;
  const lines = readFileSync(path, "utf8").split("\n");
  for (const line of lines) {
    const m = /^\s*VPS_PASSWORD\s*=\s*(.+)$/.exec(line);
    if (!m) continue;
    let v = m[1].trim();
    // Strip a trailing inline comment that wasn't quoted out.
    if (!v.startsWith('"') && !v.startsWith("'")) {
      const hashIdx = v.indexOf("#");
      if (hashIdx > 0) v = v.slice(0, hashIdx).trim();
    }
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (v) return v;
  }
  return null;
}

function resolveVpsPassword() {
  if (process.env.VPS_SSH_PASSWORD) return process.env.VPS_SSH_PASSWORD;
  if (process.env.SSHPASS) return process.env.SSHPASS;
  // Walk up to ~/Development to find the canonical .env files. The
  // academy lives at Web/fishbones-academy; siblings are
  // Apps/Fishbones and Apps/tap.
  const devRoot = resolve(SITE_ROOT, "..", "..");
  for (const candidate of [
    join(devRoot, "Apps", "Fishbones", "api", ".env"),
    join(devRoot, "Apps", "tap", ".env"),
  ]) {
    const found = readPasswordFromDotenv(candidate);
    if (found) {
      console.log(`[deploy] using VPS password from ${candidate}`);
      return found;
    }
  }
  return null;
}

function rsyncToVps() {
  if (NO_RSYNC) {
    console.log("[deploy] --no-rsync set; skipping VPS sync.");
    return;
  }
  const pwd = resolveVpsPassword();
  if (!pwd) {
    throw new Error(
      "No VPS password found. Set VPS_SSH_PASSWORD env var, OR populate Apps/Fishbones/api/.env (VPS_PASSWORD=…). See scripts/deploy.mjs comments.",
    );
  }
  // Match the GH workflow's command verbatim except for portability:
  // BSD rsync (macOS) doesn't grok --info=stats2, so we use --stats
  // which both BSD and GNU rsync support.
  const sshOpts = `ssh -o StrictHostKeyChecking=no -o ConnectTimeout=15 -p ${VPS_PORT}`;
  const target = `${VPS_USER}@${VPS_HOST}:${VPS_TARGET_DIR}/`;
  run(
    `sshpass -e rsync -a --delete --stats -e "${sshOpts}" dist/ "${target}"`,
    { env: { SSHPASS: pwd } },
  );
  console.log(`[deploy] synced dist/ → ${target}`);
}

if (!RSYNC_ONLY) {
  step("sync:learn (build Fishbones web + stage under public/learn/)", () =>
    run("npm run sync:learn"),
  );
  step("sync:courses (mirror manifest + covers from Fishbones)", () =>
    run("npm run sync:courses"),
  );
  step("build (Vite build the academy)", () => run("npm run build"));
}

step("rsync to VPS", rsyncToVps);

console.log("\n[deploy] Done. Visit https://fishbones.academy/ to verify.");
