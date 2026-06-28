import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GithubMark } from "../components/icons/GithubMark";
import { useSeo } from "../lib/useSeo";
import { LANGUAGE_COUNT } from "../lib/siteStats";
import "./About.css";

const POINTS = [
  {
    title: "Passive video doesn't make you a programmer.",
    body:
      "You can watch ten hours of someone else writing TypeScript and still freeze when the cursor is in your editor. The fix isn't more videos. It's writing code with a verdict at the end of every file.",
  },
  {
    title: "Random LeetCode is disconnected from the books.",
    body:
      "Algorithm puzzles are useful, but they assume you already know the language. The middle ground — a textbook chapter, then an exercise that uses what the chapter just taught — is where almost no platform lives.",
  },
  {
    title: "AI without structure is a chatbot, not a curriculum.",
    body:
      "ChatGPT and Cursor are great for unblocking yourself. They're terrible at telling you the next thing you should learn. A curriculum has order, ramp-up, hidden tests. A chatbot doesn't know whether you've understood anything.",
  },
  {
    title: "Cloud-only learning platforms break the moment you go offline.",
    body:
      "Get on a flight. Open the app. Watch the spinner. Local-first isn't a stunt — it's how a tool that's supposed to teach you should actually behave.",
  },
];

const PRINCIPLES = [
  {
    title: "Run code, don't simulate it.",
    body:
      "Every supported language has a real runtime. The browser path uses Web Workers + Pyodide + iframes; the desktop path adds subprocess shells. Your code is graded by execution, not pattern matching.",
  },
  {
    title: "Local-first, optional cloud.",
    body:
      "Progress lives on your machine. The AI tutor defaults to a local Ollama instance. Cloud sync is a single toggle for when you want it across devices.",
  },
  {
    title: "Bring your own books.",
    body:
      "The desktop app's ingest pipeline turns PDFs, EPUBs, and docs sites into structured courses with hidden tests. Re-share the result as a portable .academy archive — anyone with Libre can install it in one click.",
  },
  {
    title: "Open source by default.",
    body:
      "MIT licensed. The desktop app, the cloud sync server, the courseware ingest pipeline, and this site are all open. Read the source, fork it, fix it.",
  },
];

export function About() {
  useSeo({
    title: "About Libre Academy — Free Open-Source Interactive Coding Platform",
    description: `Libre Academy is a free, open-source platform for learning to code. No signup, no paywall, no tracking. ${LANGUAGE_COUNT} languages, real editor, hidden tests.`,
    canonicalUrl: "https://libre.academy/about",
  });
  return (
    <div className="about-page">
      <header className="about-hero">
        <div className="about-hero__inner">
          <span className="section__eyebrow">About Libre Academy</span>
          <h1 className="section__title">
            Free, interactive coding courses — built for people who actually
            finish chapters.
          </h1>
          <p className="about-hero__lede">
            Libre Academy is an open source platform for learning to code
            online. We started it because we kept failing to finish technical
            books — reading without doing didn't stick, doing without a
            curriculum didn't ladder, and the platforms that promised both
            wanted our email address and our credit card and our weekends.
            So we built one that doesn't.
          </p>
        </div>
      </header>

      <section className="section about-section">
        <h2 className="section__title">What's wrong with current platforms</h2>
        <div className="about-grid">
          {POINTS.map((p) => (
            <article key={p.title} className="card about-card">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section about-section">
        <h2 className="section__title">What we do differently</h2>
        <div className="about-grid">
          {PRINCIPLES.map((p) => (
            <article key={p.title} className="card about-card about-card--principle">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--narrow about-final">
        <h2 className="section__title section__title--centered">It's free, and it stays free.</h2>
        <p className="section__subtitle section__subtitle--centered">
          The desktop app is free. The cloud sync server is free. The browser
          version is free. There's no upsell. There's no pricing tier we're
          building behind a feature flag. If we ever change our mind, the
          MIT-licensed fork of today's code will still be on GitHub.
        </p>
        <div className="about-final__actions">
          <a
            href="https://github.com/InfamousVague/Libre.academy"
            className="btn btn--ghost btn--lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubMark size={14} /> View on GitHub
          </a>
          <Link to="/courses" className="btn btn--primary btn--lg">
            Browse the courses <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
