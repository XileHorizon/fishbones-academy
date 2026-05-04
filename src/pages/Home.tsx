import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
import { LANGUAGES } from "../data/languages";
import { ParticleField } from "../components/spotlights/ParticleField";
import { WorkbenchSpotlight } from "../components/spotlights/WorkbenchSpotlight";
import { EvmChainSpotlight } from "../components/spotlights/EvmChainSpotlight";
import { BookCarousel } from "../components/spotlights/BookCarousel";
import "./Home.css";

/// Homepage architecture:
///   1. Hero with specimen plate + ambient ParticleField overlay
///   2. WorkbenchSpotlight  — animated Solidity Counter editor
///   3. EvmChainSpotlight   — replica of the in-app ChainDock with
///                            ticking blocks + animated tx feed.
///                            Threaded to the workbench by referencing
///                            the same Counter contract.
///   4. BookCarousel        — auto-scrolling marquee of every cover
///   5. FEATURES strip      — restyled 4-card grid of headline features
///   6. Long-form rows      — Real runtimes / Bring your own book /
///                            Local-first (kept from the previous
///                            page, restyled to match new aesthetic)
///   7. Final CTA
///
/// (The skill-tree spotlight that previously sat between the
/// EvmChain and BookCarousel was retired — the in-app trees are
/// reachable via the /learn CTA in the hero, and the homepage was
/// quieter without it.)
///
/// Story arc: try → specialise → master → explore → commit. The first
/// three sections show what coding HERE feels like; the carousel
/// shows breadth; the long-form rows give the spec sheet for engaged
/// readers; the CTA closes.

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
      "Real Monaco editor (the engine VS Code runs on) wired to per-language test runners. Click Run, get pass/fail, no tab-switching.",
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
  { value: "26+", label: "Languages" },
  { value: "47", label: "Books on the shelf" },
  { value: "1,500+", label: "Lessons in browser" },
  { value: "$0", label: "Forever" },
];

const FEATURE_ROWS = [
  {
    eyebrow: "Real runtimes",
    title: "Real editor. Twenty-six languages. Zero setup.",
    body:
      "JavaScript and Python run in-browser in a Web Worker (or Pyodide). Solidity compiles via solc-js + executes on an in-process EVM. Rust and Go proxy out to the official playgrounds. C, C++, Java, Kotlin, C#, Swift, Zig and Assembly drive your local toolchain via the desktop app's subprocess shells. The compiler probe runs on app start — if you're missing one, Fishbones offers a one-click brew install.",
    bullets: [
      "Web Workers + Pyodide for JS, TS, Python",
      "@ethereumjs/vm + viem stack for Solidity (in-process, snapshot/revert)",
      "Iframe sandboxes for React, Three.js, Svelte, Astro, Solid, HTMX",
      "Native `zig test` / `cargo test` / `go test` on the desktop app",
    ],
  },
  {
    eyebrow: "Bring your own book",
    title: "Catalogue any book on your shelf.",
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
    title: "Stays on your desk. Stays yours.",
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
  const browserLangs = LANGUAGES.filter((l) => l.inBrowser).slice(0, 12);

  return (
    <div className="home">
      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero__bg" aria-hidden />
        {/* Ambient particle overlay — drifting blue dots that
            respond to the cursor with gentle parallax. Sits between
            the bg artwork and the content layer. Intentionally low
            count (80) so it reads as atmosphere not noise. */}
        <ParticleField className="home-hero__particles" count={80} />

        <div className="home-hero__inner home-hero__inner--single">
          <motion.div
            className="home-hero__copy"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="home-hero__eyebrow">
              <span className="home-hero__pulse" /> A naturalist's field guide to
              code · MIT licensed
            </span>
            <h1 className="home-hero__title">
              Every book has a course inside it. Crack it open.
            </h1>
            <p className="home-hero__lede">
              Fishbones is an interactive coding course platform. Read prose, write
              code in a real editor, watch hidden tests grade your work, level up.
              Twenty-six languages, no setup, no signup wall.
            </p>
            <div className="home-hero__actions">
              <Link to="/learn" className="btn btn--primary btn--lg">
                <PlayCircle size={16} /> Try it now
                <ArrowRight size={14} />
              </Link>
              <Link to="/download" className="btn btn--ghost btn--lg">
                Get the desktop app
              </Link>
            </div>
            <p className="home-hero__hint">
              Forty-seven titles on the shelf. Sample any one without signing up.
            </p>
          </motion.div>
        </div>

        {/* ─── Stats strip ────────────────────────────── */}
        <div className="home-stats">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="home-stats__item"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: "easeOut" }}
            >
              <span className="home-stats__value">{s.value}</span>
              <span className="home-stats__label">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Spotlight 1: Workbench ──────────────────────── */}
      <WorkbenchSpotlight />

      {/* ─── Spotlight 2: Book carousel ──────────────────────
          Promoted up under Workbench so visitors see the breadth
          of the catalog immediately after the "this is what
          coding here feels like" Workbench moment. Old order had
          this last; the new arc reads: editor → shelf → deeper
          tools (EVM / Trees). */}
      <BookCarousel />

      {/* ─── Spotlight 3: EVM chain (replica of in-app ChainDock) ── */}
      <EvmChainSpotlight />

      {/* ─── Feature cards ──────────────────────────────── */}
      <section className="section section--tight" id="features">
        <div className="home-row-head home-row-head--centered">
          <span className="section__eyebrow">What's inside</span>
          <h2 className="section__title section__title--centered">
            Built like the editor you'd use anyway.
          </h2>
        </div>
        <div className="home-features">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              className="card home-features__card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              <span className="home-features__icon">
                <f.icon size={20} />
              </span>
              <h3 className="home-features__title">{f.title}</h3>
              <p className="home-features__body">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ─── Long-form feature rows ─────────────────────── */}
      {FEATURE_ROWS.map((row, i) => (
        <motion.section
          key={row.eyebrow}
          className="section home-row"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
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
        </motion.section>
      ))}

      {/* ─── Final CTA ──────────────────────────────────── */}
      <section className="section section--narrow home-final">
        <h2 className="section__title section__title--centered">
          There's a specimen plate with your name on it.
        </h2>
        <p className="section__subtitle section__subtitle--centered">
          Sample one in 30 seconds. Install the desktop app to ingest your own.
        </p>
        <div className="home-final__actions">
          <Link to="/learn" className="btn btn--primary btn--lg">
            <PlayCircle size={16} /> Try it now
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
