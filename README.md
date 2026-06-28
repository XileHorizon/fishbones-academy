# Libre Academy SEO pass — June 2026

Drop these files into the `fishbones-academy` repo.

## What changed

### Shared SEO / data layer
- `src/lib/seoMeta.ts`
  - one shared title/description/canonical generator layer used by React pages and prerender
  - supports optional per-course / per-language overrides
- `src/lib/siteStats.ts`
  - central live counts: `COURSE_COUNT`, `LANGUAGE_COUNT`, `COURSE_COUNT_ROUNDED`

### Data fixes
- `src/data/types.ts`
  - added manifest fields including `lessonCount`
- `src/data/courses.ts`
  - prefers real manifest `lessonCount` over size heuristic

### React page fixes
- `src/pages/CourseDetail.tsx`
  - now uses shared SEO generators
  - added descriptive internal blog links
- `src/pages/LanguageDetail.tsx`
  - now uses shared SEO generators
  - added descriptive internal blog links
- `src/pages/Courses.tsx`
  - removed stale hardcoded course/language counts
- `src/pages/Languages.tsx`
  - removed stale hardcoded language counts
- `src/pages/Download.tsx`
  - removed stale hardcoded language counts
- `src/pages/About.tsx`
  - removed stale hardcoded language counts
- `src/pages/Home.tsx`
  - uses shared live stats for rendered copy
- `src/components/MoreComparisons.tsx`
  - uses live language count
- `src/lib/useDocumentTitle.ts`
  - homepage fallback title now uses live stats

### Prerender / crawlability
- `scripts/prerender.mjs`
  - loads shared SEO layer via SSR
  - uses live stats instead of stale hardcoded counts
  - removes `SearchAction`
  - adds `ItemList` schema to languages index
  - adds internal links between courses/languages and blog posts
  - emits `/404` → `404.html`
  - uses git-based `lastmod` for sitemap entries where possible

### Template / server
- `index.html`
  - removed obsolete `meta keywords`
  - removed `SearchAction`
  - updated fallback metadata counts
- `deploy/Caddyfile`
  - permanent `www` → apex redirect
  - SPA-only handling for auth/utility routes
  - real 404 handling via prerendered `404.html`

## Verification I ran
- `node --check scripts/prerender.mjs` ✅
- `git diff --check` ✅

## What I could not fully run here
- Full `npm build` / TypeScript project check.
- Reason: this clone does not have `node_modules`, and the repo depends on a local file package at `../../Libs/base`, which is not present in this environment.

## Recommended next commands in the real repo environment
```bash
npm install
npm run build
npm run prerender
```

If build fails, first check whether `../../Libs/base` is available exactly where this repo expects it.
