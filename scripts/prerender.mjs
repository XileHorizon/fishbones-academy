#!/usr/bin/env node
/// Build-time prerender for libre.academy.
///
/// WHY THIS EXISTS
/// ----------------
/// The site is a Vite + React SPA: the built `dist/index.html` ships an
/// empty `<div id="root"></div>` and renders everything client-side.
/// That's invisible to the crawlers that matter most for "free ways to
/// learn to code" discovery — ChatGPT (OAI-SearchBot / GPTBot), Claude
/// (ClaudeBot / Claude-SearchBot) and Perplexity all fetch raw HTML and
/// do NOT execute JavaScript. To them the entire site was a blank shell.
///
/// This script runs AFTER `vite build`. For every public route it:
///   1. renders real, semantic, internally-linked HTML from the same
///      data modules the app uses (loaded via Vite's ssrLoadModule, so
///      there's zero drift with the live catalog), and
///   2. patches the built template's <head> with per-route title /
///      description / canonical / Open Graph / Twitter / JSON-LD, then
///   3. injects the rendered body into <div id="root"> and writes a flat
///      `dist/<route>.html` file.
///
/// React still boots normally on top of this (createRoot replaces #root
/// on mount), so users get the full SPA while crawlers and no-JS clients
/// get substantive content. It also emits a correct root robots.txt and
/// a full sitemap.xml (the old ones lived under /learn/ where crawlers
/// never look).
///
/// Caddy must serve the flat files: `try_files {path} {path}.html
/// {path}/index.html /index.html` — see deploy/Caddyfile.

import { createServer } from "vite";
import MarkdownIt from "markdown-it";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const DIST = join(SITE_ROOT, "dist");
const SITE = "https://libre.academy";
const BUILD_DATE = new Date().toISOString().slice(0, 10);

// ─── git-based lastmod ────────────────────────────────────────────────────────
// Use the date of the last commit that touched a file as sitemap lastmod.
// Falls back to BUILD_DATE when git isn't available or the file is untracked.
const _gitDateCache = new Map();
function gitLastmod(...paths) {
  const key = paths.join("|");
  if (_gitDateCache.has(key)) return _gitDateCache.get(key);
  try {
    const args = paths.map((p) => JSON.stringify(p)).join(" ");
    const out = execSync(
      `git -C ${JSON.stringify(SITE_ROOT)} log -1 --format=%cs -- ${args}`,
      { stdio: ["ignore", "pipe", "ignore"] },
    )
      .toString()
      .trim();
    const date = out || BUILD_DATE;
    _gitDateCache.set(key, date);
    return date;
  } catch {
    _gitDateCache.set(key, BUILD_DATE);
    return BUILD_DATE;
  }
}

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

// ─── tiny escapers ───────────────────────────────────────────────────
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
const escAttr = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

if (!existsSync(join(DIST, "index.html"))) {
  console.error(
    "[prerender] dist/index.html not found — run `vite build` first.",
  );
  process.exit(1);
}
const TEMPLATE = readFileSync(join(DIST, "index.html"), "utf8");
if (!TEMPLATE.includes('<div id="root"></div>')) {
  console.error('[prerender] template is missing `<div id="root"></div>`.');
  process.exit(1);
}

// ─── load the app's real data (no drift with the live catalog) ───────
console.log("[prerender] booting Vite to load data modules…");
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});
let LANGUAGES, CATALOG, RELEASE_SECTION_ORDER, DOCS, courseSeoTitle, courseSeoDescription, languageSeoTitle, languageSeoDescription, COURSE_COUNT, LANGUAGE_COUNT, COURSE_COUNT_ROUNDED;
try {
  ({ LANGUAGES } = await vite.ssrLoadModule("/src/data/languages.ts"));
  ({ CATALOG, RELEASE_SECTION_ORDER } = await vite.ssrLoadModule(
    "/src/data/courses.ts",
  ));
  ({ DOCS } = await vite.ssrLoadModule("/src/data/docs.ts"));
  ({
    courseSeoTitle,
    courseSeoDescription,
    languageSeoTitle,
    languageSeoDescription,
  } = await vite.ssrLoadModule("/src/lib/seoMeta.ts"));
  ({
    COURSE_COUNT,
    LANGUAGE_COUNT,
    COURSE_COUNT_ROUNDED,
  } = await vite.ssrLoadModule("/src/lib/siteStats.ts"));
} finally {
  await vite.close();
}
console.log(
  `[prerender] loaded ${CATALOG.length} courses, ${LANGUAGES.length} languages, ${DOCS.length} doc sections.`,
);

// ─── blog posts (markdown on disk) ───────────────────────────────────
function loadPosts() {
  const manifestPath = join(SITE_ROOT, "public/blog/manifest.json");
  if (!existsSync(manifestPath)) return [];
  const metas = JSON.parse(readFileSync(manifestPath, "utf8"));
  return metas
    .map((m) => {
      const file = join(SITE_ROOT, "public/blog/posts", `${m.slug}.md`);
      if (!existsSync(file)) return null;
      let src = readFileSync(file, "utf8");
      // strip leading --- frontmatter --- block
      if (src.startsWith("---")) {
        const lines = src.split("\n");
        const close = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
        if (close !== -1) src = lines.slice(close + 1).join("\n").trimStart();
      }
      return { ...m, bodyHtml: md.render(src) };
    })
    .filter(Boolean);
}
const POSTS = loadPosts();

// Full per-course JSON (real description + chapter outline) so course
// pages carry unique, substantive content instead of a thin template —
// which is what keeps Google from filing them under "crawled, not
// indexed" and gives assistants real text to quote.
function loadFullCourse(id) {
  const p = join(SITE_ROOT, "public/starter-courses", `${id}.json`);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}
const FULL = new Map(CATALOG.map((c) => [c.id, loadFullCourse(c.id)]));
function lessonCountOf(c) {
  const ch = FULL.get(c.id)?.chapters || [];
  const n = ch.reduce((a, x) => a + (x.lessons?.length || 0), 0);
  return n || c.approxLessons;
}

