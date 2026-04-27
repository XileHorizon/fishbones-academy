import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, PlayCircle } from "lucide-react";
import { languageBySlug } from "../data/languages";
import { CATALOG } from "../data/courses";
import "./LanguageDetail.css";

export function LanguageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const lang = languageBySlug(slug);

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
          <h1 className="lang-detail__title">{lang.name} on Fishbones</h1>
          <p className="lang-detail__lede">{lang.blurb}</p>
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

      <section className="section">
        <h2 className="section__title">{courses.length} courses tagged {lang.name}</h2>
        <p className="section__subtitle">
          {courses.length === 0
            ? `We don't ship a curated ${lang.name} course in the starter set yet, but the desktop app can ingest one from a PDF in minutes.`
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
