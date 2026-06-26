/// Per-language landing page — the long-tail SEO surface for
/// queries like "learn Rust online free", "learn Python in
/// browser", "free TypeScript course", etc. One page per
/// language entry × 26 languages = 26 long-tail landers all
/// reusing the same template, all carrying the open-source +
/// no-paywall positioning the homepage establishes.
///
/// SEO strategy on this page:
///   - `<title>` leads with "Learn {Lang} online, free" — verbatim
///     match to the highest-intent query for each language. Suffix
///     keeps the brand for trust.
///   - `<meta description>` repeats the primary value prop ("real
///     editor + hidden tests, no signup, no paywall") with the
///     language name injected so the SERP snippet reads naturally
///     for the query that produced it.
///   - JSON-LD `Course` schema marks the page as a learning
///     resource, which Google uses to surface course-rich SERP
///     features.
///   - Content blocks below the hero answer the two questions a
///     searcher typically has when they land: "how does this run
///     in my browser?" and "what courses do you have for this
///     language?". The catalog grid carries the second answer;
///     a templated "How it runs" block + "Why learn X with Libre"
///     block carry the first.

import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, PlayCircle, Code2, Sparkles } from "lucide-react";
import { languageBySlug } from "../data/languages";
import { CATALOG } from "../data/courses";
import { useSeo } from "../lib/useSeo";
import "./LanguageDetail.css";

