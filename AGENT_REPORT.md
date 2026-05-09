# Agent build report

Project scaffolded at `/Users/matt/Development/Web/fishbones-academy/`. Build
passes clean (`tsc -b && vite build`); eslint passes with no warnings; the
embedded learn app + starter-course JSONs sync correctly from the kata
checkout.

This is what's done, what's stubbed, and what you still need to do
yourself.

---

## What got built

### Pages (all 10 from the brief)

| Route | File | Notes |
|-|-|-|
| `/` | `src/pages/Home.tsx` | Hero with animated 3-stage terminal (book → pipeline → lesson). Stats strip. 4 feature cards. Featured-courses row. 3 long-form feature sections (runtimes / ingest / principles), each with a custom visual. Final CTA. |
| `/courses` | `src/pages/Courses.tsx` | All 25 starter packs in a filterable grid. Filters: search, topic (Languages/Frameworks/Mobile/Web3/Graphics/Challenges), language (only langs with ≥1 course shown), difficulty. Empty + reset states. |
| `/courses/:id` | `src/pages/CourseDetail.tsx` | Hero with chips, lessons/exercises/reading/quizzes/time stats. "What you'll learn" + sample-lesson markdown preview (Shiki-highlighted) + chapter outline (first 6 chapters × 4 lessons each). Sticky right sidebar with CTAs, prerequisites, lesson-kind counts. |
| `/languages` | `src/pages/Languages.tsx` | 20 language cards bucketed by execution mode (Browser / Sandbox / Desktop only). Each card shows glyph, run target, blurb, course count. |
| `/languages/:slug` | `src/pages/LanguageDetail.tsx` | Per-language landing — hero + filtered courses grid for that language. |
| `/learn/*` | (Caddy rewrite + `public/learn/`) | Synced from kata's `dist-web/` via `npm run sync:learn`. The marketing nav doesn't render on this path because it's served as plain static files (the dev server handles it via `public/`). |
| `/download` (and `/pricing`) | `src/pages/Download.tsx` | Three-tier card row (Browser / Desktop / Cloud sync — all free). Per-platform download grid with live release lookup against the GitHub API. Falls back gracefully when offline. |
| `/about` | `src/pages/About.tsx` | Manifesto. "What's wrong with current platforms" + "What we do differently" cards, opinionated copy. |
| `/docs/*` | `src/pages/Docs.tsx` | Sidebar + content layout, Shiki-rendered markdown, prev/next pager, mobile-collapsing sidebar. Six pages covering Get-started / Using / Principles. |
| `/privacy`, `/terms` | `src/pages/Privacy.tsx`, `src/pages/Terms.tsx` | Plain-language stubs framed around "open source, local-first, sync is opt-in". |

### Visual identity

- Dark monochrome palette pulled directly from kata's `default-dark` theme
  (`#09090b` / `#13131a` / `#fafafa`). Tokens layered over the base kit's
  `tokens.css` so anything from `@mattmattmattmatt/base` keeps working.
- `src/styles/global.css` defines `.section`, `.btn--primary/--ghost/--subtle`,
  `.card`, `.pill`, `.pill--solid`, `.pill--mono` primitives reused
  everywhere.
- `src/styles/md-body.css` matches kata's `LessonReader.css` prose
  treatment (headings, code chips, GFM tables, Shiki code blocks).
- `lucide-react` for icons; the GitHub Octocat is an inline SVG in
  `src/components/icons/GithubMark.tsx` because lucide v1 dropped brand
  icons.
- Hero terminal in `src/components/HeroTerminal.tsx` is 100% real DOM
  (no canvas/SVG). Three stages cross-fade every 4.5s.

### Data + content

- `src/data/courses-manifest.json` — bundle-embedded copy of kata's
  starter-course manifest (25 entries). Drives the catalog grid even
  when starter-courses haven't been synced yet.
