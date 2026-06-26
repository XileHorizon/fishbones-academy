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
  Download,
} from "lucide-react";
import { LANGUAGES } from "../data/languages";
import { CATALOG } from "../data/courses";

/// Live course count, derived from the bundled manifest. Used in
/// the hero H1 + stats so the page never claims a stale number;
/// the manifest is regenerated on every `sync:courses` run.
const COURSE_COUNT = CATALOG.length;
/// Round-down headline number for the stats strip so the value
/// stays stable across small catalog churn (e.g. 92 → 91 → 92
/// shouldn't ripple through the page; "90+" reads the same).
const COURSE_COUNT_ROUNDED = `${Math.floor(COURSE_COUNT / 10) * 10}+`;
import { ParticleField } from "../components/spotlights/ParticleField";
import { WorkbenchSpotlight } from "../components/spotlights/WorkbenchSpotlight";
import { EvmChainSpotlight } from "../components/spotlights/EvmChainSpotlight";
import { BookCarousel } from "../components/spotlights/BookCarousel";
import { CodecademyComparison } from "../components/CodecademyComparison";
import { LandingEditor } from "../components/LandingEditor";
import "./Home.css";

/// Homepage architecture:
///   1. Hero (SEO H1: "Free interactive coding courses…") with
///      LibreHeader.png + ambient ParticleField overlay
///   2. WorkbenchSpotlight  — animated in-browser code editor demo
///   3. BookCarousel        — auto-scrolling marquee of every course
///   4. EvmChainSpotlight   — replica of the in-app ChainDock
///   5. FEATURES strip      — interactive lessons / editor / hidden
///                            tests / AI tutor (Codecademy-comparable
///                            head terms tuned for the same query
///                            family)
///   6. Long-form rows      — Runs in your browser / Bring your own
///                            book / Free + open source
///   7. Final CTA           — "Start learning free"
///
/// SEO strategy: lead with the head term ("Free interactive coding
/// courses") in the <title>, H1, og:title and og:description so
/// Google sees consistent topical signal. Body copy expands on the
/// differentiator (26 languages, in-browser editor, hidden tests,
/// open source, no signup wall) — the things Codecademy /
/// freeCodeCamp / Scrimba can't all claim simultaneously.
///
/// Story arc: hook (free + interactive) → proof (editor demo +
/// course breadth + advanced runtimes) → spec sheet (why it's
/// different from the other free-courses sites) → CTA.

/// Feature cards target the "what do I get when I sign up?" question
/// that visitors land with after a "learn to code free" search. Each
/// card pairs the SEO-friendly head term ("Interactive lessons",
/// "In-browser code editor", "Hidden test grading", "AI tutor") with
/// a body that says HOW it works rather than just what it is. The
/// vocabulary deliberately mirrors what Codecademy / freeCodeCamp /
/// Scrimba listings use — so a query like "interactive code editor
/// online free" is more likely to surface the right card.
const FEATURES = [
  {
    icon: BookOpen,
    title: "Interactive lessons",
    body:
      "Read short prose chunks with syntax-highlighted snippets, inline glossary popovers, and a 'You'll learn' card up front so you know what's coming. Every lesson ends in a hands-on exercise — no passive video watching.",
  },
  {
    icon: Code2,
    title: "In-browser code editor",
    body:
      "A real Monaco editor (the engine VS Code is built on) opens next to every lesson. Click Run, see test output instantly. No tab-switching, no localhost setup, no Docker.",
  },
  {
    icon: Layers,
    title: "Hidden-test grading",
    body:
      "Hundreds of curated coding exercises across 26 languages, each with hidden tests that pass-or-fail your work the same way a real interview screen does. Difficulty tags, topic groups, instant feedback.",
  },
  {
    icon: Cpu,
    title: "Free AI tutor",
    body:
      "A floating tutor reads the lesson, your code, and the hidden tests so it can answer in context. Defaults to a local Ollama model — no API keys, no usage bills, no signup wall.",
  },
];

