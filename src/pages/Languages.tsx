import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSeo } from "../lib/useSeo";
import { LANGUAGES, type Language } from "../data/languages";
import { CATALOG } from "../data/courses";
import "./Languages.css";

const RUN_LABEL: Record<Language["run"], string> = {
  browser: "Runs in browser",
  sandbox: "Hosted sandbox",
  local: "Desktop only",
};

export function Languages() {
  useSeo({
    title: `${LANGUAGES.length} Programming Languages — Free Interactive Courses Online | Libre Academy`,
    description: `Libre Academy supports ${LANGUAGES.length} programming languages — JavaScript, Python, Rust, Go, Solidity, TypeScript, and more. Free courses, real browser runtimes, zero install.`,
    canonicalUrl: "https://libre.academy/languages",
  });
  // Bucket by execution mode so the page reads as three groups: things
  // you can sample in the browser today, things that run via a hosted
  // playground, things that need the desktop app.
  const browser = LANGUAGES.filter((l) => l.run === "browser");
  const sandbox = LANGUAGES.filter((l) => l.run === "sandbox");
  const local = LANGUAGES.filter((l) => l.run === "local");

  const courseCounts = new Map<string, number>();
  for (const c of CATALOG)
    courseCounts.set(c.language, (courseCounts.get(c.language) ?? 0) + 1);

  return (
    <div className="languages-page">
      <header className="languages-page__head section section--narrow">
        <span className="section__eyebrow">Programming languages</span>
        <h1 className="section__title">
          Learn {LANGUAGES.length} programming languages — free, in your browser.
        </h1>
        <p className="section__subtitle">
          Every language Libre Academy supports, with its real runtime and
          a free course library. Browser-runnable languages start the first
          lesson with one click; compiled languages run via hosted
          sandboxes or the optional desktop app.
        </p>
      </header>

      <section className="section">
        <Group
          title="In your browser"
          blurb="No setup. No install. Lessons grade themselves in a Web Worker, an iframe, or Pyodide — pick a course and start writing code in 30 seconds."
          languages={browser}
          counts={courseCounts}
        />
        <Group
          title="Via hosted sandboxes"
          blurb="Compiled languages with an official playground. Libre Academy proxies your code to play.rust-lang.org / play.golang.org and returns the verdict in the same console."
          languages={sandbox}
          counts={courseCounts}
        />
        <Group
          title="Desktop app"
          blurb="Languages that need a system compiler. The desktop build probes for the toolchain on launch and offers a one-click install when something's missing."
          languages={local}
          counts={courseCounts}
        />
      </section>
    </div>
  );
}

function Group({
  title,
  blurb,
  languages,
  counts,
}: {
  title: string;
  blurb: string;
  languages: Language[];
  counts: Map<string, number>;
}) {
  return (
    <div className="languages-group">
      <div className="languages-group__head">
        <h2 className="languages-group__title">{title}</h2>
        <p className="languages-group__blurb">{blurb}</p>
      </div>
      <div className="languages-grid">
        {languages.map((l) => (
          <Link
            key={l.id}
            to={`/languages/${l.slug}`}
            className="card languages-card"
          >
            <div className="languages-card__header">
              <span className="languages-card__glyph">{l.glyph}</span>
              <span className="languages-card__run">{RUN_LABEL[l.run]}</span>
            </div>
            <h3 className="languages-card__name">{l.name}</h3>
            <p className="languages-card__blurb">{l.blurb}</p>
            <div className="languages-card__foot">
              <span>
                {counts.get(l.id) ?? 0} courses
                {l.runNote ? ` · ${l.runNote}` : ""}
              </span>
              <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
