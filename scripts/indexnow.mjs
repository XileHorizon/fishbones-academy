#!/usr/bin/env node
/// IndexNow ping for libre.academy.
///
/// IndexNow is an open protocol: one POST tells Microsoft Bing — and
/// therefore ChatGPT search (which runs on Bing's index) — plus
/// Perplexity, Yandex, Seznam, Naver and Yep that our URLs changed,
/// so they recrawl in days instead of waiting on their own schedule.
/// This is the AI-search counterpart to submitting the sitemap to
/// Google Search Console.
///
/// How it works: a public key file lives at
/// https://libre.academy/<KEY>.txt (it just contains the key). We POST
/// the full URL list from dist/sitemap.xml to api.indexnow.org; the
/// engines fetch the key file to verify we own the host, then queue a
/// crawl. Run it AFTER the deploy so every URL (and the key file) is
/// already live — see scripts/deploy.mjs.
///
/// Non-fatal by design: a failed ping must never fail a deploy, so this
/// always exits 0 and just logs the outcome.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");

const HOST = "libre.academy";
const KEY = "add775fe2ef90f17be14f541e67c444d";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const sitemapPath = join(SITE_ROOT, "dist", "sitemap.xml");
if (!existsSync(sitemapPath)) {
  console.warn("[indexnow] dist/sitemap.xml not found — run the build first. Skipping.");
  process.exit(0);
}

const xml = readFileSync(sitemapPath, "utf8");
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) {
  console.warn("[indexnow] no <loc> URLs in sitemap — skipping.");
  process.exit(0);
}

try {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    signal: AbortSignal.timeout(20_000),
  });
  // 200 = accepted, 202 = accepted/queued. Anything else is informational.
  const note =
    res.status === 200 || res.status === 202
      ? "accepted"
      : res.status === 403
        ? "KEY NOT VALID — is the key file live at " + KEY_LOCATION + " ?"
        : res.status === 422
          ? "URLs don't match host / key"
          : res.status === 429
            ? "rate limited (too many submissions)"
            : "see status";
  console.log(`[indexnow] submitted ${urlList.length} URLs → HTTP ${res.status} (${note})`);
} catch (err) {
  console.warn(
    `[indexnow] ping failed (non-fatal): ${err instanceof Error ? err.message : err}`,
  );
}
process.exit(0);
