import { Link } from "react-router-dom";
import "./Legal.css";

export function Terms() {
  return (
    <div className="legal-page section section--narrow">
      <span className="section__eyebrow">Legal</span>
      <h1 className="section__title">Terms</h1>
      <p className="legal-page__updated">Last updated: April 2026</p>

      <div className="md-body legal-page__body">
        <h2>Short version</h2>
        <p>
          Libre is free, MIT-licensed software. Use it. Build with it.
          Fork it. Don't blame us if it breaks.
        </p>

        <h2>License</h2>
        <p>
          The Libre desktop app, the browser variant, and this site are
          released under the{" "}
          <a
            href="https://github.com/InfamousVague/Fishbones/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT License
          </a>
          . You're free to use, copy, modify, merge, publish, distribute,
          sublicense, and/or sell copies of the software so long as the
          copyright notice travels with it. The software is provided "as
          is", without warranty of any kind.
        </p>

        <h2>Course content</h2>
        <p>
          Courses generated from your own books or notes are yours. The
          starter packs we ship reference public source material and are
          provided for educational use; if you re-share them, attribute the
          original authors. If you author your own course, you keep all
          rights to it.
        </p>

        <h2>Cloud sync server</h2>
        <p>
          The optional cloud sync server is provided free of charge. We
          reserve the right to throttle abusive clients (the kind that try
          to use it as a generic key-value store). If we ever sunset the
          hosted server, the source is open, and you can spin up your own.
        </p>

        <h2>Trademarks</h2>
        <p>
          "Libre" and the ribbon-snake Libre mark are trademarks of their
          authors. You can refer to them when discussing the project, forking
          the project, or building integrations. Don't pass off your
          unrelated software as Libre.
        </p>

        <h2>Changes</h2>
        <p>
          When these terms change, the date above changes too. We won't
          retroactively claim rights to anything you've already built — if a
          new clause would, the new clause only applies going forward.
        </p>
      </div>

      <p className="legal-page__back">
        <Link to="/">← Back home</Link>
      </p>
    </div>
  );
}
