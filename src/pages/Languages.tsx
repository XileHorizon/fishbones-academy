import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LANGUAGES, type Language } from "../data/languages";
import { CATALOG } from "../data/courses";
import "./Languages.css";

const RUN_LABEL: Record<Language["run"], string> = {
  browser: "Runs in browser",
  sandbox: "Hosted sandbox",
  local: "Desktop only",
};

export function Languages() {
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
        <span className="section__eyebrow">Languages</span>
        <h1 className="section__title">Sixteen languages. One editor. One workflow.</h1>
        <p className="section__subtitle">
          Pick a language and the right runtime fires up automatically.
          Browser-runnable languages are sampleable today; the rest are a
          desktop-app install away.
        </p>
      </header>

      <section className="section">
        <Group
          title="In your browser"
          blurb="No setup. No install. The lessons grade themselves in a Web Worker, an iframe, or Pyodide — pick a course and start the first one."
          languages={browser}
          counts={courseCounts}
        />
        <Group
          title="Via hosted sandboxes"
          blurb="Compiled languages with a public playground. Fishbones proxies your code to play.rust-lang.org / play.golang.org, returns the verdict in the same console."
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
