# libre.academy

Marketing + onboarding site for [Libre](https://github.com/InfamousVague/Fishbones) — the
interactive coding course platform that turns any technical book into a course.
(The GitHub repo is still named `Fishbones` — that's the project's pre-rebrand
identifier and is left alone to keep links stable.)

This repo is the **standalone** `libre.academy` site. It's separate from:

- `InfamousVague/Fishbones` (the Libre desktop app + browser variant — the actual product)
- `InfamousVague/mattssoftware` (the personal-portfolio site that also embeds Libre)

The site has no dependency on the Matt's-Software framing — libre.academy is its own
marketing surface.

## What's in here

```
src/
  components/   Nav, Footer, HeroTerminal, GithubMark, ScrollToTop
  data/         courses-manifest.json, courses.ts, languages.ts, docs.ts, types.ts
  lib/          markdown.ts (Shiki + markdown-it renderer)
  pages/        Home, Courses, CourseDetail, Languages, LanguageDetail,
                Download, About, Docs, Privacy, Terms, NotFound
  styles/       global.css, tokens.css, md-body.css

public/
  fishbones.png         Brand mark (mirrors kata's /public/fishbones.png)
  favicon.png           Same image, used as favicon
  learn/                ⚠ Synced from kata's dist-web/ — gitignored
  starter-courses/      ⚠ Synced from kata's public/starter-courses/ — gitignored

scripts/
  sync-learn.mjs              Build kata's web variant, copy dist-web/ → public/learn/
  sync-starter-courses.mjs    Copy kata's starter-courses/ → public/starter-courses/

deploy/
  Caddyfile                   Production Caddy site block

.github/workflows/
  deploy.yml                  Build site + sync to VPS
```

## Tech stack

- **Vite 8 + React 19 + TypeScript** — same shape as `mattssoftware`
- **react-router-dom v7** — client-side routing
- **lucide-react** — iconography (with one inline SVG for the GitHub mark
  since lucide v1 dropped brand icons)
- **markdown-it + shiki** — markdown rendering with `github-dark`-themed
  code fences
- **@mattmattmattmatt/base** — design-token CSS, linked via
  `file:../../Libs/base` from `/Users/matt/Development/Libs/base/`. Don't
  copy primitives — link the lib like mattssoftware does.

## Local dev

```bash
# 1. Install deps
npm install

# 2. (Optional) Sync the embedded learn app + starter-course JSONs
#    from your local kata checkout. If kata isn't around, the build
#    still works — /learn/ shows a stub and course detail pages
#    show "preview unavailable".
npm run sync:learn      # builds kata's web variant + stages it
npm run sync:courses    # copies starter-courses JSON

# 3. Run the dev server
npm run dev

# 4. Verify the production build is clean
npm run build           # tsc + vite build
npm run preview
```

The site auto-detects the kata checkout at `../../Apps/kata` (the typical
`/Development/{Apps,Web}` layout). Override via `FISHBONES_SRC=/path/to/kata`.

## Embedded learn app (`/learn/*`)

The browser variant of Fishbones lives at `libre.academy/learn/`. It's a
separate Vite app inside the kata repo (`npm run build:web` produces
`dist-web/`), copied verbatim into `public/learn/`. The Caddyfile in this
repo rewrites deep `/learn/*` paths back to `/learn/index.html` so kata's
own React Router handles routing within the embed.

## Course catalogue

The catalog reads two sources:

- `src/data/courses-manifest.json` — embedded into the JS bundle. Mirrors
  kata's `public/starter-courses/manifest.json`. Drives the catalog grid
  even when starter-courses aren't synced.
- `public/starter-courses/<id>.json` — full course JSON, fetched on demand
  by the course detail page for the sample-lesson preview.

If the manifest in kata changes, copy the new file:

```bash
cp /Users/matt/Development/Apps/kata/public/starter-courses/manifest.json src/data/courses-manifest.json
```

(Or write a tiny sync script if it shifts more than once a quarter.)

## Build pipeline (CI)

`.github/workflows/deploy.yml` does this on push to `main`:

1. Checkout this repo
2. Checkout `InfamousVague/Fishbones` and `InfamousVague/base`
3. Symlink base into `/home/runner/work/Libs/base/` so the file: dep
   resolves
4. `npm ci` here, `npm ci` in kata
5. `npm run sync:learn` (builds kata's web variant + stages
   `public/learn/`)
6. `npm run sync:courses` (copies starter-courses JSON)
7. `npm run build`
8. rsync `dist/` → `root@149.28.120.197:/var/www/fishbones-academy/`

The VPS sync step needs a `VPS_SSH_PASSWORD` repo secret; see
`AGENT_REPORT.md` for the secret setup commands.

## Hosting layout

- **Vultr VPS** (`149.28.120.197`) — same machine as `mattssoftware.com` and
  `tap.mattssoftware.com`. Caddy serves both sites from
  `/var/www/<site>/` with per-domain blocks.
- **DNS** — `libre.academy` (apex) + `www.libre.academy` should
  point at the VPS A record. Caddy issues a Let's Encrypt cert
  automatically once the DNS resolves.

## License

MIT. The site source, the desktop app source, and the cloud sync server
source are all open. See [Fishbones on GitHub](https://github.com/InfamousVague/Fishbones).