/// Stat strip sits under the hero. Numbers compete with Codecademy's
/// homepage ("50+ million learners") not on raw scale but on the
/// stuff Codecademy can't claim: more languages, browser-native,
/// free forever. Headline numbers stay rounded so they don't look
/// stale between releases.
const STATS = [
  { value: "26+", label: "Languages covered" },
  { value: COURSE_COUNT_ROUNDED, label: "Free courses" },
  { value: "1,500+", label: "Interactive lessons" },
  { value: "$0", label: "No paywall, ever" },
];

const FEATURE_ROWS = [
  {
    eyebrow: "Runs in your browser",
    title: "Twenty-six programming languages. Zero installs.",
    body:
      "JavaScript, TypeScript and Python run in-browser via Web Workers and Pyodide. Solidity compiles with solc-js and executes on an in-process EVM. Rust and Go proxy to the official playgrounds. C, C++, Java, Kotlin, C#, Swift, Zig and Assembly run on your local toolchain through the optional desktop app — and if a compiler is missing, Libre Academy offers a one-click install.",
    bullets: [
      "JavaScript, TypeScript, Python — Web Workers + Pyodide",
      "Solidity + EVM smart contracts — full in-browser chain",
      "React, Three.js, Svelte, Astro, Solid, HTMX — sandboxed iframes",
      "Rust, Go, C, C++, Java, Kotlin, C#, Swift, Zig, Assembly — desktop",
    ],
  },
  {
    eyebrow: "Bring your own book",
    title: "Turn any technical book into a course.",
    body:
      "The optional desktop app runs technical books and docs sites through a Claude-powered ingest pipeline. It chunks chapters, drafts interactive lessons, and generates starter code, hidden tests, and worked solutions. Every generated lesson is verified by running it before it lands in your library — failed validations demote to reading lessons rather than silently ship.",
    bullets: [
      "Import PDF + EPUB — Claude structures the chapter outline",
      "Auto-generates starter code, solutions, hidden tests, hints",
      "Docs-site crawler turns any HTML reference into a course",
      "Bundle + re-share your course as a portable .academy file",
    ],
  },
  {
    eyebrow: "Free + open source",
    title: "No paywall. No signup wall. No data harvesting.",
    body:
      "Libre Academy is free forever — MIT licensed, no premium tier, no upsell. Progress lives in your browser's IndexedDB (or SQLite on the desktop app). The AI tutor defaults to a local Ollama model so your conversations stay on your machine. No analytics, no error reporters, no tracking pixels. Sign up only if you want to sync XP between devices — and even then, all we store is a tiny JSON progress record.",
    bullets: [
      "Free forever — MIT licensed source on GitHub",
      "No account required to learn — sample any course in 30 seconds",
      "Optional cloud sync — just XP + completion timestamps",
      "AI tutor defaults to local Ollama, never a third-party API",
    ],
  },
];

