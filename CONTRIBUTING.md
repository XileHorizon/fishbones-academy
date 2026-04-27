# Contributing to fishbones.academy

This is the marketing + onboarding site. The actual app lives at
[InfamousVague/Fishbones](https://github.com/InfamousVague/Fishbones).

## What goes here

This repo:
- Marketing copy + visual identity for fishbones.academy
- Catalog browsing UI + course-detail previews (read-only)
- Language overview pages
- Public-facing docs (orientation; not deep architecture docs)
- The `/learn/` embed point (synced from kata, not authored here)

What does NOT go here:
- App features (those live in kata)
- Deep architecture docs (kata's in-app `/docs` route covers those)
- Course content (auto-generated or hand-authored in kata)

## Adding a course

You don't add courses here. Add a `.fishbones` archive to kata's
`src-tauri/resources/bundled-packs/`, then add its id to
`scripts/extract-starter-courses.mjs` over there. Once the new
`manifest.json` lands, copy it into this repo:

```bash
cp /path/to/kata/public/starter-courses/manifest.json src/data/courses-manifest.json
```

If the new course needs a topic / difficulty override (the manifest
itself doesn't carry these — they're curated here for catalog
filtering), edit `src/data/courses.ts` to add an entry to
`TOPIC_OVERRIDES` and `DIFFICULTY_OVERRIDES`.

## Adding a language

Edit `src/data/languages.ts`. The `LanguageId` strings should match
kata's `src/data/types.ts` `LanguageId` union — when kata adds a new
language, mirror it here so the catalog filter works.

## Adding a docs page

Edit `src/data/docs.ts`. Add the page string at the top of the file,
then append it to the appropriate section in the `DOCS` array. Code
fences in the markdown body get Shiki-highlighted via `lib/markdown.ts`
— supported languages are listed at the top of that file. Add a
language id to `SUPPORTED_LANGS` if you need one we don't already
ship.

## Style

- **Copy** — punchy, slightly opinionated, technical readers as the
  audience. No corporate fluff. Match the tone of the existing About
  / Home pages.
- **Visual** — monochrome glass on near-black. Borders are
  `var(--color-border-default)` (low-alpha neutral, never accent-tinted).
  Backdrop-blur sparingly — the bg should still feel solid.
- **Typography** — `var(--font-sans)` (Inter / system) for prose,
  `var(--font-mono)` (SF Mono) for code, language chips, and tabular
  numbers. Hero titles are 800-weight with -0.025em tracking.
- **Spacing** — page sections use the `.section` primitive (96px y-pad,
  1180px max-width). Cards use `--color-bg-secondary` with a 12-14px
  radius.
- **Buttons** — `.btn--primary` (filled, monochrome inversion),
  `.btn--ghost` (outline), `.btn--subtle` (filled tertiary). Avoid
  introducing a fourth variant.

## Type-checking + linting

```bash
npm run build   # tsc -b + vite build, must pass clean
npm run lint    # eslint, should be warning-free
```

Both run in CI on push.

## Rough roadmap

These are explicitly **out of scope for v1** but reasonable
follow-ups:

- Light-theme toggle (just expose a button that flips
  `data-theme="light"` on `<html>`; the base kit handles the rest)
- Per-page Open Graph images (per-route metadata via
  `react-helmet-async` or migrate to a meta-aware framework)
- Search across courses + docs (currently only courses page has
  search; a global ⌘K palette would be nice)
- Per-language detail pages with code samples + idiom highlights
- Newsletter signup (we don't have a list yet, so this is parked)