// ─── shared chrome + snapshot styling ────────────────────────────────
// Namespaced under .lib-pre so it only styles the static snapshot; React
// removes the whole #root subtree on mount, taking this with it.
const PRE_STYLE = `<style>
.lib-pre{max-width:880px;margin:0 auto;padding:2rem 1.25rem 4rem;font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#e4e4e7;background:#09090b}
.lib-pre a{color:#fb923c;text-decoration:none}
.lib-pre a:hover{text-decoration:underline}
.lib-pre h1{font-size:2rem;line-height:1.2;margin:.4rem 0 1rem;color:#fafafa}
.lib-pre h2{font-size:1.35rem;margin:2.2rem 0 .8rem;color:#fafafa}
.lib-pre h3{font-size:1.1rem;margin:1.4rem 0 .5rem;color:#fafafa}
.lib-pre .lede{font-size:1.15rem;color:#d4d4d8}
.lib-pre nav,.lib-pre footer{font-size:.9rem;color:#a1a1aa}
.lib-pre nav a,.lib-pre footer a{margin-right:1rem;display:inline-block}
.lib-pre ul{padding-left:1.2rem}.lib-pre li{margin:.3rem 0}
.lib-pre .stats{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:.5rem 1.5rem}
.lib-pre .stats li{font-weight:600;color:#fafafa}
.lib-pre table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.95rem}
.lib-pre th,.lib-pre td{border:1px solid #27272a;padding:.5rem .7rem;text-align:left}
.lib-pre th{color:#fafafa}
.lib-pre dt{font-weight:600;color:#fafafa;margin-top:1rem}
.lib-pre dd{margin:.25rem 0 0}
.lib-pre pre{background:#131316;border:1px solid #27272a;border-radius:8px;padding:.8rem;overflow:auto}
.lib-pre code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em}
.lib-pre hr{border:0;border-top:1px solid #27272a;margin:2.5rem 0 1.5rem}
</style>`;

const NAV_LINKS = [
  ["/courses", "Courses"],
  ["/languages", "Languages"],
  ["/download", "Download"],
  ["/docs", "Docs"],
  ["/blog", "Blog"],
  ["/about", "About"],
];
function header() {
  const links = NAV_LINKS.map(([h, t]) => `<a href="${h}">${t}</a>`).join("");
  return `<nav><a href="/"><strong>Libre Academy</strong></a> ${links}<a href="/learn/">Open the app →</a></nav>`;
}
function footer() {
  return `<hr><footer><p>Libre Academy — free, open-source interactive coding courses. ${COURSE_COUNT_ROUNDED} courses across ${LANGUAGE_COUNT} languages, no paywall.</p>
<p><a href="/">Home</a><a href="/courses">Courses</a><a href="/languages">Languages</a><a href="/download">Download</a><a href="/docs">Docs</a><a href="/blog">Blog</a><a href="/about">About</a><a href="https://github.com/InfamousVague/Libre.academy">GitHub</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></p>
<p>© Libre Academy · MIT licensed · <a href="${SITE}/">libre.academy</a></p></footer>`;
}
const shell = (mainHtml) =>
  `${PRE_STYLE}<div class="lib-pre">${header()}${mainHtml}${footer()}</div>`;

// ─── head patching ───────────────────────────────────────────────────
function setMeta(html, attr, key, content) {
  const tag = `<meta ${attr}="${key}" content="${escAttr(content)}" />`;
  const re = new RegExp(
    `<meta\\s+${attr}="${escRe(key)}"\\s+content="[\\s\\S]*?"\\s*/?>`,
  );
  return re.test(html)
    ? html.replace(re, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}
function setLink(html, rel, href) {
  const tag = `<link rel="${rel}" href="${escAttr(href)}" />`;
  const re = new RegExp(`<link\\s+rel="${escRe(rel)}"\\s+href="[\\s\\S]*?"\\s*/?>`);
  return re.test(html)
    ? html.replace(re, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}
function setJsonLd(html, graphNodes) {
  const obj = { "@context": "https://schema.org", "@graph": graphNodes };
  const json = JSON.stringify(obj, null, 2).replace(/</g, "\\u003c");
  const block = `<script type="application/ld+json">\n${json}\n</script>`;
  const re = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
  return re.test(html)
    ? html.replace(re, block)
    : html.replace("</head>", `  ${block}\n  </head>`);
}

const ORG_NODE = {
  "@type": "EducationalOrganization",
  "@id": `${SITE}/#org`,
  name: "Libre Academy",
  url: `${SITE}/`,
  logo: `${SITE}/libre_app_icon.png`,
  description:
    `Free, open-source interactive coding courses. ${COURSE_COUNT_ROUNDED} courses across ${LANGUAGE_COUNT} languages — real editor, hidden tests, zero paywall. A free alternative to Codecademy and freeCodeCamp.`,
  sameAs: ["https://github.com/InfamousVague/Libre.academy"],
};
const WEBSITE_NODE = {
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  name: "Libre Academy",
  url: `${SITE}/`,
  publisher: { "@id": `${SITE}/#org` },
  // SearchAction removed: Google no longer surfaces the Sitelinks search
  // box for this schema pattern and it adds noise to the JSON-LD.
};
function breadcrumb(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: SITE + it.path,
    })),
  };
}