- `src/data/courses.ts` — derives topic + difficulty buckets from
  manifest entries (manifest itself doesn't carry these). Lazy-fetches
  the full course JSON from `/starter-courses/<id>.json` for the
  detail page.
- `src/data/languages.ts` — 20 language entries with run mode + glyph
  + blurb. The `id` strings match kata's `LanguageId` union.
- `src/data/docs.ts` — six hand-authored docs pages (intro / browser /
  desktop / lessons / editor / themes / offline). Public-facing
  orientation, not deep architecture (the in-app docs cover that).
- `src/lib/markdown.ts` — markdown-it + Shiki, fine-grained per-lang
  imports so the bundle ships only the 24 grammars we actually use.

### Build pipeline

- `package.json` has `build`, `build:embed`, `sync:learn`, `sync:courses`
  scripts.
- `scripts/sync-learn.mjs` — runs `npm run build:web` in the kata
  checkout (auto-resolved at `../../Apps/kata`, overridable via
  `FISHBONES_SRC`), copies `dist-web/` → `public/learn/`. Has a
  `--use-existing` flag for when kata's already built.
- `scripts/sync-starter-courses.mjs` — copies kata's
  `public/starter-courses/` → ours.
- `.github/workflows/deploy.yml` — clone + symlink + `sync:learn` +
  `sync:courses` + `npm run build` + rsync to the VPS. **Not
  triggered yet** — needs your DNS + secrets first (see below).
- `deploy/Caddyfile` — production site block with `/learn/*` rewrite
  and a `/starter-courses/*` cache header. Drop into the same Caddy
  config as `mattssoftware.com`.

### Dev experience

- `npm run dev` — Vite dev server.
- `npm run build` — `tsc -b && vite build` (passes clean).
- `npm run lint` — eslint (passes clean).
- `npm run preview` — Vite preview of the built `dist/`.

---

## What's stubbed / partial

1. **`/learn/` embed.** The build pipeline syncs kata's `dist-web/` but
   the directory is gitignored — your CI run is what populates it. For
   local dev, `npm run sync:learn --use-existing` copies the existing
   build over from `/Users/matt/Development/Apps/kata/dist-web/`.
2. **Course detail sample lessons.** The "Sample lesson" preview
   renders only when `public/starter-courses/<id>.json` is present. If
   you skip `sync:courses`, the panel falls back to a "Preview
   unavailable, run sync:courses" hint. Same fallback in production
   if Caddy can't find the JSON.
3. **GitHub releases lookup.** `/download` calls
   `api.github.com/repos/InfamousVague/Fishbones/releases/latest` on
   mount. Rate-limited per IP, but a 60/h unauthenticated quota is
   plenty for marketing traffic. Falls back to a generic "Latest
   release" link if the API call fails.
4. **Docs depth.** Six pages covering basics. Anything more advanced
   (Tauri internals, ingest pipeline, runtime layer) is intentionally
   left to kata's in-app `/docs` route — the marketing site shouldn't
   duplicate the engineering docs.
5. **No light theme toggle.** The `data-theme` attr is fixed to `dark`
   in `App.tsx`. Adding a toggle is a small lift — the base kit's
   `tokens.css` already defines a light variant, so a button that
   flips the attribute is enough.
6. **No global search.** The catalog page has search; nothing else
   does. A ⌘K palette across courses + docs would be a natural v1.1.
7. **No Open Graph image.** Currently points at `favicon.png` for
   `og:image`, which is fine but a proper 1200×630 social card would
   help.

Roadmap explicitly skipped per the brief: blog, paid tiers,
accounts/login, Discord widgets, complex search, newsletter signup.

---

## What you need to do next

In rough order:

### 1. Create the GitHub repo + push

```bash
cd /Users/matt/Development/Web/fishbones-academy
git add -A
git commit -m "Initial scaffold of libre.academy"

# Then in your browser or via gh:
gh repo create InfamousVague/fishbones-academy --public --source=. --remote=origin --push
```

The CI workflow assumes `InfamousVague/fishbones-academy`; if you put
it under a different org, edit `.github/workflows/deploy.yml`'s VPS
secret comment + the README.

### 2. Set up secrets

```bash
# Same VPS password as mattssoftware.com (and the tap relay)
gh secret set VPS_SSH_PASSWORD \
  --repo InfamousVague/fishbones-academy \
  --body '<password from /Users/matt/Development/Web/mattssoftware/DEPLOY.md>'
```

That's the only secret the workflow needs. The kata + base checkouts
go through the public-repo path (no PAT required).

### 3. DNS

Buy `libre.academy` (likely Gandi if you keep the existing
registrar setup) and point both records at the VPS:

```
libre.academy.       A   149.28.120.197
www.libre.academy.   A   149.28.120.197
```

Drop the TTL to 300s for the first hour, then back to 3600s after
propagation.

### 4. Caddy on the VPS

```bash
ssh root@149.28.120.197
mkdir -p /var/www/fishbones-academy
# Append the contents of deploy/Caddyfile to /etc/caddy/Caddyfile
# (or include it from a per-site .caddy file)
systemctl reload caddy
```

Caddy will request a Let's Encrypt cert as soon as DNS resolves.

### 5. First deploy

Once DNS is up:

```bash
gh workflow run deploy.yml \
  --repo InfamousVague/fishbones-academy \
  --field embed_fishbones=true
```

The first run takes ~3-4 min (kata's npm install + build dominates).
Subsequent runs cache the kata `node_modules` and the
`vendor/pyodide/starter-courses` artifacts; expect ~90s.

### 6. Optional — wire kata's repository_dispatch

Edit kata's `.github/workflows/notify-marketing.yml` (or whatever
file already pings mattssoftware) to also fire at this repo:

```yaml
- name: Notify libre.academy
  run: |
    gh api repos/InfamousVague/fishbones-academy/dispatches \
      -f event_type=fishbones-updated
```

That way a kata commit redeploys the marketing site within minutes
without waiting for the nightly cron.

### 7. Verify

After deploy, open these and confirm they all 200:

```
https://libre.academy/                    # Home
https://libre.academy/courses             # Catalog
https://libre.academy/courses/javascript-crash-course  # Detail
https://libre.academy/languages           # Lang overview
https://libre.academy/languages/python    # Per-lang
https://libre.academy/download            # Get started
https://libre.academy/about               # Manifesto
https://libre.academy/docs                # Auto-redirects to docs/start/introduction
https://libre.academy/learn/              # Embedded app
https://libre.academy/starter-courses/javascript-crash-course.json  # JSON 200, Cache-Control header
https://libre.academy/privacy
https://libre.academy/terms
```

---

## Things I'd have done differently with more time

1. **Per-route metadata.** Right now `index.html` ships one `<title>` /
   `<meta description>` set. A meta-aware framework (Astro, Remix) or
   `react-helmet-async` would let me give each page a real OG card.
   Punted because it's a substantive lift and v1 doesn't desperately
   need it.
2. **Course covers.** kata's extract script intentionally skips covers
   to keep the static deploy under control. For the marketing site we
   could generate small (400px) cover thumbnails in the sync script
   and ship them — would make the catalog grid feel less templated.
3. **A real "Try this lesson" preview.** Right now the course-detail
   sample shows the first reading lesson's markdown. A more powerful
   version would let the user actually run the first exercise lesson
   inline (not as a full embed, just a tiny standalone Monaco). I
   mocked that out and decided the right home for it is the embedded
   `/learn/` app — duplicating Monaco bundles in the marketing chunk
   doesn't earn its weight.
4. **Better filter UX on `/courses`.** The reset button works but a
   deep-linked `?language=python&topic=frameworks` filter URL would be
   nicer for sharing. Easy to add later — `useSearchParams` from
   `react-router-dom`.
5. **A `/changelog` page.** Pulls from GitHub releases via the same
   API call `/download` already makes. Cheap to add once the
   downloads page is real.
6. **Light-theme toggle.** All the tokens are already there, just
   need the toggle. 30 minutes of work.
7. **A real OG image.** The `og:image` should be a 1200×630 card with
   the wordmark + "Turn any technical book into a course you can ship
   code in." Trivial to draw + drop in `public/og.png`.

None of those are blocking — the site as it stands is shippable.
Good luck on the launch.
