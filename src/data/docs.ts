/// Public-facing docs for libre.academy. We author these here
/// rather than re-using kata's in-app docs (src/docs/pages.ts) because
/// the in-app docs are heavy on Tauri-side architecture detail that
/// doesn't fit a "what's Fishbones, how do I use it" surface for
/// marketing visitors. Anything more advanced links into the kata
/// repo's own /docs route inside the app.
///
/// Adding a page = appending an entry to the appropriate section.
/// Markdown bodies are rendered via lib/markdown.ts (Shiki + GFM).

export interface DocPage {
  id: string;
  title: string;
  tagline?: string;
  body: string;
}

export interface DocSection {
  id: string;
  title: string;
  pages: DocPage[];
}

const introduction = `Fishbones is an interactive coding course platform. You read prose,
write code in a real editor, watch hidden tests grade your work, and earn XP
toward a streak that doesn't reset for taking the weekend off.

The same app runs two ways:

- **In your browser**, at [libre.academy/learn](/learn/). Sixteen+
  starter courses, no install, runs against a local IndexedDB.
- **As a desktop app**, distributed for macOS, Linux, and Windows. The
  desktop build adds PDF / EPUB ingestion, native toolchain runners
  for compiled languages, and an optional local Ollama tutor.

Both share the same lesson format and the same UI vocabulary. The
desktop app is just the browser experience plus the parts that need
filesystem access.

## Who this is for

You're already comfortable with one programming language and want to
pick up another, or you have a textbook on your shelf you've been
meaning to actually finish. Passive video courses haven't worked for
you. Random LeetCode problems feel disconnected from the books.
Fishbones is structured like a book — chapters, lessons, exercises —
but every lesson can be run, tested, and graded in-place.

## What's in this docs site

These pages are a quick orientation. The desktop app ships with its
own deeper docs (look for the **Docs** tab in the sidebar) covering
Tauri internals, the ingest pipeline, and the runtime layer. Start
here if you're brand new; jump there once you've installed.
`;

const browser = `The browser version of Fishbones lives at
[/learn/](/learn/). It's the desktop app's frontend running against
IndexedDB for persistence — no server, no account, no telemetry.

## What works in the browser

Anything that can run inside a browser tab:

- **JavaScript / TypeScript** — Web Workers, isolated per-lesson
- **Python** — via Pyodide; first run downloads the runtime (~9MB)
- **Web / React / Three.js / Svelte / SolidJS / HTMX / Astro / Bun** —
  iframe sandboxes with HMR-like reloads
- **Rust + Go** — proxied to play.rust-lang.org and play.golang.org
- **React Native** — react-native-web with a phone-shaped preview

## What doesn't

Compiled languages that need a system toolchain — **C, C++, Java,
Kotlin, C#, Swift, Assembly** — are desktop-only. The browser cannot
spawn child processes, so there's nothing to run them against. The
catalog page marks each language clearly so you don't get surprised
opening a course you can't finish in-tab.

## Saving progress

Lesson completions, your XP, and the streak counter all live in
IndexedDB on the device you're using. There's no cloud sync from the
browser variant — install the desktop app + sign in to get progress
mirrored across machines.
`;

const desktop = `The desktop app gives you the full Fishbones — every language
runtime, the ingest pipeline that turns books into courses, and the
local AI tutor.

## Install

Grab the latest build from [GitHub Releases](https://github.com/InfamousVague/Fishbones/releases/latest).
Pick the bundle for your OS:

- **macOS** — \`.dmg\` (Apple Silicon + Intel universal)
- **Windows** — \`.msi\`
- **Linux** — \`.AppImage\` or \`.deb\`

## First launch

Fishbones unpacks the bundled starter packs into your data dir and
opens the Library. Pick a course, start the first lesson, and the
sidebar populates with the chapter tree.

## What the desktop adds over the browser

- **PDF / EPUB ingest** — drop any technical book in, get a
  Claude-structured course out
- **Docs-site crawler** — point at a documentation URL, generate a
  course from the structure
- **Challenge pack generator** — synthesize 20-200 exercises in any
  language with a slider for cost
- **Native toolchain runners** — C, C++, Java, Kotlin, C#, Swift,
  Assembly all execute via subprocess shells
- **Local AI tutor** — Ollama-backed; the floating fish character
  knows your lesson context and never sends a token to anyone else's
  server

## Optional cloud sync

Fishbones offers a free, optional cloud sync to mirror your progress,
XP, and streak across machines. It's off by default — you opt in via
**Settings → Sign in**. The sync server stores only the small
JSON-shaped progress record; lesson contents stay on disk.

The desktop app is **free** and **open source** (MIT). There is no
paid tier.
`;