// ─── route writer ────────────────────────────────────────────────────
const routes = []; // { path, file, lastmod, priority, changefreq }
function emit(opts) {
  const {
    path,
    title,
    description,
    main,
    graph = [],
    ogType = "website",
    priority = 0.5,
    changefreq = "monthly",
    lastmod = BUILD_DATE,
    sitemap = true,
  } = opts;
  const canonical = SITE + path;
  let html = TEMPLATE;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:type", ogType);
  html = setMeta(html, "property", "og:url", canonical);
  html = setMeta(html, "property", "og:image", `${SITE}/og.png`);
  html = setMeta(html, "property", "og:image:width", "1200");
  html = setMeta(html, "property", "og:image:height", "630");
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = setMeta(html, "name", "twitter:image", `${SITE}/og.png`);
  html = setLink(html, "canonical", canonical);
  html = setJsonLd(html, [ORG_NODE, WEBSITE_NODE, ...graph]);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${shell(main)}</div>`,
  );

  const file =
    path === "/" ? join(DIST, "index.html") : join(DIST, `${path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  if (sitemap) routes.push({ path, lastmod, priority, changefreq });
}

// ─── content helpers ─────────────────────────────────────────────────
const courseLI = (c) =>
  `<li><a href="/courses/${c.id}">${esc(c.title)}</a> — ${esc(
    c.languageLabel,
  )} · ${lessonCountOf(c)} lessons</li>`;
const runLabel = (l) =>
  l.run === "browser"
    ? "runs in your browser"
    : l.run === "sandbox"
      ? "runs via a hosted playground"
      : "desktop app (native toolchain)";

const FAQ = [
  [
    "Is Libre Academy really free?",
    "Yes. Every course is free, there is no paid tier, and you don't need an account to start. The whole project — the website, the desktop app, and the cloud-sync server — is open source under the MIT license.",
  ],
  [
    "Do I need to sign up or install anything?",
    "No. You can start any course in your browser at libre.academy/learn with no account and no install. An optional free desktop app for macOS, Windows, and Linux adds offline use, native compilers, and the ability to turn your own books into courses.",
  ],
  [
    "What programming languages can I learn?",
    `${LANGUAGE_COUNT}, including JavaScript, TypeScript, Python, Rust, Go, C, C++, Java, Kotlin, C#, Swift, Solidity and more. JavaScript, TypeScript, Python, Rust, Go and the web frameworks run in your browser; compiled languages like C, C++, Java and Swift run in the desktop app.`,
  ],
  [
    "How is it different from freeCodeCamp or Codecademy?",
    "You write real code in a Monaco editor and hidden tests grade you on every lesson — active recall instead of passive video. It is fully open source, asks for no sign-up, and the desktop app can turn any technical book (PDF or EPUB) into an interactive course.",
  ],
  [
    "Is it good for complete beginners?",
    "Yes. There are beginner tracks such as JavaScript for Beginners alongside deeper books and challenge packs, so you can start from zero or level up a language you already know.",
  ],
  [
    "Is it open source?",
    "Yes, it's MIT-licensed. The source lives at github.com/InfamousVague/Libre.academy.",
  ],
];

// ─── HOME ────────────────────────────────────────────────────────────
{
  const featuredIds = [
    "javascript-for-beginners",
    "eloquent-javascript",
    "the-rust-programming-language",
    "learning-go",
    "exercism-python",
    "composing-programs",
    "crafting-interpreters-js",
    "mastering-bitcoin",
    "algorithms-erickson",
    "javascript-typescript",
    "exercism-rust",
    "mastering-ethereum",
  ];
  const featured = featuredIds
    .map((id) => CATALOG.find((c) => c.id === id))
    .filter(Boolean);
  const langLinks = LANGUAGES.map(
    (l) => `<a href="/languages/${l.slug}">${esc(l.name)}</a>`,
  ).join(" · ");
  const main = `<main>
<h1>Learn to code for free — ${COURSE_COUNT_ROUNDED} interactive courses across ${LANGUAGE_COUNT} languages</h1>
<p class="lede">Libre Academy is a free, open-source platform where you learn programming by writing real code in a built-in editor and getting instant feedback from hidden tests — ${COURSE_COUNT_ROUNDED} courses across ${LANGUAGE_COUNT} languages, with no paywall and no sign-up. It runs in your browser and as a desktop app, and it's a free, open-source alternative to Codecademy, freeCodeCamp, and Scrimba.</p>
<p><a href="/learn/">Start learning free →</a> &nbsp; <a href="/courses">Browse all ${COURSE_COUNT} courses</a> &nbsp; <a href="/download">Download the app</a></p>
<ul class="stats"><li>${COURSE_COUNT_ROUNDED} courses</li><li>${LANGUAGE_COUNT} languages</li><li>$0 — free forever</li><li>Open source (MIT)</li></ul>
<h2>Why Libre Academy</h2>
<ul>
<li><strong>Write code, don't watch video.</strong> Every lesson has a real Monaco editor and hidden tests that grade your work — active recall, not passive lectures.</li>
<li><strong>Free and open source.</strong> No paywall, no Pro tier, no sign-up to start. The site, the desktop app and the sync server are all MIT-licensed.</li>
<li><strong>Bring your own book.</strong> The desktop app turns any technical PDF or EPUB into an interactive course with generated exercises.</li>
<li><strong>Local-first, no telemetry.</strong> Courses and progress live on your device; optional free cloud sync mirrors progress across machines.</li>
<li><strong>Browser or desktop.</strong> Learn in-tab with nothing to install, or install the app for native compilers and offline use.</li>
</ul>
<h2>How Libre Academy compares</h2>
<table>
<tr><th>&nbsp;</th><th>Libre Academy</th><th>Codecademy</th><th>freeCodeCamp</th></tr>
<tr><td>Price</td><td>Free</td><td>Free tier + paid Pro</td><td>Free</td></tr>
<tr><td>Open source</td><td>Yes (MIT)</td><td>No</td><td>Yes</td></tr>
<tr><td>Languages</td><td>${LANGUAGE_COUNT}</td><td>~14</td><td>~10</td></tr>
<tr><td>Run code in the browser</td><td>Yes</td><td>Yes</td><td>Yes (some)</td></tr>
<tr><td>Turn your own book into a course</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>Sign-up required to start</td><td>No</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Desktop app</td><td>Yes</td><td>No</td><td>No</td></tr>
</table>
<h2>Popular courses</h2>
<ul>${featured.map(courseLI).join("")}</ul>
<p><a href="/courses">Browse all ${COURSE_COUNT} free courses →</a></p>
<h2>Languages you can learn</h2>
<p>${langLinks}</p>
<h2>Frequently asked questions</h2>
<dl>${FAQ.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join("")}</dl>
<h2>Start learning</h2>
<p><a href="/learn/">Open the free in-browser app →</a> &nbsp; <a href="/download">Download for macOS, Windows &amp; Linux</a> &nbsp; <a href="https://github.com/InfamousVague/Libre.academy">Star on GitHub</a></p>
</main>`;
  emit({
    path: "/",
    title: `Learn to code free — ${COURSE_COUNT_ROUNDED} courses, ${LANGUAGE_COUNT} languages | Libre Academy`,
    description:
      `Free, open-source interactive coding courses. ${COURSE_COUNT_ROUNDED} courses across ${LANGUAGE_COUNT} languages — write real code, graded by hidden tests, zero paywall and no sign-up. A free alternative to Codecademy.`,
    main,
    priority: 1.0,
    changefreq: "weekly",
    lastmod: gitLastmod("src/pages/Home.tsx", "src/data/courses.ts", "src/data/languages.ts", "src/data/courses-manifest.json"),
    graph: [
      {
        "@type": "WebPage",
        "@id": `${SITE}/#webpage`,
        url: `${SITE}/`,
        name: "Learn to code free — Libre Academy",
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#org` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  });
}

// ─── COURSES INDEX ───────────────────────────────────────────────────
{
  const sections = RELEASE_SECTION_ORDER.map((sec) => {
    const list = CATALOG.filter((c) => c.releaseStatus === sec.status);
    if (!list.length) return "";
    return `<h2>${esc(sec.label)} <span style="font-weight:400;color:#a1a1aa">— ${esc(
      sec.blurb,
    )}</span></h2><ul>${list.map(courseLI).join("")}</ul>`;
  }).join("");
  const main = `<main>
<h1>Free coding courses — browse all ${CATALOG.length}</h1>
<p class="lede">Every Libre Academy course is free and interactive: read, write code in a real editor, and let hidden tests grade you. ${CATALOG.length} courses across ${LANGUAGES.length} languages, from beginner tracks to full books and challenge packs — no paywall, no sign-up.</p>
<p><a href="/learn/">Start any course free →</a> &nbsp; <a href="/languages">Browse by language</a></p>
${sections}
</main>`;
  const itemList = {
    "@type": "ItemList",
    itemListElement: CATALOG.slice(0, 200).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/courses/${c.id}`,
      name: c.title,
    })),
  };
  emit({
    path: "/courses",
    title: `Free coding courses — all ${CATALOG.length} | Libre Academy`,
    description: `Browse all ${CATALOG.length} free, interactive coding courses across ${LANGUAGES.length} languages on Libre Academy. Write real code, graded by hidden tests. No paywall, no sign-up.`,
    main,
    priority: 0.9,
    changefreq: "weekly",
    lastmod: gitLastmod("src/pages/Courses.tsx", "src/data/courses.ts", "src/data/courses-manifest.json"),
    graph: [
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Courses", path: "/courses" },
      ]),
      { "@type": "CollectionPage", url: `${SITE}/courses`, name: "Courses", mainEntity: itemList },
    ],
  });
}

// ─── COURSE DETAIL (×N) ──────────────────────────────────────────────
for (const c of CATALOG) {
  const lang = LANGUAGES.find((l) => l.id === c.language);
  const langName = c.languageLabel || c.language;
  const kind =
    c.topic === "challenges"
      ? "challenge pack"
      : c.topic === "tracks"
        ? "learning track"
        : "course";
  const full = FULL.get(c.id);
  const realDesc = (full?.description || "").replace(/\s+/g, " ").trim();
  const author = full?.author;
  const chapters = full?.chapters || [];
  const lessons = lessonCountOf(c);
  const hours = Math.max(1, Math.round((lessons * 12) / 60));

  const metaDesc = (
    realDesc
      ? `${realDesc} A free, interactive ${langName} ${kind} on Libre Academy — write real code, graded by hidden tests, no paywall or sign-up.`
      : `Learn ${langName} free with the ${c.title} ${kind} on Libre Academy: ${lessons} interactive, test-graded lessons. No paywall, no sign-up.`
  )
    .replace(/\s+/g, " ")
    .slice(0, 300);

  const outline = chapters.length
    ? `<h2>What's inside</h2><ul>${chapters
        .slice(0, 40)
        .map((ch) => `<li>${esc(ch.title)}</li>`)
        .join("")}</ul>`
    : "";

  const main = `<main>
<p><a href="/courses">← All courses</a></p>
<h1>${esc(c.title)}</h1>
<p class="lede">${esc(
    realDesc || `Learn ${langName} for free by writing real code, graded by hidden tests.`,
  )}</p>
<ul class="stats"><li>${esc(langName)}</li><li>${lessons} lessons</li><li>~${hours} hours</li><li>Free</li>${
    author ? `<li>by ${esc(author)}</li>` : ""
  }</ul>
<p>Learn <strong>${esc(langName)}</strong> for free on Libre Academy with the <strong>${esc(
    c.title,
  )}</strong> ${kind}: ${lessons} interactive lessons you complete by writing real code in a built-in editor, graded instantly by hidden tests. No paywall, no sign-up — it runs in your browser and the free desktop app.</p>
<h2>What you get</h2>
<ul>
<li>Hands-on lessons with a real editor and instant, test-graded feedback.</li>
<li>Free and open source — no account required to start.</li>
<li>Runs in your browser, and offline in the free desktop app.</li>
${lang ? `<li>${esc(lang.name)} ${runLabel(lang)}.</li>` : ""}
</ul>
${outline}
<p><a href="/learn/">Start ${esc(c.title)} free →</a> &nbsp; ${
    lang
      ? `<a href="/languages/${lang.slug}">More free ${esc(lang.name)} courses</a>`
      : `<a href="/courses">Browse all courses</a>`
  }</p>
<h2>Helpful reading</h2>
<p><a href="/blog/why-passive-video-doesnt-work">Why passive video doesn't make you a programmer</a> &nbsp;·&nbsp; <a href="/blog/bring-your-own-book">Bring Your Own Book: turning any PDF into a course</a></p>
</main>`;
  emit({
    path: `/courses/${c.id}`,
    title: courseSeoTitle(c),
    description: metaDesc || courseSeoDescription(c),
    main,
    ogType: "article",
    priority: 0.6,
    lastmod: gitLastmod("src/pages/CourseDetail.tsx", "src/data/courses.ts", "src/data/courses-manifest.json", `public/starter-courses/${c.id}.json`),
    graph: [
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Courses", path: "/courses" },
        { name: c.title, path: `/courses/${c.id}` },
      ]),
      {
        "@type": "Course",
        name: c.title,
        description: realDesc || metaDesc,
        url: `${SITE}/courses/${c.id}`,
        provider: { "@id": `${SITE}/#org` },
        inLanguage: "en",
        about: langName,
        ...(author ? { author: { "@type": "Person", name: author } } : {}),
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", category: "Free" },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: `PT${lessons * 12}M`,
          instructor: { "@id": `${SITE}/#org` },
        },
      },
    ],
  });
}

