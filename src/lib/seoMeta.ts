/// Shared SEO metadata layer for libre.academy.
///
/// WHY THIS EXISTS
/// ---------------
/// Title strings, meta descriptions, and canonical URLs were previously
/// duplicated: each React page had inline strings in its `useSeo()` call,
/// and `scripts/prerender.mjs` had its own separate templates. When course
/// counts, lesson counts, or copy changed, both had to be updated in sync.
/// They weren't — Courses.tsx once claimed "47 courses" while the catalog
/// had 90+; language and course detail titles differed between the client
/// and the prerendered snapshot Google actually indexes.
///
/// This module is the single source of truth. It is:
///   - Imported directly by React pages (for live `useSeo()` calls).
///   - Loaded via `vite.ssrLoadModule()` by `scripts/prerender.mjs`
///     (so the prerendered HTML uses the same strings at build time).
///
/// OVERRIDES
/// ---------
/// `COURSE_OVERRIDES` and `LANGUAGE_OVERRIDES` let you hand-craft a
/// title / description / H1 for a specific course or language without
/// changing the generated defaults for everything else. An empty map means
/// everything is generated.
///
/// PUBLIC URL
const SITE = "https://libre.academy";
export { SITE };

// ─── override maps ───────────────────────────────────────────────────────────

/// Per-course overrides keyed by CourseManifestEntry.id. Any field you
/// supply replaces the generated default for that course only.
export const COURSE_OVERRIDES: Record<
  string,
  Partial<{ title: string; description: string; h1: string }>
> = {
  // Example — uncomment and fill in:
  // "javascript-for-beginners": {
  //   title: "JavaScript for Beginners — 38 lessons, free | Libre Academy",
  //   description: "Learn JavaScript from scratch in 38 hands-on lessons ...",
  // },
};

/// Per-language overrides keyed by Language.id.
export const LANGUAGE_OVERRIDES: Record<
  string,
  Partial<{ title: string; description: string; h1: string }>
> = {};

// ─── minimal shapes ──────────────────────────────────────────────────────────
// Pure functions — callers pass in the data they already hold. No imports
// from the data layer, so there are no circular dependencies and these
// functions work identically in the browser, in SSR, and in the prerender
// Node script.

export interface CourseSeoInfo {
  id: string;
  title: string;
  languageLabel: string;
  topic: string;
  approxLessons: number;
}

export interface LanguageSeoInfo {
  id: string;
  name: string;
  blurb: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function courseKind(topic: string): string {
  if (topic === "challenges") return "challenge pack";
  if (topic === "tracks") return "learning track";
  if (topic === "frameworks") return "framework course";
  if (topic === "web3") return "Web3 course";
  if (topic === "mobile") return "mobile course";
  if (topic === "graphics") return "graphics course";
  return "course";
}

// ─── course SEO ──────────────────────────────────────────────────────────────

export function courseSeoTitle(c: CourseSeoInfo): string {
  return (
    COURSE_OVERRIDES[c.id]?.title ??
    `${c.title} — free ${c.languageLabel} ${courseKind(c.topic)} | Libre Academy`
  );
}

export function courseSeoDescription(c: CourseSeoInfo): string {
  return (
    COURSE_OVERRIDES[c.id]?.description ??
    `Learn ${c.languageLabel} for free with ${c.title} on Libre Academy — ` +
      `${c.approxLessons} interactive, test-graded lessons. No paywall, no sign-up.`
  );
}

export function courseSeoH1(c: CourseSeoInfo): string {
  return COURSE_OVERRIDES[c.id]?.h1 ?? c.title;
}

export function courseCanonical(id: string): string {
  return `${SITE}/courses/${id}`;
}

// ─── language SEO ────────────────────────────────────────────────────────────

export function languageSeoTitle(l: LanguageSeoInfo): string {
  return (
    LANGUAGE_OVERRIDES[l.id]?.title ??
    `Learn ${l.name} free online — interactive courses | Libre Academy`
  );
}

export function languageSeoDescription(
  l: LanguageSeoInfo,
  courseCount: number,
): string {
  if (LANGUAGE_OVERRIDES[l.id]?.description) {
    return LANGUAGE_OVERRIDES[l.id]!.description!;
  }
  const coursePart =
    courseCount > 0
      ? ` — ${courseCount} free ${l.name} course${courseCount > 1 ? "s" : ""}`
      : "";
  return (
    `Learn ${l.name} for free on Libre Academy${coursePart}. ` +
    `${l.blurb} Real code editor, hidden tests, no paywall, no sign-up.`
  );
}

export function languageSeoH1(l: LanguageSeoInfo): string {
  return LANGUAGE_OVERRIDES[l.id]?.h1 ?? `Learn ${l.name} for free`;
}

export function languageCanonical(slug: string): string {
  return `${SITE}/languages/${slug}`;
}
