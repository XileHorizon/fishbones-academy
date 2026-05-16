import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DOCS, findDocPage, type DocPage } from "../data/docs";
import { renderMarkdown } from "../lib/markdown";
import "./Docs.css";

/// Docs route — sidebar nav on the left, rendered markdown on the right.
/// We re-use markdown.ts (Shiki) so doc code blocks have the same look
/// as course-detail previews.
export function Docs() {
  const { page: pageParam } = useParams<{ section: string; page: string }>();
  const navigate = useNavigate();

  // Default to the first page of the first section if the user lands on
  // /docs without an explicit page id. Redirect (replace) so the URL
  // bar reflects the resolved page.
  const fallback = DOCS[0]?.pages[0];
  const active: DocPage | undefined = pageParam ? findDocPage(pageParam) : fallback;

  useEffect(() => {
    if (!pageParam && fallback) {
      navigate(`/docs/${DOCS[0].id}/${fallback.id}`, { replace: true });
    }
  }, [pageParam, fallback, navigate]);

  // Pair rendered HTML with the page id it was rendered for so route
  // transitions don't render stale content from the previous page.
  const [renderedHtml, setRenderedHtml] = useState<{ id: string; html: string } | null>(
    null,
  );

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    renderMarkdown(active.body).then((rendered) => {
      if (!cancelled) setRenderedHtml({ id: active.id, html: rendered });
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const html =
    active && renderedHtml && renderedHtml.id === active.id ? renderedHtml.html : null;

  // Build a flat ordered list of pages for prev/next navigation.
  const flat = useMemo(() => DOCS.flatMap((s) => s.pages.map((p) => ({ section: s, page: p }))), []);
  const idx = flat.findIndex((f) => f.page.id === active?.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="docs">
      <div className="docs__layout">
        <aside className="docs__sidebar" aria-label="Docs navigation">
          <Link to="/" className="docs__back">
            <ArrowLeft size={12} /> Home
          </Link>
          {DOCS.map((section) => (
            <div key={section.id} className="docs__sidebar-section">
              <h3 className="docs__sidebar-title">{section.title}</h3>
              <ul>
                {section.pages.map((p) => (
                  <li key={p.id}>
                    <NavLink
                      to={`/docs/${section.id}/${p.id}`}
                      className={({ isActive }) =>
                        `docs__sidebar-link${isActive ? " docs__sidebar-link--active" : ""}`
                      }
                      title={p.tagline}
                    >
                      {p.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="docs__sidebar-foot">
            <a
              href="https://github.com/InfamousVague/Libre.academy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source on GitHub →
            </a>
          </div>
        </aside>

        <main className="docs__main">
          {!active && (
            <div>
              <h1 className="section__title">Page not found.</h1>
              <p className="section__subtitle">Try a page from the sidebar.</p>
            </div>
          )}
          {active && (
            <article className="docs__article">
              <header className="docs__article-head">
                <h1>{active.title}</h1>
                {active.tagline && <p className="docs__article-tagline">{active.tagline}</p>}
              </header>
              {html === null ? (
                <div className="docs__skeleton">
                  <span /> <span /> <span /> <span />
                </div>
              ) : (
                <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
              )}
              <nav className="docs__pager" aria-label="Page navigation">
                {prev ? (
                  <Link
                    to={`/docs/${prev.section.id}/${prev.page.id}`}
                    className="docs__pager-link"
                  >
                    <small>← Previous</small>
                    <span>{prev.page.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link
                    to={`/docs/${next.section.id}/${next.page.id}`}
                    className="docs__pager-link docs__pager-link--next"
                  >
                    <small>Next →</small>
                    <span>{next.page.title}</span>
                  </Link>
                )}
              </nav>
              <p className="docs__edit">
                More depth in the{" "}
                <a
                  href="https://github.com/InfamousVague/Libre.academy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  in-app docs <ArrowRight size={11} />
                </a>{" "}
                — Tauri internals, ingest pipeline, runtime layer.
              </p>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
