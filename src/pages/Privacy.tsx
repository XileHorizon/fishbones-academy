import { Link } from "react-router-dom";
import { useSeo } from "../lib/useSeo";
import "./Legal.css";

export function Privacy() {
  useSeo({
    title: "Privacy Policy — Libre Academy",
    description: "Libre Academy privacy policy. No tracking, no cookies, no PII. Progress stays on your device. Optional cloud sync stores only XP + completion timestamps.",
    canonicalUrl: "https://libre.academy/privacy",
  });
  return (
    <div className="legal-page section section--narrow">
      <span className="section__eyebrow">Legal</span>
      <h1 className="section__title">Privacy</h1>
      <p className="legal-page__updated">Last updated: April 2026</p>

      <div className="md-body legal-page__body">
        <h2>Short version</h2>
        <p>
          Libre Academy is open source and local-first. We don't run
          analytics on this site. The desktop and browser apps don't ship
          telemetry or error reporters. Cloud sync is opt-in and stores only
          the small JSON-shaped record of your progress.
        </p>

        <h2>What this site logs</h2>
        <p>
          libre.academy is a static site served from a single VPS via
          Caddy. Caddy keeps standard access logs (IP, timestamp, requested
          path, user agent) for ~7 days for operational purposes — diagnosing
          outages, banning abusive scrapers. We don't run third-party
          analytics. We don't ship cookies. We don't sell anything to anyone.
        </p>

        <h2>What the apps store</h2>
        <p>
          The desktop app stores your courses, your progress, your streak,
          and your XP in SQLite under your platform's standard data
          directory. The browser app stores the same thing in IndexedDB on
          the device you're using. Neither sends any of it off the device by
          default.
        </p>

        <h2>The AI tutor</h2>
        <p>
          The default backend is a local Ollama instance, which means the AI
          tutor's prompts stay on your machine. If you opt in to the
          Anthropic backend in Settings, your prompts and the lesson context
          are sent to Anthropic's API per the{" "}
          <a
            href="https://www.anthropic.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Anthropic privacy policy
          </a>
          . You can switch backends at any time.
        </p>

        <h2>Cloud sync (opt-in)</h2>
        <p>
          If you sign in for cloud sync, the app sends your lesson completion
          records and your XP/streak counters to the Libre Academy sync
          server. Lesson contents (the actual courses) stay on your disk.
          The server source is open and self-hostable.
        </p>

        <h2>Hosted sandboxes</h2>
        <p>
          Lessons in Rust and Go submit your code to the public playgrounds
          at <code>play.rust-lang.org</code> and <code>play.golang.org</code>.
          Their privacy practices apply to those submissions.
        </p>

        <h2>Open source</h2>
        <p>
          Every claim above is checkable in the source. The desktop app, the
          browser variant, this marketing site, and the cloud sync server
          are all on{" "}
          <a
            href="https://github.com/InfamousVague/Libre.academy"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>{" "}
          under the MIT license.
        </p>
      </div>

      <p className="legal-page__back">
        <Link to="/">← Back home</Link>
      </p>
    </div>
  );
}