// ─── LANGUAGES INDEX ─────────────────────────────────────────────────
{
  const li = LANGUAGES.map(
    (l) =>
      `<li><a href="/languages/${l.slug}">${esc(l.name)}</a> — ${esc(
        l.blurb,
      )} <em style="color:#71717a">(${runLabel(l)})</em></li>`,
  ).join("");
  const main = `<main>
<h1>Programming languages you can learn for free</h1>
<p class="lede">Libre Academy has free, interactive courses in ${LANGUAGE_COUNT} languages. JavaScript, TypeScript, Python, Rust, Go and the web frameworks run right in your browser; compiled languages run in the free desktop app.</p>
<ul>${li}</ul>
<p><a href="/courses">Browse all ${COURSE_COUNT} courses →</a></p>
</main>`;
  const itemList = {
    "@type": "ItemList",
    itemListElement: LANGUAGES.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/languages/${l.slug}`,
      name: l.name,
    })),
  };
  emit({
    path: "/languages",
    title: `${LANGUAGE_COUNT} programming languages — free interactive courses | Libre Academy`,
    description:
      `Free, interactive courses in ${LANGUAGE_COUNT} programming languages — JavaScript, Python, Rust, Go, C, C++, Java, Swift, Solidity and more. Write real code in your browser. No paywall.`,
    main,
    priority: 0.9,
    changefreq: "weekly",
    lastmod: gitLastmod("src/pages/Languages.tsx", "src/data/languages.ts", "src/data/courses.ts", "src/data/courses-manifest.json"),
    graph: [
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Languages", path: "/languages" },
      ]),
      { "@type": "CollectionPage", url: `${SITE}/languages`, name: "Languages", mainEntity: itemList },
    ],
  });
}

// ─── LANGUAGE DETAIL (×N) ────────────────────────────────────────────
for (const l of LANGUAGES) {
  const courses = CATALOG.filter((c) => c.language === l.id);
  const coursesHtml = courses.length
    ? `<h2>${esc(l.name)} courses</h2><ul>${courses.map(courseLI).join("")}</ul>`
    : "";
  const main = `<main>
<p><a href="/languages">← All languages</a></p>
<h1>Learn ${esc(l.name)} for free</h1>
<p class="lede">${esc(l.blurb)} On Libre Academy you learn ${esc(
    l.name,
  )} for free by writing real code in an in-editor workbench, graded by hidden tests — ${runLabel(
    l,
  )}. No paywall, no sign-up.</p>
<p><a href="/learn/">Start learning ${esc(l.name)} free →</a></p>
${coursesHtml}
<h2>Helpful reading</h2>
<p><a href="/blog/why-passive-video-doesnt-work">Why passive video doesn't make you a programmer</a> &nbsp;·&nbsp; <a href="/blog/bring-your-own-book">Bring Your Own Book: turning any PDF into a course</a></p>
</main>`;
  emit({
    path: `/languages/${l.slug}`,
    title: languageSeoTitle(l),
    description: languageSeoDescription(l, courses.length),
    main,
    ogType: "article",
    priority: 0.6,
    lastmod: gitLastmod("src/pages/LanguageDetail.tsx", "src/data/languages.ts", "src/data/courses.ts", "src/data/courses-manifest.json"),
    graph: [
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Languages", path: "/languages" },
        { name: l.name, path: `/languages/${l.slug}` },
      ]),
    ],
  });
}

// ─── DOWNLOAD ────────────────────────────────────────────────────────
emit({
  path: "/download",
  title: "Download Libre Academy — free coding app for Mac, Windows, Linux",
  description:
    `Download the free Libre Academy desktop app for macOS, Windows and Linux: ${COURSE_COUNT_ROUNDED} interactive coding courses, native compilers, offline use, and turn your own books into courses. Free and open source.`,
  main: `<main>
<h1>Download Libre Academy</h1>
<p class="lede">Libre Academy is free on every platform. Learn in your browser with nothing to install, or download the desktop app for native compilers, offline use, and turning your own PDFs and EPUBs into interactive courses.</p>
<h2>Three ways to use it — all free</h2>
<ul>
<li><strong>In your browser</strong> — open <a href="/learn/">libre.academy/learn</a>, no install and no account.</li>
<li><strong>Desktop app</strong> — macOS, Windows and Linux. Adds native toolchain runners (C, C++, Java, Swift…), book ingestion, and a local AI tutor. <a href="https://github.com/InfamousVague/Libre.academy/releases/latest">Get the latest release</a>.</li>
<li><strong>Optional cloud sync</strong> — free, opt-in, mirrors your progress across machines.</li>
</ul>
<p><a href="/courses">Browse the ${COURSE_COUNT} courses →</a></p>
</main>`,
  priority: 0.8,
  changefreq: "weekly",
  lastmod: gitLastmod("src/pages/Download.tsx"),
  graph: [breadcrumb([{ name: "Home", path: "/" }, { name: "Download", path: "/download" }])],
});

// ─── ABOUT ───────────────────────────────────────────────────────────
emit({
  path: "/about",
  title: "About Libre Academy — free, open-source way to learn to code",
  description:
    "Libre Academy is a free, open-source coding platform built on active recall: write real code graded by hidden tests, bring your own books, learn local-first with no telemetry and no paywall.",
  main: `<main>
<h1>About Libre Academy</h1>
<p class="lede">Libre Academy exists to make learning to code genuinely free and genuinely effective. Passive video doesn't make you a programmer; writing code does. So every lesson puts you in a real editor with hidden tests that grade your work.</p>
<h2>What we believe</h2>
<ul>
<li><strong>Free should mean free.</strong> No paywall, no Pro tier, no sign-up wall. Everything — site, desktop app, sync server — is open source under the MIT license.</li>
<li><strong>Active recall beats passive video.</strong> You learn by doing, with instant test feedback, XP and streaks.</li>
<li><strong>Your books, your courses.</strong> The desktop app turns any technical PDF or EPUB into an interactive course.</li>
<li><strong>Local-first and private.</strong> Courses and progress live on your device, with no telemetry and only opt-in cloud sync.</li>
</ul>
<p><a href="/courses">Browse ${COURSE_COUNT} free courses →</a> &nbsp; <a href="https://github.com/InfamousVague/Libre.academy">View the source on GitHub</a></p>
</main>`,
  priority: 0.7,
  lastmod: gitLastmod("src/pages/About.tsx"),
  graph: [breadcrumb([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])],
});

// ─── DOCS ────────────────────────────────────────────────────────────
{
  const allPages = [];
  for (const sec of DOCS) for (const p of sec.pages) allPages.push({ sec, p });
  const intro = DOCS[0].pages[0];
  const toc = DOCS.map(
    (sec) =>
      `<h3>${esc(sec.title)}</h3><ul>${sec.pages
        .map(
          (p) =>
            `<li><a href="/docs/${sec.id}/${p.id}">${esc(p.title)}</a>${
              p.tagline ? ` — ${esc(p.tagline)}` : ""
            }</li>`,
        )
        .join("")}</ul>`,
  ).join("");
  emit({
    path: "/docs",
    title: "Docs — Libre Academy",
    description:
      "Documentation for Libre Academy, the free interactive coding platform: getting started in the browser or desktop app, lesson kinds, the editor, themes, and the local-first design.",
    main: `<main><h1>Libre Academy documentation</h1><p class="lede">${esc(
      intro.tagline || "How Libre Academy works and how to get started.",
    )}</p>${md.render(intro.body)}<h2>All pages</h2>${toc}</main>`,
    priority: 0.5,
    lastmod: gitLastmod("src/pages/Docs.tsx", "src/data/docs.ts"),
    graph: [breadcrumb([{ name: "Home", path: "/" }, { name: "Docs", path: "/docs" }])],
  });
  for (const { sec, p } of allPages) {
    emit({
      path: `/docs/${sec.id}/${p.id}`,
      title: `${p.title} — Libre Academy docs`,
      description: p.tagline
        ? `${p.tagline} — Libre Academy documentation.`
        : `Libre Academy documentation: ${p.title}.`,
      main: `<main><p><a href="/docs">← Docs</a></p><h1>${esc(p.title)}</h1>${md.render(
        p.body,
      )}</main>`,
      ogType: "article",
      priority: 0.4,
      lastmod: gitLastmod("src/pages/Docs.tsx", "src/data/docs.ts"),
      graph: [
        breadcrumb([
          { name: "Home", path: "/" },
          { name: "Docs", path: "/docs" },
          { name: p.title, path: `/docs/${sec.id}/${p.id}` },
        ]),
      ],
    });
  }
}

// ─── BLOG ────────────────────────────────────────────────────────────
{
  const list = POSTS.map(
    (p) =>
      `<li><a href="/blog/${p.slug}">${esc(p.title)}</a><br><span style="color:#a1a1aa">${esc(
        p.date,
      )} — ${esc(p.excerpt || "")}</span></li>`,
  ).join("");
  emit({
    path: "/blog",
    title: "Blog — Libre Academy",
    description:
      "Writing from the Libre Academy team on learning to code effectively, active recall, and turning books into interactive courses.",
    main: `<main><h1>Libre Academy blog</h1><p class="lede">Notes on learning to code effectively and how Libre Academy is built.</p><ul>${list}</ul></main>`,
    priority: 0.6,
    changefreq: "weekly",
    lastmod: POSTS[0]?.date || gitLastmod("src/pages/Blog.tsx", "public/blog/manifest.json"),
    graph: [breadcrumb([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])],
  });
  for (const p of POSTS) {
    emit({
      path: `/blog/${p.slug}`,
      title: `${p.title} — Libre Academy`,
      description: p.excerpt || `${p.title} — from the Libre Academy blog.`,
      main: `<main><p><a href="/blog">← Blog</a></p><h1>${esc(
        p.title,
      )}</h1><p style="color:#a1a1aa">${esc(p.date)}${
        p.author ? ` · ${esc(p.author)}` : ""
      }</p>${p.bodyHtml}</main>`,
      ogType: "article",
      priority: 0.6,
      lastmod: p.date || BUILD_DATE,
      graph: [
        breadcrumb([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: p.title, path: `/blog/${p.slug}` },
        ]),
        {
          "@type": "BlogPosting",
          headline: p.title,
          datePublished: p.date,
          description: p.excerpt || "",
          author: { "@type": "Organization", name: p.author || "The Libre Team" },
          publisher: { "@id": `${SITE}/#org` },
          url: `${SITE}/blog/${p.slug}`,
          mainEntityOfPage: `${SITE}/blog/${p.slug}`,
        },
      ],
    });
  }
}