export function LanguageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const lang = languageBySlug(slug);

  // useSeo is called BEFORE the early "not found" return so the
  // hook order stays stable across renders. When `lang` is null,
  // we pass an empty tags object so the head goes untouched and
  // the homepage tags remain in place.
  const canonical = lang ? `https://libre.academy/languages/${lang.slug}` : "";
  const seoTitle = lang
    ? `Learn ${lang.name} online, free — open-source course | Libre Academy`
    : "";
  const seoDescription = lang
    ? `Learn ${lang.name} for free with Libre Academy — a real code editor, hidden tests that grade your work, and no signup. Open source and MIT licensed.`
    : "";

  useSeo({
    title: seoTitle || undefined,
    description: seoDescription || undefined,
    canonicalUrl: canonical || undefined,
    ogType: "article",
    jsonLd: lang
      ? {
          "@context": "https://schema.org",
          "@type": "Course",
          name: `Learn ${lang.name} online, free`,
          description: seoDescription,
          provider: {
            "@type": "Organization",
            name: "Libre Academy",
            sameAs: "https://libre.academy/",
          },
          url: canonical,
          inLanguage: "en",
          isAccessibleForFree: true,
          educationalLevel: "Beginner",
          // `learningResourceType: "Course"` is the Google-blessed
          // hint that triggers the Course rich-result treatment.
          learningResourceType: "Course",
          // Listing each in-catalog title as `hasPart` boosts the
          // page's coverage of "{lang} course" queries even when
          // the user lands here instead of /courses.
          hasPart: CATALOG.filter((c) => c.language === lang.id).map((c) => ({
            "@type": "Course",
            name: c.title,
            url: `https://libre.academy/courses/${c.id}`,
          })),
        }
      : undefined,
  });

  if (!lang) {
    return (
      <div className="section section--narrow lang-detail-missing">
        <h1>Language not found.</h1>
        <Link to="/languages" className="btn btn--ghost">
          <ArrowLeft size={14} /> All languages
        </Link>
      </div>
    );
  }

  const courses = CATALOG.filter((c) => c.language === lang.id);
  const runLabel =
    lang.run === "browser"
      ? "Runs in your browser"
      : lang.run === "sandbox"
        ? "Compiles via a hosted playground"
        : "Runs locally on your machine";
  // Verbose "how it runs" copy for the explainer block lower down.
  // Tailored per execution mode so a searcher who lands here from
  // "learn Rust online" gets an instant answer to "wait, where
  // does the code actually run?" without scrolling further.
  const howItRuns =
    lang.run === "browser"
      ? `${lang.name} lessons run entirely inside your browser tab — no install, no toolchain, no network round-trip to grade your code. The editor is the same Monaco engine that powers VS Code, and the hidden tests run in a sandboxed Web Worker.`
      : lang.run === "sandbox"
        ? `${lang.name} compiles via a public sandbox (${lang.runNote?.replace(/[()]/g, "") || "official upstream playground"}) — you write code in the in-browser editor, hit Run, and the compiled output and test results come back in seconds. No local toolchain required.`
        : `${lang.name} needs a real toolchain on your machine, so the in-browser path runs against a small native shim or you can install the Libre desktop app for the full experience. The desktop app is MIT-licensed and works fully offline.`;

  return (
    <div className="lang-detail">
      <header className="lang-detail__hero">
        <div className="lang-detail__hero-inner">
          <Link to="/languages" className="lang-detail__back">
            <ArrowLeft size={14} /> All languages
          </Link>
          <div className="lang-detail__chip-row">
            <span className="languages-card__glyph">{lang.glyph}</span>
            <span className="pill">{runLabel}</span>
            {lang.runNote && <span className="pill pill--mono">{lang.runNote}</span>}
          </div>
          {/* H1: verbatim match to the SEO query ("Learn {lang}
              online, free") so the rendered text mirrors the
              <title> + the JSON-LD course name. Suffix doubles as
              the brand identity inside the page. */}
          <h1 className="lang-detail__title">
            Learn {lang.name} online, free.
          </h1>
          <p className="lang-detail__lede">
            {lang.blurb} {courses.length > 0
              ? `${courses.length} ${courses.length === 1 ? "course" : "courses"} on Libre Academy — open source, no signup, no paywall.`
              : "Open source, no signup, no paywall."}
          </p>
          <div className="lang-detail__actions">
            {lang.inBrowser ? (
              <a href="/learn/" className="btn btn--primary btn--lg">
                <PlayCircle size={16} /> Try {lang.name} in your browser
              </a>
            ) : (
              <Link to="/download" className="btn btn--primary btn--lg">
                Get the desktop app
              </Link>
            )}
            <Link to="/courses" className="btn btn--ghost btn--lg">
              Browse all courses
            </Link>
          </div>
        </div>
      </header>

      {/* "How it runs" explainer — answers the searcher's "where
          does the code actually run?" question without making them
          scroll past the catalog. Templated per execution mode, so
          the answer is concrete (not a generic "in the browser"
          handwave). */}
      <section className="section section--narrow lang-detail__how">
        <div className="lang-detail__how-grid">
          <div className="lang-detail__how-card">
            <span className="lang-detail__how-icon">
              <Code2 size={20} />
            </span>
            <h2 className="lang-detail__how-title">
              How {lang.name} runs on Libre
            </h2>
            <p className="lang-detail__how-body">{howItRuns}</p>
          </div>
          <div className="lang-detail__how-card">
            <span className="lang-detail__how-icon">
              <Sparkles size={20} />
            </span>
            <h2 className="lang-detail__how-title">
              Why learn {lang.name} with Libre
            </h2>
            <p className="lang-detail__how-body">
              Every lesson is hand-crafted prose followed by a real coding
              exercise — hidden tests grade your work the moment you hit Run.
              No signup wall, no email collected, no upsell prompts. The
              entire course catalog and the desktop app are MIT-licensed; if
              you don't like a lesson, fork it.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        {/* H2 carries the {language} keyword again — gives the page
            two strong keyword-bearing headers (H1 + H2) without
            stuffing. */}
        <h2 className="section__title">
          {courses.length === 0
            ? `No starter ${lang.name} courses yet`
            : `${courses.length} ${courses.length === 1 ? "free course" : "free courses"} for ${lang.name}`}
        </h2>
        <p className="section__subtitle">
          {courses.length === 0
            ? `We don't ship a curated ${lang.name} course in the starter set yet, but the desktop app can ingest one from a PDF or docs site in minutes.`
            : `Pick one and start the first lesson without an account.`}
        </p>

        {courses.length > 0 && (
          <div className="courses-grid">
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="card courses-grid__card"
              >
                <div className="courses-grid__top">
                  <span className="pill pill--mono">{c.languageLabel}</span>
                  {c.packType === "challenges" && <span className="pill">Challenges</span>}
                  {c.difficulty && (
                    <span
                      className={`pill courses-grid__diff courses-grid__diff--${c.difficulty}`}
                    >
                      {c.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="courses-grid__title">{c.title}</h3>
                <p className="courses-grid__desc">
                  ~{c.approxLessons} lessons · ~{Math.round(c.approxMinutes / 60)}h
                </p>
                <div className="courses-grid__meta">
                  <span className="courses-grid__cta">
                    Open <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