export function Home() {
  const browserLangs = LANGUAGES.filter((l) => l.inBrowser).slice(0, 12);

  return (
    <div className="home">
      {/* ─── Hero ──────────────────────────────────────────
          Layered top-to-bottom:
            1. Particle field — ambient drifting dots
            2. LibreHeader.png — the ribbon-snake brand artwork,
               centered as the hero centerpiece
            3. Eyebrow → headline → lede → CTAs → hint
            4. Stats strip
          The artwork carries the visual identity; the copy
          underneath delivers the value prop without fighting it. */}
      <section className="home-hero">
        {/* Ambient particle overlay — drifting blue dots that
            respond to the cursor with gentle parallax. Sits behind
            the artwork + content. Intentionally low count (80) so
            it reads as atmosphere not noise. */}
        <ParticleField className="home-hero__particles" count={80} />

        <div className="home-hero__inner home-hero__inner--stacked">
          {/* Header artwork removed pending an SEO + copy rework.
              The hero now leads with the eyebrow / H1 / lede so the
              first-paint LCP element is text (faster, better Core
              Web Vitals) and the headline carries the brand instead
              of an oversized image competing with it. The particle
              field above + the typography below carry the visual
              identity in the meantime. */}
          <motion.div
            className="home-hero__copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          >
            <span className="home-hero__eyebrow">
              <span className="home-hero__pulse" /> Open source · Free forever ·
              MIT licensed
            </span>
            {/* H1: declarative claim leading with the primary
                keyword "learn to code free" (verbatim match to
                <title> + og:title — Google weights cross-element
                consistency). Second sentence packs the two
                differentiator numbers (courses + languages) into
                the headline so even a clipped SERP preview carries
                the proof. Period after "free" is intentional — the
                no-nonsense voice doesn't sell, it asserts. */}
            <h1 className="home-hero__title">
              Learn to code, free. {COURSE_COUNT_ROUNDED} courses, 26 languages,
              zero paywall.
            </h1>
            <p className="home-hero__lede">
              Real editor. Hidden tests grade your code. Twenty-six languages
              in your browser, hand-crafted courses, MIT-licensed end to end.
              The open-source alternative to Codecademy — no signup, no email,
              no upsell.
            </p>
            <div className="home-hero__actions">
              <a href="/learn" className="btn btn--primary btn--lg">
                <PlayCircle size={16} /> Start learning free
                <ArrowRight size={14} />
              </a>
              {/* Secondary CTA is the desktop-app download path —
                  the hybrid story is a real moat vs Codecademy's
                  web-only product. /download owns OS detection +
                  the per-platform release lookup. */}
              <Link to="/download" className="btn btn--ghost btn--lg">
                <Download size={16} /> Download the desktop app
              </Link>
            </div>
            <p className="home-hero__hint">
              No credit card. No email. Sample any course in 30 seconds.
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

      {/* ─── Landing editor demo (lazy Monaco) ──────────────
          Sits right under the hero so the first scroll already
          puts the visitor face-to-face with real code in a real
          editor. The component renders a skeleton until it
          scrolls into view; Monaco's 3 MB chunk only fetches
          when the user nears the section. */}
      <LandingEditor />

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

      {/* ─── "Why Libre vs Codecademy" comparison ───────────
          3-column table (Libre / Codecademy Free / Codecademy
          Pro) + a "No paywall, ever" pull-quote closer. Sits
          here after the editor + catalog spotlights so the
          reader has the proof in mind before they hit the
          honest, row-by-row comparison. */}
      <CodecademyComparison />

      {/* ─── Feature cards ──────────────────────────────── */}
      <section className="section section--tight" id="features">
        <div className="home-row-head home-row-head--centered">
          <span className="section__eyebrow">What you get, for free</span>
          {/* H2 mirrors the H1 head term ("interactive coding
              courses") to reinforce topical relevance for that
              query family. Subtitle below carries the differentiator
              ("real editor, hidden tests") so the section reads as
              "here's why it's different from other free-courses
              sites" not just "here are some features." */}
          <h2 className="section__title section__title--centered">
            Everything you need to learn to code online — free.
          </h2>
          <p className="section__subtitle section__subtitle--centered">
            Interactive lessons, a real in-browser code editor, and
            hidden-test grading on every exercise. No signup. No upsell.
          </p>
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
          Start learning to code — free, today.
        </h2>
        <p className="section__subtitle section__subtitle--centered">
          Twenty-six languages, forty-seven courses, fifteen-hundred-plus
          interactive lessons. No signup, no credit card. Just pick a course and
          start writing code.
        </p>
        <div className="home-final__actions">
          <a href="/learn" className="btn btn--primary btn--lg">
            <PlayCircle size={16} /> Start learning free
          </a>
          <Link to="/courses" className="btn btn--ghost btn--lg">
            Browse all courses <ArrowRight size={14} />
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
