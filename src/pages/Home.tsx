import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Sparkles,
  Layers,
  ShieldOff,
  Flame,
  Cpu,
  PlayCircle,
} from "lucide-react";
import { HeroTerminal } from "../components/HeroTerminal";
import { CATALOG } from "../data/courses";
import { LANGUAGES } from "../data/languages";
import "./Home.css";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Reading lessons",
    body:
      "Markdown prose with Shiki syntax highlighting, inline glossary popovers, and a 'You'll learn' card that previews the takeaway before you read.",
  },
  {
    icon: Code2,
    title: "Workbench",
    body:
      "A real Monaco editor (the engine that powers VS Code) wired to per-language test runners. Click Run, get pass/fail, no tab-switching.",
  },
  {
    icon: Layers,
    title: "Challenge packs",
    body:
      "Curated kata-style problem sets per language. Difficulty tags, topic groups, hidden tests. Or generate your own — 20 to 200 in one shot.",
  },
  {
    icon: Cpu,
    title: "AI tutor",
    body:
      "A floating tutor that knows the lesson body, your starter code, and the hidden tests. Default model runs locally via Ollama. No keys, no bills.",
  },
];

const STATS = [
  { value: "16+", label: "Languages" },
  { value: "25", label: "Starter courses" },
  { value: "1,500+", label: "Lessons in browser" },
  { value: "$0", label: "Forever" },
];

const FEATURE_ROWS = [
  {
    eyebrow: "Real runtimes",
    title: "Sixteen languages. One editor. No setup.",
    body:
      "JavaScript and Python run in-browser in a Web Worker (or Pyodide). Rust and Go proxy out to the official playgrounds. C, C++, Java, Kotlin, C#, Swift, and Assembly drive your local toolchain via the desktop app's subprocess shells. The compiler probe runs on app start — if you're missing one, Fishbones offers a one-click brew install.",
    bullets: [
      "Web Workers + Pyodide for JS, TS, Python",
      "Iframe sandboxes for React, Three.js, Svelte, Astro, Solid, HTMX",
      "Hosted compilers for Rust + Go",
      "Native subprocess shells on the desktop app",
    ],
  },
  {
    eyebrow: "Bring your own book",
    title: "Drop a PDF in. Get a course out.",
    body:
      "The desktop build runs your technical books through a Claude-powered ingest pipeline. It chunks chapters, drafts lessons, and generates starter code, hidden tests, and exercises. Every lesson the pipeline produces is verified by running it before it lands in your library — failed validations get demoted to reading lessons, not silently shipped.",
    bullets: [
      "PDF + EPUB ingest with Claude-structured chapter outlines",
      "Auto-generates starter code, solutions, hidden tests, hints",
      "Docs-site crawler turns any HTML reference into a course",
      "Bundle and re-share your course as a portable .fishbones archive",
    ],
  },
  {
    eyebrow: "Local-first",
    title: "No accounts. No cloud. No telemetry.",
    body:
      "Progress lives in SQLite (desktop) or IndexedDB (browser). The AI tutor defaults to a local Ollama instance — Anthropic's API is opt-in. We don't ship analytics. We don't ship error reporters. The sync server is a small, free-to-use companion service for mirroring your XP across machines, and it stores nothing else.",
    bullets: [
      "Free + open source (MIT)",
      "No signup wall, no payment surface",
      "Optional cloud sync — small JSON progress records, opt-in",
      "AI tutor runs against local Ollama by default",
    ],
  },
];