const lessons = `Every Fishbones lesson is one of four shapes. Each one rewards
differently; the totals add up to your level.

## Reading

Markdown prose with syntax-highlighted code blocks, callouts (Note /
Tip / Warning / Example), inline glossary popovers, and an optional
"You'll learn" objectives card at the top. Reading lessons grant 5 XP
on completion.

## Exercise

Split-pane: prose on the left, a Monaco editor + console on the right.
The editor opens with starter code; hidden tests grade your pass/fail
when you click Run. Hints reveal progressively. The Solution button
shows the reference answer if you give up. 20 XP.

## Quiz

A small batch of multiple-choice and short-answer questions with
inline explanations after you commit. Used for checkpoint
comprehension between dense chapters. 10 XP.

## Mixed

A reading lesson with an exercise tucked at the end — when the prose
and the practice are tightly coupled. 20 XP.

## Streaks + XP

XP rolls up to levels via a triangular curve: \`level N\` requires
\`N × (N + 1) / 2 × 10\` cumulative XP. Streaks are calendar-day
counters with a one-day grace window — miss two days and the streak
resets. Take the weekend off; pick up Monday; streak intact.

The streak fire and XP bar live in the sidebar. They never gate
content — every lesson is unlocked from the start.
`;

const editor = `The editor is a real Monaco instance — the same engine that powers
VS Code. Every lesson with code gets:

- **Syntax highlighting** that matches the active theme
- **In-language IntelliSense** for the languages Monaco supports
  natively (JS, TS, Python, JSON, HTML, CSS)
- **Per-language linting / type errors** where applicable
- **Multi-file workbenches** — each file is a tab, and any file that
  matches the lesson's primary language gets concatenated for runs

## Running the code

The **Run** button executes your current code against the lesson's
hidden test file. Results land in the console pane below the editor:

\`\`\`
✓ sumList([1, 2, 3]) === 6
✓ sumList([]) === 0
✓ sumList([-1, -2]) === -3

3 / 3 passed · 12ms
\`\`\`

A passing run marks the lesson complete and advances the streak.

## Pop-out workbench

The editor has a pop-out button that opens it as a separate window.
Useful on multi-monitor setups: one screen for the prose, one for the
code. Both windows stay synchronized as you type.
`;

const themes = `Fishbones ships **17 themes**. The default is **Fishbones Dark** —
a monochrome glass treatment we use across the desktop app and this
site. The other 16 are faithful (or close-to) ports of popular VS
Code themes:

- Synthwave, Tokyo Night, Catppuccin (Latte / Frappé / Macchiato /
  Mocha), Rosé Pine, Ayu (Light / Mirage / Dark), Ubuntu Dark, Claude
  Code Dark, Absent Contrast, Vesper, Word, Fishbones Light.

Picking a theme repaints both the chrome AND Monaco's syntax
highlighting — the editor never disagrees with the rest of the UI.

Switch via **Settings → Theme** in the desktop app. The browser
variant uses the system preference for now (a per-tab toggle is on
the roadmap).
`;

const offline = `Fishbones is **local-first**. By default:

- Every course is a JSON file on disk (or in IndexedDB in the browser)
- Progress, XP, and streak counters live in SQLite (desktop) /
  IndexedDB (browser)
- The AI tutor runs against a **local Ollama** instance — zero tokens
  billed, no cloud round-trip
- There is **no telemetry**. No analytics, no error reporters, no
  outbound calls beyond the playground proxies and an optional
  cloud-sync toggle

## What does talk to a server?

A small set of **opt-in** things:

- **The Anthropic backend** for the AI tutor, if you flip it on under
  Settings (the local Ollama path stays default)
- **Cloud sync**, if you sign in — small JSON progress records,
  nothing else
- **The Rust + Go playgrounds** at play.rust-lang.org and
  play.golang.org, since neither toolchain ships with Fishbones

Everything else — including PDF ingest, lesson rendering, code
execution for the in-browser languages — runs entirely on your
machine.
`;

export const DOCS: DocSection[] = [
  {
    id: "start",
    title: "Get started",
    pages: [
      {
        id: "introduction",
        title: "Introduction",
        tagline: "What Fishbones is, and who it's for.",
        body: introduction,
      },
      {
        id: "browser",
        title: "Run it in your browser",
        tagline: "Sixteen+ starter courses, no install.",
        body: browser,
      },
      {
        id: "desktop",
        title: "Install the desktop app",
        tagline: "The full version with ingest + native runtimes.",
        body: desktop,
      },
    ],
  },
  {
    id: "using",
    title: "Using Fishbones",
    pages: [
      {
        id: "lessons",
        title: "Lesson kinds",
        tagline: "Reading, Exercise, Quiz, Mixed.",
        body: lessons,
      },
      {
        id: "editor",
        title: "The editor + workbench",
        tagline: "Monaco, multi-file, pop-out.",
        body: editor,
      },
      {
        id: "themes",
        title: "Themes",
        tagline: "17 ports of popular palettes.",
        body: themes,
      },
    ],
  },
  {
    id: "principles",
    title: "Principles",
    pages: [
      {
        id: "offline",
        title: "Local-first by default",
        tagline: "What runs offline, what doesn't.",
        body: offline,
      },
    ],
  },
];

export const DOCS_INDEX = new Map<string, DocPage>();
for (const section of DOCS) {
  for (const page of section.pages) DOCS_INDEX.set(page.id, page);
}

export function findDocPage(id: string): DocPage | undefined {
  return DOCS_INDEX.get(id);
}