// ─── LEGAL / SUPPORT / SECURITY ──────────────────────────────────────
emit({
  path: "/privacy",
  title: "Privacy — Libre Academy",
  description:
    "Libre Academy is local-first with no telemetry. Your courses and progress live on your device; cloud sync is optional and stores only a small progress record.",
  main: `<main><h1>Privacy</h1><p class="lede">Libre Academy is local-first and private by design. There is no telemetry, no analytics on the learning app, and no tracking. Courses and progress live on your device. Optional cloud sync stores only a small JSON progress record, and only if you opt in.</p><p><a href="/docs/principles/offline">Read about local-first &amp; what talks to a server →</a></p></main>`,
  priority: 0.2,
  lastmod: gitLastmod("src/pages/Privacy.tsx"),
  graph: [breadcrumb([{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }])],
});
emit({
  path: "/terms",
  title: "Terms — Libre Academy",
  description:
    "Libre Academy is free and open source under the MIT license. Use it freely; it's provided as-is.",
  main: `<main><h1>Terms</h1><p class="lede">Libre Academy is free and open source under the MIT license. You're free to use, study, and build on it. The software is provided as-is, without warranty.</p><p><a href="https://github.com/InfamousVague/Libre.academy">See the license and source on GitHub →</a></p></main>`,
  priority: 0.2,
  lastmod: gitLastmod("src/pages/Terms.tsx"),
  graph: [breadcrumb([{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }])],
});
emit({
  path: "/support",
  title: "Support Libre Academy",
  description:
    "Libre Academy is free and open source. If it helped you learn to code, you can support development — but every course stays free for everyone.",
  main: `<main><h1>Support Libre Academy</h1><p class="lede">Libre Academy is free and open source, and every course stays free for everyone. If it helped you learn to code, support is welcome and keeps development going — but it's never required and never gates content.</p><p><a href="/courses">Browse the free courses →</a> &nbsp; <a href="https://github.com/InfamousVague/Libre.academy">Star the project on GitHub</a></p></main>`,
  priority: 0.4,
  lastmod: gitLastmod("src/pages/Support.tsx"),
  graph: [breadcrumb([{ name: "Home", path: "/" }, { name: "Support", path: "/support" }])],
});
emit({
  path: "/security",
  title: "Security — Libre Academy",
  description:
    "How Libre Academy handles security: open-source, local-first, no telemetry, sandboxed code execution, and an opt-in sync server that stores only progress records.",
  main: `<main><h1>Security</h1><p class="lede">Libre Academy is open source, local-first, and runs lesson code in sandboxed environments. There's no telemetry, and the optional sync server stores only a small progress record. Because the whole stack is MIT-licensed, anyone can audit exactly how it works.</p><p><a href="https://github.com/InfamousVague/Libre.academy">Review the source on GitHub →</a></p></main>`,
  priority: 0.3,
  lastmod: gitLastmod("src/pages/SecurityAudit.tsx"),
  graph: [breadcrumb([{ name: "Home", path: "/" }, { name: "Security", path: "/security" }])],
});
emit({
  path: "/404",
  title: "Page not found — Libre Academy",
  description:
    "The page you're looking for doesn't exist. Browse free courses, languages, docs, or head back to the Libre Academy homepage.",
  main: `<main><h1>Page not found</h1><p class="lede">That URL doesn't exist on Libre Academy. Try the course catalog, language pages, docs, or head back home.</p><p><a href="/courses">Browse courses →</a> &nbsp; <a href="/languages">Browse languages</a> &nbsp; <a href="/">Home</a></p></main>`,
  priority: 0.0,
  lastmod: gitLastmod("src/pages/NotFound.tsx"),
  sitemap: false,
  graph: [],
});