export function Home() {
  const featuredCourses = CATALOG.slice(0, 6);
  const browserLangs = LANGUAGES.filter((l) => l.inBrowser).slice(0, 12);

  return (
    <div className="home">
      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero__inner">
          <div className="home-hero__copy">
            <span className="home-hero__eyebrow">
              <span className="home-hero__pulse" /> Free · open source · runs in your
              browser
            </span>
            <h1 className="home-hero__title">
              Turn any technical book into a course you can ship code in.
            </h1>
            <p className="home-hero__lede">
              Fishbones is an interactive coding course platform. Read prose, write
              code in a real editor, watch hidden tests grade your work, level up.
              Sixteen languages, no setup, no signup wall.
            </p>
            <div className="home-hero__actions">
              <Link to="/courses" className="btn btn--primary btn--lg">
                <PlayCircle size={16} /> Browse courses
                <ArrowRight size={14} />
              </Link>
              <Link to="/download" className="btn btn--ghost btn--lg">
                Get the desktop app
              </Link>
            </div>
            <p className="home-hero__hint">
              17 starter courses. Sample one in your browser without an account.
            </p>
          </div>
          <div className="home-hero__visual">
            <HeroTerminal />
          </div>
        </div>

        {/* ─── Stats strip ────────────────────────────── */}
        <div className="home-stats">
          {STATS.map((s) => (
            <div key={s.label} className="home-stats__item">
              <span className="home-stats__value">{s.value}</span>
              <span className="home-stats__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Feature cards ──────────────────────────────── */}
      <section className="section section--tight" id="features">
        <div className="home-features">
          {FEATURES.map((f) => (
            <article key={f.title} className="card home-features__card">
              <span className="home-features__icon">
                <f.icon size={20} />
              </span>
              <h3 className="home-features__title">{f.title}</h3>
              <p className="home-features__body">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Featured courses ───────────────────────────── */}
      <section className="section">
        <div className="home-row-head">
          <div>
            <span className="section__eyebrow">Curriculum</span>
            <h2 className="section__title">Pick a starter pack and ship code today.</h2>
            <p className="section__subtitle">
              Seventeen courses are already curated and runnable in your
              browser. Languages, frameworks, smart contracts, kata-style
              challenge sets — same shape, same UX, every one of them
              has tests to grade your code.
            </p>
          </div>
          <Link to="/courses" className="btn btn--ghost">
            Browse all courses <ArrowRight size={14} />
          </Link>
        </div>
        <div className="home-courses">
          {featuredCourses.map((c) => (
            <Link key={c.id} to={`/courses/${c.id}`} className="home-courses__card card">
              <div className="home-courses__chip-row">
                <span className="pill pill--mono">{c.languageLabel}</span>
                {c.packType === "challenges" && (
                  <span className="pill">Challenge pack</span>
                )}
              </div>
              <h3 className="home-courses__title">{c.title}</h3>
              <p className="home-courses__meta">
                ~{c.approxLessons} lessons · est. {Math.round(c.approxMinutes / 60)}h
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Long-form feature rows ─────────────────────── */}
      {FEATURE_ROWS.map((row, i) => (
        <section key={row.eyebrow} className="section home-row">
          <div
            className={`home-row__layout${i % 2 === 1 ? " home-row__layout--reverse" : ""}`}
          >
            <div className="home-row__copy">
              <span className="section__eyebrow">{row.eyebrow}</span>
              <h2 className="section__title">{row.title}</h2>
              <p className="home-row__body">{row.body}</p>
              <ul className="home-row__bullets">
                {row.bullets.map((b) => (
                  <li key={b}>
                    <span className="home-row__bullet-dot" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <aside className="home-row__visual">
              {i === 0 && <RuntimeBoard languages={browserLangs} />}
              {i === 1 && <PipelineBoard />}
              {i === 2 && <PrincipleBoard />}
            </aside>
          </div>
        </section>
      ))}

      {/* ─── Final CTA ──────────────────────────────────── */}
      <section className="section section--narrow home-final">
        <h2 className="section__title section__title--centered">
          Pick the next book waiting on your shelf.
        </h2>
        <p className="section__subtitle section__subtitle--centered">
          Sample a course in your browser in 30 seconds. If it clicks, install the
          desktop app and start ingesting your own.
        </p>
        <div className="home-final__actions">
          <Link to="/courses" className="btn btn--primary btn--lg">
            <PlayCircle size={16} /> Browse courses
          </Link>
          <Link to="/download" className="btn btn--ghost btn--lg">
            Get the desktop app <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function RuntimeBoard({ languages }: { languages: typeof LANGUAGES }) {
  return (
    <div className="home-board">
      <div className="home-board__head">
        <span>Runtime</span>
        <span>Where it runs</span>
      </div>
      <div className="home-board__rows">
        {languages.map((l) => (
          <div key={l.id} className="home-board__row">
            <span className="home-board__chip">{l.glyph}</span>
            <span className="home-board__name">{l.name}</span>
            <span className={`home-board__run home-board__run--${l.run}`}>
              {l.run === "browser"
                ? "Browser"
                : l.run === "sandbox"
                  ? "Sandbox"
                  : "Local"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineBoard() {
  return (
    <div className="home-pipeline">
      <div className="home-pipeline__node">
        <BookOpen size={18} />
        <span>Your book</span>
        <small>PDF · EPUB · docs site</small>
      </div>
      <div className="home-pipeline__arrow" aria-hidden>
        <span className="home-pipeline__bead" />
      </div>
      <div className="home-pipeline__node home-pipeline__node--accent">
        <Sparkles size={18} />
        <span>Claude pipeline</span>
        <small>structures + writes exercises</small>
      </div>
      <div className="home-pipeline__arrow" aria-hidden>
        <span className="home-pipeline__bead home-pipeline__bead--delay" />
      </div>
      <div className="home-pipeline__node">
        <Code2 size={18} />
        <span>Course</span>
        <small>chapters · lessons · tests</small>
      </div>
    </div>
  );
}

function PrincipleBoard() {
  const items = [
    { icon: ShieldOff, label: "Zero telemetry", value: "0 events" },
    { icon: Flame, label: "Streaks", value: "1-day grace" },
    { icon: Cpu, label: "AI tutor", value: "Local Ollama" },
    { icon: BookOpen, label: "Source", value: "MIT licensed" },
  ];
  return (
    <div className="home-principles">
      {items.map((it) => (
        <div key={it.label} className="home-principles__item">
          <span className="home-principles__icon">
            <it.icon size={16} />
          </span>
          <span className="home-principles__label">{it.label}</span>
          <span className="home-principles__value">{it.value}</span>
        </div>
      ))}
    </div>
  );
}
