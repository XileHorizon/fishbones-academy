import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, ArrowRight } from "lucide-react";
import {
  CATALOG,
  COURSE_DIFFICULTIES,
  COURSE_TOPICS,
  type CourseDifficulty,
  type CourseTopic,
} from "../data/courses";
import { LANGUAGES } from "../data/languages";
import "./Courses.css";

type AnyId = string | "all";

/// Catalog page — Codecademy/Exercism-style filtered grid of all 25
/// starter packs. Three filter axes (language, topic, difficulty) plus a
/// keyword search across titles + language labels. State is local — no
/// query-string sync for v1, intentionally; the catalog is a discovery
/// surface, not a deeply linkable filter view.
export function Courses() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<AnyId>("all");
  const [topic, setTopic] = useState<AnyId>("all");
  const [difficulty, setDifficulty] = useState<AnyId>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((c) => {
      if (language !== "all" && c.language !== language) return false;
      if (topic !== "all" && c.topic !== topic) return false;
      if (difficulty !== "all" && c.difficulty !== difficulty) return false;
      if (q) {
        const hay = `${c.title} ${c.languageLabel} ${c.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, language, topic, difficulty]);

  const hasFilters =
    query !== "" || language !== "all" || topic !== "all" || difficulty !== "all";

  // Languages with at least one course in the catalog. We don't show
  // language chips for languages we have no courses for — keeps the
  // filter row honest.
  const filterableLanguages = useMemo(() => {
    const seen = new Set(CATALOG.map((c) => c.language));
    return LANGUAGES.filter((l) => seen.has(l.id));
  }, []);

  const languageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of CATALOG) counts.set(c.language, (counts.get(c.language) ?? 0) + 1);
    return counts;
  }, []);

  const topicCounts = useMemo(() => {
    const counts = new Map<CourseTopic, number>();
    for (const c of CATALOG) counts.set(c.topic, (counts.get(c.topic) ?? 0) + 1);
    return counts;
  }, []);

  return (
    <div className="courses-page">
      <header className="courses-page__head section section--narrow">
        <span className="section__eyebrow">Catalogue</span>
        <h1 className="section__title">
          Seventeen starter courses, ready to ship code in.
        </h1>
        <p className="section__subtitle">
          Linear textbooks, framework deep-dives, and kata-style challenge
          packs. Every one of them runs in your browser today — open the
          embedded preview and start the first lesson without an account.
        </p>
      </header>

      <section className="section courses-page__body">
        {/* ─── Filters ─────────────────────────────────── */}
        <div className="courses-filters">
          <div className="courses-filters__search">
            <Search size={14} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, languages, ids…"
              aria-label="Search courses"
            />
            {query && (
              <button
                type="button"
                className="courses-filters__search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <FilterRow label="Topic">
            <FilterPill
              label={`All  ${CATALOG.length}`}
              active={topic === "all"}
              onClick={() => setTopic("all")}
            />
            {COURSE_TOPICS.map((t) => {
              const count = topicCounts.get(t.id) ?? 0;
              if (count === 0) return null;
              return (
                <FilterPill
                  key={t.id}
                  label={`${t.label}  ${count}`}
                  active={topic === t.id}
                  onClick={() => setTopic(t.id)}
                />
              );
            })}
          </FilterRow>

          <FilterRow label="Language">
            <FilterPill
              label="All"
              active={language === "all"}
              onClick={() => setLanguage("all")}
            />
            {filterableLanguages.map((l) => {
              const count = languageCounts.get(l.id) ?? 0;
              return (
                <FilterPill
                  key={l.id}
                  label={`${l.name}  ${count}`}
                  active={language === l.id}
                  onClick={() => setLanguage(l.id)}
                />
              );
            })}
          </FilterRow>

          <FilterRow label="Difficulty">
            <FilterPill
              label="Any"
              active={difficulty === "all"}
              onClick={() => setDifficulty("all")}
            />
            {COURSE_DIFFICULTIES.map((d) => (
              <FilterPill
                key={d.id}
                label={d.label}
                active={difficulty === d.id}
                onClick={() => setDifficulty(d.id as CourseDifficulty)}
              />
            ))}
          </FilterRow>

          {hasFilters && (
            <div className="courses-filters__reset">
              <button
                type="button"
                className="btn btn--subtle btn--sm"
                onClick={() => {
                  setQuery("");
                  setLanguage("all");
                  setTopic("all");
                  setDifficulty("all");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* ─── Result count ────────────────────────────── */}
        <div className="courses-page__count">
          <span>
            {filtered.length === CATALOG.length
              ? `Showing all ${CATALOG.length} courses`
              : `${filtered.length} of ${CATALOG.length} courses`}
          </span>
        </div>

        {/* ─── Grid ────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="courses-empty">
            <h3>No courses match.</h3>
            <p>Drop a filter or two and we'll find something.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="courses-grid__card"
              >
                {/* Bookshelf-style cover — full 2:3 portrait paperback
                    rather than a cropped landscape band. The whole
                    composition is visible (cartouche, flourishes,
                    insignia, etc. — the artwork is too detailed to
                    waste on a 5:3 crop). A subtle paperback drop-shadow
                    + inner edge highlight sells the "book on a shelf"
                    feel without leaning on a literal wood-grain prop.
                    Cover synced from kata into /starter-courses/<id>.jpg
                    by scripts/sync-starter-courses.mjs. */}
                <div
                  className={`courses-grid__cover courses-grid__cover--lang-${c.language}`}
                >
                  {c.cover && (
                    <img
                      className="courses-grid__cover-img"
                      src={`/starter-courses/${c.cover}`}
                      alt=""
                      loading="lazy"
                      draggable={false}
                    />
                  )}
                  {c.packType === "challenges" && (
                    <span className="courses-grid__cover-flag">Challenges</span>
                  )}
                </div>
                {/* Shelf line — fakes the lip of a wooden shelf the
                    book is standing on. Gradient strip rather than a
                    full prop so it stays in the design's visual
                    register (subtle, naturalist) instead of looking
                    like an iBooks skin. */}
                <div className="courses-grid__shelf" aria-hidden />
                <div className="courses-grid__body">
                  <div className="courses-grid__chips">
                    <span className="pill pill--mono">{c.languageLabel}</span>
                    {c.difficulty && (
                      <span
                        className={`pill courses-grid__diff courses-grid__diff--${c.difficulty}`}
                      >
                        {c.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="courses-grid__title">{c.title}</h3>
                  <div className="courses-grid__meta">
                    <span>~{c.approxLessons} lessons</span>
                    <span>·</span>
                    <span>~{Math.round(c.approxMinutes / 60)}h</span>
                    <span className="courses-grid__cta">
                      Open <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="courses-filters__row">
      <span className="courses-filters__label">{label}</span>
      <div className="courses-filters__pills">{children}</div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`pill${active ? " pill--solid" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