// ─── COMPARISON / "ALTERNATIVE" LANDING PAGES ───────────────────────
// High-intent queries ("free codecademy alternative", "best free way to
// learn to code") that are also the format AI assistants cite most.
// These are STANDALONE static pages — NOT SPA routes — so they don't
// boot React (which would 404 on an unknown route); they're plain,
// fast, fully-crawlable HTML that link back into the app.
function emitStandalone({ path, title, description, main, graph = [], priority = 0.8, lastmod = gitLastmod("scripts/prerender.mjs") }) {
  const canonical = SITE + path;
  const jsonld = JSON.stringify(
    { "@context": "https://schema.org", "@graph": [ORG_NODE, WEBSITE_NODE, ...graph] },
    null,
    2,
  ).replace(/</g, "\\u003c");
  const html = `<!doctype html>
<html lang="en" data-theme="dark" data-theme-name="default-dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#09090b" />
<link rel="icon" type="image/png" href="/favicon.png?v=2" />
<title>${esc(title)}</title>
<meta name="description" content="${escAttr(description)}" />
<link rel="canonical" href="${escAttr(canonical)}" />
<meta property="og:site_name" content="Libre Academy" />
<meta property="og:title" content="${escAttr(title)}" />
<meta property="og:description" content="${escAttr(description)}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${escAttr(canonical)}" />
<meta property="og:image" content="${SITE}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escAttr(title)}" />
<meta name="twitter:description" content="${escAttr(description)}" />
<meta name="twitter:image" content="${SITE}/og.png" />
<script type="application/ld+json">
${jsonld}
</script>
<script defer data-domain="libre.academy" src="https://stats.libre.academy/js/script.outbound-links.js"></script>
${PRE_STYLE}
</head>
<body>
<div class="lib-pre">${header()}${main}${footer()}</div>
</body>
</html>`;
  const file = join(DIST, `${path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  routes.push({ path, lastmod, priority, changefreq: "monthly" });
}

const cmpFeatured = [
  "javascript-for-beginners",
  "exercism-python",
  "the-rust-programming-language",
  "learning-go",
  "select-star-sql",
  "eloquent-javascript",
]
  .map((id) => CATALOG.find((c) => c.id === id))
  .filter(Boolean);

function compareTable(colName, cells) {
  return `<table><tr><th>&nbsp;</th><th>Libre Academy</th><th>${esc(colName)}</th></tr>${cells
    .map(([f, a, b]) => `<tr><td>${esc(f)}</td><td>${esc(a)}</td><td>${esc(b)}</td></tr>`)
    .join("")}</table>`;
}
const faqDl = (faq) =>
  `<dl>${faq.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join("")}</dl>`;
const faqLd = (faq) => ({
  "@type": "FAQPage",
  mainEntity: faq.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

// 1) Free alternative to Codecademy
{
  const faq = [
    [
      "Is Libre Academy free like Codecademy?",
      "More so. Codecademy has a free tier plus a paid Pro plan that gates many paths and projects. Libre Academy is 100% free with no paid tier, and the whole project is open source under the MIT license.",
    ],
    [
      "Do I need an account?",
      "No. You can start any course in your browser at libre.academy/learn with no sign-up — unlike Codecademy, which requires an account.",
    ],
    [
      "How is it different from Codecademy?",
      `Same write-code-in-the-browser style, but free and open source, with ${LANGUAGE_COUNT} languages (including systems languages like Rust, C and C++ and Web3 languages), and a desktop app that can turn your own PDFs and EPUBs into interactive courses.`,
    ],
  ];
  emitStandalone({
    path: "/free-alternative-to-codecademy",
    title: "Free alternative to Codecademy — Libre Academy",
    description:
      `Libre Academy is a free, open-source alternative to Codecademy: write real code in your browser graded by hidden tests, across ${LANGUAGE_COUNT} languages, with no paywall and no sign-up.`,
    main: `<main>
<h1>A free, open-source alternative to Codecademy</h1>
<p class="lede">Like Codecademy, Libre Academy teaches by having you write real code in an in-browser editor with instant feedback. Unlike Codecademy, it's 100% free and open source — no Pro tier, no paywalled paths, and no sign-up to start.</p>
<p><a href="/learn/">Start learning free →</a> &nbsp; <a href="/courses">Browse ${COURSE_COUNT} courses</a></p>
<h2>Libre Academy vs Codecademy</h2>
${compareTable("Codecademy", [
  ["Price", "Free", "Free tier + paid Pro"],
  ["Open source", "Yes (MIT)", "No"],
  ["Languages", String(LANGUAGE_COUNT), "~14"],
  ["Run code in the browser", "Yes", "Yes"],
  ["Hidden tests on every lesson", "Yes", "Partial (Pro)"],
  ["Turn your own book into a course", "Yes", "No"],
  ["Sign-up to start", "Not required", "Required"],
  ["Desktop app (offline)", "Yes", "No"],
])}
<h2>Why people switch</h2>
<ul>
<li><strong>Nothing is paywalled.</strong> Every course, project and language is free, forever.</li>
<li><strong>More languages.</strong> ${LANGUAGE_COUNT}, including Rust, Go, C, C++, SQL and Solidity — not just web basics.</li>
<li><strong>Your own material.</strong> The desktop app ingests any technical book into an interactive course.</li>
<li><strong>Open source.</strong> MIT-licensed; audit or self-host the whole thing.</li>
</ul>
<h2>Popular free courses</h2>
<ul>${cmpFeatured.map(courseLI).join("")}</ul>
<h2>FAQ</h2>
${faqDl(faq)}
<p><a href="/learn/">Open the free app →</a> &nbsp; <a href="/download">Download for desktop</a></p>
</main>`,
    graph: [
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Free alternative to Codecademy", path: "/free-alternative-to-codecademy" },
      ]),
      faqLd(faq),
    ],
  });
}

// 2) freeCodeCamp alternative
{
  const faq = [
    [
      "Is Libre Academy better than freeCodeCamp?",
      `Neither is strictly better — they fit different goals. freeCodeCamp is excellent for the web-development certification path and a huge community. Libre Academy is better if you want active-recall drilling with hidden tests on every lesson across ${LANGUAGE_COUNT} languages (including systems and Web3 languages) and the ability to turn your own books into courses.`,
    ],
    [
      "Are both free?",
      "Yes. Both freeCodeCamp and Libre Academy are free and open source. Libre Academy additionally requires no sign-up to start and offers an offline desktop app.",
    ],
    [
      "Does Libre Academy offer certificates?",
      "No. freeCodeCamp offers free certifications; Libre Academy focuses on learning by doing (XP and streaks) rather than certificates.",
    ],
  ];
  emitStandalone({
    path: "/freecodecamp-alternative",
    title: "A freeCodeCamp alternative — Libre Academy",
    description:
      `Libre Academy is a free, open-source freeCodeCamp alternative: code-graded lessons across ${LANGUAGE_COUNT} languages, bring-your-own-book ingestion, and a desktop app. Honest comparison of when to use which.`,
    main: `<main>
<h1>A freeCodeCamp alternative — and when to use which</h1>
<p class="lede">freeCodeCamp is a great, free, open-source way to learn web development and earn certifications. Libre Academy is also free and open source, but takes a different approach: every lesson is code you write and run, graded by hidden tests, across ${LANGUAGE_COUNT} languages — and the desktop app turns your own books into courses.</p>
<p><a href="/learn/">Start learning free →</a> &nbsp; <a href="/courses">Browse ${COURSE_COUNT} courses</a></p>
<h2>Libre Academy vs freeCodeCamp</h2>
${compareTable("freeCodeCamp", [
  ["Price", "Free", "Free"],
  ["Open source", "Yes (MIT)", "Yes"],
  ["Languages", `${LANGUAGE_COUNT} (incl. systems & Web3)`, "~10 (web-focused)"],
  ["Lesson style", "Code + hidden tests every lesson", "Projects + challenges"],
  ["Turn your own book into a course", "Yes", "No"],
  ["Free certifications", "No", "Yes"],
  ["Sign-up to start", "Not required", "Required"],
  ["Desktop app (offline)", "Yes", "No"],
])}
<h2>Use Libre Academy if you want…</h2>
<ul>
<li>Broad language coverage — Rust, Go, C, C++, SQL, Solidity and more, not just web.</li>
<li>Active-recall practice with instant test feedback on every single lesson.</li>
<li>To learn from your own PDFs/EPUBs via the desktop app's book ingestion.</li>
<li>To start instantly with no account.</li>
</ul>
<h2>Stick with freeCodeCamp if you want…</h2>
<ul>
<li>The structured web-development certification path and its large community.</li>
</ul>
<h2>FAQ</h2>
${faqDl(faq)}
<p><a href="/learn/">Open the free app →</a> &nbsp; <a href="/languages">Browse by language</a></p>
</main>`,
    graph: [
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "freeCodeCamp alternative", path: "/freecodecamp-alternative" },
      ]),
      faqLd(faq),
    ],
  });
}

// 3) Best free way to learn to code (honest 2026 roundup — the citation magnet)
{
  const picks = [
    [
      "freeCodeCamp",
      "Free, open-source, project-based, with certifications. The default for web-development beginners.",
    ],
    [
      "The Odin Project",
      "A complete, free full-stack curriculum that has you build real projects with professional tools.",
    ],
    [
      "CS50 (Harvard, via edX)",
      "A free, rigorous university intro to computer science — strongest on fundamentals.",
    ],
    [
      "Libre Academy",
      `Free and open source: write real code graded by hidden tests across ${LANGUAGE_COUNT} languages, in your browser or a desktop app — and turn your own books into courses. No sign-up.`,
    ],
    [
      "Exercism",
      "Free coding practice with mentorship across many languages — great once you know the basics.",
    ],
    [
      "Khan Academy",
      "Free, gentle introductions to programming aimed at absolute beginners.",
    ],
  ];
  emitStandalone({
    path: "/best-free-way-to-learn-to-code",
    title: "The best free ways to learn to code in 2026 — Libre Academy",
    description:
      "An honest 2026 roundup of the best free ways to learn to code — freeCodeCamp, The Odin Project, CS50, Libre Academy, Exercism and Khan Academy — and how to choose.",
    main: `<main>
<h1>The best free ways to learn to code in 2026</h1>
<p class="lede">You don't need to pay to learn programming. These are the free resources worth your time in 2026, and how to choose between them. (We make one of them — Libre Academy — and we've tried to keep this list fair.)</p>
<h2>The shortlist</h2>
<dl>${picks
      .map(([n, d]) => `<dt>${esc(n)}</dt><dd>${esc(d)}</dd>`)
      .join("")}</dl>
<h2>How to choose</h2>
<ul>
<li><strong>Want web dev + a certificate?</strong> freeCodeCamp or The Odin Project.</li>
<li><strong>Want CS fundamentals?</strong> CS50.</li>
<li><strong>Want to learn by writing code in many languages, with instant test feedback and no sign-up?</strong> Libre Academy.</li>
<li><strong>Already know the basics and want practice?</strong> Exercism.</li>
<li><strong>Total beginner who wants the gentlest start?</strong> Khan Academy.</li>
</ul>
<h2>About Libre Academy</h2>
<p>Libre Academy is a free, open-source platform with ${COURSE_COUNT} interactive courses across ${LANGUAGE_COUNT} languages. Every lesson is code you write in a real editor, graded instantly by hidden tests — active recall, not passive video. It runs in your browser with no install or account, and the free desktop app adds offline use, native compilers, and the ability to turn any technical PDF or EPUB into an interactive course.</p>
<p><a href="/learn/">Try Libre Academy free →</a> &nbsp; <a href="/courses">Browse all ${COURSE_COUNT} courses</a></p>
</main>`,
    graph: [
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Best free way to learn to code", path: "/best-free-way-to-learn-to-code" },
      ]),
      {
        "@type": "Article",
        headline: "The best free ways to learn to code in 2026",
        author: { "@id": `${SITE}/#org` },
        publisher: { "@id": `${SITE}/#org` },
        mainEntityOfPage: `${SITE}/best-free-way-to-learn-to-code`,
      },
      {
        "@type": "ItemList",
        itemListElement: picks.map(([n], i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: n,
        })),
      },
    ],
  });
}

