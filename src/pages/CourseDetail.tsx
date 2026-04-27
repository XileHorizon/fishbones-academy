import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code2,
  Download as DownloadIcon,
  ExternalLink,
  FileText,
  Layers,
  PlayCircle,
} from "lucide-react";
import { fetchFullCourse, findCatalogCourse } from "../data/courses";
import type { CourseChapter, CourseLesson, FullCourse } from "../data/types";
import { renderMarkdown, truncateMarkdown } from "../lib/markdown";
import {
  fishbonesOpenUrl,
  hasFishbonesInstalled,
  openInFishbones,
} from "../lib/openInFishbones";
import "./CourseDetail.css";

const KIND_LABEL: Record<CourseLesson["kind"], string> = {
  reading: "Reading",
  exercise: "Exercise",
  mixed: "Mixed",
  quiz: "Quiz",
};

const KIND_ICON: Record<CourseLesson["kind"], typeof BookOpen> = {
  reading: BookOpen,
  exercise: Code2,
  mixed: Layers,
  quiz: FileText,
};

type CourseFetchState =
  | { kind: "loading"; id: string }
  | { kind: "loaded"; id: string; course: FullCourse | null };

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const catalogEntry = id ? findCatalogCourse(id) : undefined;

  // Pair the loaded course with the id it was fetched for so a
  // mid-flight route change can't race in stale data. The render
  // logic only treats a `loaded` state as authoritative when ids
  // match.
  const [fetchState, setFetchState] = useState<CourseFetchState>(() => ({
    kind: "loading",
    id: id ?? "",
  }));
  const [previewHtml, setPreviewHtml] = useState<{ id: string; html: string } | null>(
    null,
  );

  // Tri-state install hint. Read once from localStorage on mount and
  // refresh after every "Open in Fishbones" click so a successful
  // probe in this session immediately promotes the deep-link CTA
  // without a page reload.
  const [hasApp, setHasApp] = useState<boolean | null>(() =>
    hasFishbonesInstalled(),
  );

  // Re-poll the flag when the page becomes visible again. Covers the
  // "user clicked Open, was bounced into the app, came back to this
  // tab" cycle — the localStorage flag was set inside openInFishbones
  // but our React state hasn't refreshed.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const cur = hasFishbonesInstalled();
      setHasApp((prev) => (prev !== cur ? cur : prev));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchFullCourse(id).then((c) => {
      if (cancelled) return;
      setFetchState({ kind: "loaded", id, course: c });
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Reset fetch state when the route id changes. Doing this in an
  // effect would trigger a render-then-clear flicker; using
  // `useMemo` with the id as the key gives us a synchronous reset.
  const activeFetchState: CourseFetchState =
    fetchState.id === id ? fetchState : { kind: "loading", id: id ?? "" };

  const course = activeFetchState.kind === "loaded" ? activeFetchState.course : null;
  const loading = activeFetchState.kind === "loading";

  // Find the first reading lesson and render its body via Shiki. We
  // truncate at ~1800 chars so the preview stays scannable; the full
  // body is in the embedded learn app.
  const firstReading = useMemo(() => firstReadingLesson(course), [course]);

  useEffect(() => {
    if (!firstReading?.body || !id) return;
    let cancelled = false;
    renderMarkdown(truncateMarkdown(firstReading.body)).then((html) => {
      if (!cancelled) setPreviewHtml({ id, html });
    });
    return () => {
      cancelled = true;
    };
  }, [firstReading, id]);

  // Treat the previewHtml as valid only if it matches the current id.
  const activePreviewHtml = previewHtml && previewHtml.id === id ? previewHtml.html : null;

  if (!catalogEntry) {
    return (
      <div className="section section--narrow course-detail-missing">
        <h1>Course not found.</h1>
        <p>That course id isn't in the catalog.</p>
        <Link to="/courses" className="btn btn--ghost">
          <ArrowLeft size={14} /> Back to catalog
        </Link>
      </div>
    );
  }

  const chapters = course?.chapters ?? [];
  const lessonCount =
    chapters.reduce((acc, ch) => acc + ch.lessons.length, 0) ||
    catalogEntry.approxLessons;
  const exerciseCount = chapters.reduce(
    (acc, ch) =>
      acc + ch.lessons.filter((l) => l.kind === "exercise" || l.kind === "mixed").length,
    0,
  );
  const readingCount = chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.kind === "reading").length,
    0,
  );
  const quizCount = chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.kind === "quiz").length,
    0,
  );

  return (
    <div className="course-detail">
      <header className="course-detail__hero">
        <div className="course-detail__hero-inner">
          <Link to="/courses" className="course-detail__back">
            <ArrowLeft size={14} /> All courses
          </Link>
          {/* Cover art on the hero — same JPEG the catalog grid
              uses, but rendered as a tall portrait thumbnail
              alongside the chips/title block instead of the
              landscape band the catalog cards have. The mobile
              breakpoint stacks the cover on top. */}
          <div className="course-detail__hero-row">
            {catalogEntry.cover && (
              <div
                className={`course-detail__cover course-detail__cover--lang-${catalogEntry.language}`}
              >
                <img
                  src={`/starter-courses/${catalogEntry.cover}`}
                  alt=""
                  loading="lazy"
                  draggable={false}
                />
              </div>
            )}
            <div className="course-detail__hero-text">
              <div className="course-detail__hero-chips">
                <span className="pill pill--mono">{catalogEntry.languageLabel}</span>
                {catalogEntry.packType === "challenges" && (
                  <span className="pill">Challenge pack</span>
                )}
                {catalogEntry.difficulty && (
                  <span
                    className={`pill courses-grid__diff courses-grid__diff--${catalogEntry.difficulty}`}
                  >
                    {catalogEntry.difficulty}
                  </span>
                )}
              </div>
              <h1 className="course-detail__title">{catalogEntry.title}</h1>
          <p className="course-detail__lede">
            {course?.description && course.description.length > 30
              ? course.description
              : catalogEntry.packType === "challenges"
                ? `A curated set of ${catalogEntry.languageLabel} kata problems with hidden tests grading each one. Difficulty tiers from easy to hard, organised by topic.`
                : `A linear ${catalogEntry.languageLabel} course with reading lessons, hands-on exercises, and quizzes — every lesson runnable in your browser.`}
          </p>
          <div className="course-detail__hero-actions">
            {/* Open-in-app CTA. Promoted to primary when we've seen
                this device successfully open the desktop app before
                (localStorage flag set after a confirmed visibilitychange
                during the deep-link probe). First-time visitors see
                "Start in browser" as the primary so the worst case is
                always one click into a working preview, not a dialog
                they have to dismiss. */}
            {hasApp === true ? (
              <>
                <button
                  type="button"
                  className="btn btn--primary btn--lg"
                  onClick={() => void openInFishbones(catalogEntry.id)}
                >
                  <ExternalLink size={16} /> Open in Fishbones
                </button>
                <a
                  href={`/learn/?courseId=${encodeURIComponent(catalogEntry.id)}`}
                  className="btn btn--ghost btn--lg"
                >
                  <PlayCircle size={14} /> Start in browser
                </a>
              </>
            ) : (
              <>
                <a
                  href={`/learn/?courseId=${encodeURIComponent(catalogEntry.id)}`}
                  className="btn btn--primary btn--lg"
                >
                  <PlayCircle size={16} /> Start in your browser{" "}
                  <ArrowRight size={14} />
                </a>
                <button
                  type="button"
                  className="btn btn--ghost btn--lg"
                  onClick={() => void openInFishbones(catalogEntry.id)}
                  title="Requires the desktop app — installs from the Download page"
                >
                  <ExternalLink size={14} /> Open in Fishbones
                </button>
              </>
            )}
          </div>
          <div className="course-detail__stats">
            <Stat label="Lessons" value={lessonCount.toString()} />
            <Stat label="Exercises" value={(exerciseCount || "—").toString()} />
            <Stat label="Reading" value={(readingCount || "—").toString()} />
            <Stat label="Quizzes" value={(quizCount || "—").toString()} />
            <Stat
              label="Est. time"
              value={`${Math.round(catalogEntry.approxMinutes / 60)}h`}
            />
          </div>
            </div>
          </div>
        </div>
      </header>

      <section className="section course-detail__body">
        <div className="course-detail__layout">
          {/* ─── Main column: outline + preview ─────────── */}
          <main className="course-detail__main">
            <div className="course-detail__panel">
              <h2 className="course-detail__panel-title">What you'll learn</h2>
              <ul className="course-detail__objectives">
                {(() => {
                  const fromCourse = course ? deriveObjectives(course) : [];
                  const items =
                    fromCourse.length > 0
                      ? fromCourse
                      : objectivePlaceholders(catalogEntry.languageLabel);
                  return items.map((o, i) => <li key={i}>{o}</li>);
                })()}
              </ul>
            </div>

            <div className="course-detail__panel">
              <h2 className="course-detail__panel-title">Sample lesson</h2>
              {loading && (
                <p className="course-detail__hint">Loading first lesson…</p>
              )}
              {!loading && !course && (
                <p className="course-detail__hint">
                  Preview unavailable. Run <code>npm run sync:courses</code> to stage
                  the full course JSON locally, or open the course in the browser
                  build to read the first lesson.
                </p>
              )}
              {firstReading && (
                <div className="course-detail__preview">
                  <h3 className="course-detail__preview-title">{firstReading.title}</h3>
                  {activePreviewHtml ? (
                    <div
                      className="md-body"
                      dangerouslySetInnerHTML={{ __html: activePreviewHtml }}
                    />
                  ) : (
                    <div className="course-detail__hint">Rendering preview…</div>
                  )}
                  <div className="course-detail__preview-fade" />
                  <a
                    href={`/learn/?courseId=${encodeURIComponent(catalogEntry.id)}`}
                    className="btn btn--primary"
                  >
                    Read the full lesson <ArrowRight size={14} />
                  </a>
                </div>
              )}
            </div>

            {chapters.length > 0 && (
              <div className="course-detail__panel">
                <h2 className="course-detail__panel-title">Outline</h2>
                <ChapterOutline
                  chapters={chapters}
                  courseId={catalogEntry.id}
                />
              </div>
            )}
          </main>

          {/* ─── Sidebar: meta + CTA ────────────────────── */}
          <aside className="course-detail__sidebar">
            <div className="course-detail__sidebar-card">
              <h3 className="course-detail__sidebar-title">Open this course</h3>
              <p className="course-detail__sidebar-body">
                Sample it in your browser, or install the desktop app for
                ingestion + native runtimes.
              </p>
              <a
                href={`/learn/?courseId=${encodeURIComponent(catalogEntry.id)}`}
                className="btn btn--primary btn--lg course-detail__sidebar-btn"
              >
                <PlayCircle size={14} /> Start in browser
              </a>
              <button
                type="button"
                className="btn btn--ghost btn--lg course-detail__sidebar-btn"
                onClick={() => void openInFishbones(catalogEntry.id)}
              >
                <ExternalLink size={14} /> Open in Fishbones
              </button>
              {/* Soft "no app yet?" affordance — only shows when we
                  haven't seen the desktop app respond on this device.
                  Stays out of the way for users who already have it. */}
              {hasApp !== true && (
                <Link
                  to="/download"
                  className="course-detail__sidebar-hint"
                >
                  <DownloadIcon size={11} /> Don't have it? Download Fishbones
                </Link>
              )}
            </div>

            <div className="course-detail__sidebar-card">
              <h3 className="course-detail__sidebar-title">Prerequisites</h3>
              <p className="course-detail__sidebar-body">
                {catalogEntry.difficulty === "advanced"
                  ? `Comfort with another language plus a working knowledge of ${catalogEntry.languageLabel}. Each lesson assumes you can read code without hand-holding.`
                  : catalogEntry.difficulty === "intermediate"
                    ? `Comfort with at least one programming language. ${catalogEntry.languageLabel}-specific syntax is taught from scratch.`
                    : `None — every concept is introduced when it's first used. Some prior coding experience helps but isn't required.`}
              </p>
            </div>

            <div className="course-detail__sidebar-card">
              <h3 className="course-detail__sidebar-title">Lesson kinds</h3>
              <ul className="course-detail__kind-list">
                {(["reading", "exercise", "mixed", "quiz"] as const).map((k) => {
                  const count =
                    chapters.reduce(
                      (acc, ch) => acc + ch.lessons.filter((l) => l.kind === k).length,
                      0,
                    ) || (k === "reading" ? Math.floor(lessonCount / 2) : null);
                  if (count === null || count === 0) return null;
                  const Icon = KIND_ICON[k];
                  return (
                    <li key={k}>
                      <Icon size={13} /> {KIND_LABEL[k]} <span>·</span>{" "}
                      <strong>{count}</strong>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ChapterOutline({
  chapters,
  courseId,
}: {
  chapters: CourseChapter[];
  courseId: string;
}) {
  // Cap at the first 6 chapters with their first 4 lessons each so the
  // outline stays scannable. The full course is one click away.
  const trimmed = chapters.slice(0, 6);
  return (
    <ol className="course-detail__chapters">
      {trimmed.map((ch, ci) => (
        <li key={ch.id} className="course-detail__chapter">
          <header className="course-detail__chapter-head">
            <span className="course-detail__chapter-num">
              {String(ci + 1).padStart(2, "0")}
            </span>
            <h4>{ch.title || `Chapter ${ci + 1}`}</h4>
            <span className="course-detail__chapter-count">
              {ch.lessons.length} lessons
            </span>
          </header>
          <ul className="course-detail__lessons">
            {ch.lessons.slice(0, 4).map((l) => {
              const Icon = KIND_ICON[l.kind];
              return (
                <li key={l.id} className="course-detail__lesson">
                  <Icon size={12} />
                  <span>{l.title}</span>
                  <span
                    className={`course-detail__lesson-kind course-detail__lesson-kind--${l.kind}`}
                  >
                    {KIND_LABEL[l.kind]}
                  </span>
                  {/* Per-lesson "Open" actions, hover-revealed so they
                      don't compete with the lesson title's hierarchy.
                      Two flavours, mirroring the page-level CTAs:
                        - browser: /learn/?courseId=…&lessonId=…  (always
                          works, opens the embedded web app)
                        - fishbones://: deep-link into the desktop app,
                          falls through with no harm if the scheme isn't
                          registered (browser shows its handler dialog,
                          user dismisses, page is unchanged) */}
                  <a
                    className="course-detail__lesson-action course-detail__lesson-action--browser"
                    href={`/learn/?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(l.id)}`}
                    title="Open this lesson in the browser"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PlayCircle size={11} />
                  </a>
                  <a
                    className="course-detail__lesson-action course-detail__lesson-action--app"
                    href={fishbonesOpenUrl(courseId, l.id)}
                    title="Open this lesson in the Fishbones desktop app"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={11} />
                  </a>
                </li>
              );
            })}
            {ch.lessons.length > 4 && (
              <li className="course-detail__lesson course-detail__lesson--more">
                +{ch.lessons.length - 4} more
              </li>
            )}
          </ul>
        </li>
      ))}
      {chapters.length > trimmed.length && (
        <li className="course-detail__chapter course-detail__chapter--more">
          + {chapters.length - trimmed.length} more chapters
        </li>
      )}
    </ol>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="course-detail__stat">
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

function firstReadingLesson(course: FullCourse | null): CourseLesson | null {
  if (!course) return null;
  for (const ch of course.chapters) {
    for (const l of ch.lessons) {
      if ((l.kind === "reading" || l.kind === "mixed") && l.body) return l;
    }
  }
  return null;
}

function deriveObjectives(course: FullCourse): string[] {
  // Aggregate lesson titles into a 4-item "you'll learn" — best-effort
  // when no objectives metadata is on the course root. Picks distinct
  // chapter topics so the list reads as a course summary, not a lesson
  // dump.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ch of course.chapters) {
    if (ch.title && !seen.has(ch.title)) {
      seen.add(ch.title);
      out.push(`Work through ${ch.title.toLowerCase()}.`);
    }
    if (out.length >= 4) break;
  }
  return out.length > 0 ? out : [];
}

function objectivePlaceholders(language: string): string[] {
  return [
    `Pick up ${language} fundamentals through hands-on, gradeable lessons.`,
    "Run real code in a real editor — Monaco + hidden tests.",
    "Earn XP on every pass, build a streak you don't lose to weekends.",
    "Take what you learn into your own projects on the same machine.",
  ];
}