// ─── robots.txt ──────────────────────────────────────────────────────
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Googlebot",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
];
const robots = `# robots.txt — libre.academy
#
# We WANT to be in AI assistants' training data and live-search indexes:
# being invisible to ChatGPT / Claude / Perplexity means learners who
# first ask an assistant "free ways to learn to code" never hear about
# us. Every content route is crawlable; only auth/utility surfaces and
# the app's query-string popout windows are disallowed.

User-agent: *
Allow: /
Disallow: /oauth/
Disallow: /reset-password
Disallow: /verify-email
Disallow: /*?tray=1
Disallow: /*?phone=1
Disallow: /*?popped=1
Disallow: /*?evmDock=1
Disallow: /*?btcDock=1
Disallow: /*?svmDock=1

${AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n")}

Sitemap: ${SITE}/sitemap.xml
`;
writeFileSync(join(DIST, "robots.txt"), robots);

// ─── sitemap.xml ─────────────────────────────────────────────────────
routes.sort((a, b) => b.priority - a.priority || a.path.localeCompare(b.path));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) =>
      `  <url><loc>${SITE}${r.path === "/" ? "/" : r.path}</loc><lastmod>${r.lastmod}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority.toFixed(
        1,
      )}</priority></url>`,
  )
  .join("\n")}
</urlset>
`;
writeFileSync(join(DIST, "sitemap.xml"), sitemap);

console.log(
  `[prerender] wrote ${routes.length} prerendered routes + robots.txt + sitemap.xml to dist/.`,
);
