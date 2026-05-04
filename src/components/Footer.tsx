import { Link } from "react-router-dom";
import { GithubMark } from "./icons/GithubMark";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__brand-link">
            <img
              // ?v=2 cache-bust — see Nav.tsx note. Same logo asset.
              src="/fishbones_skinny_white.png?v=2"
              alt="Fishbones"
              className="site-footer__brand-icon"
            />
            <span>
              <span className="site-footer__brand-tld">.academy</span>
            </span>
          </Link>
          <p className="site-footer__tagline">
            Every book has a course inside it. Crack it open.
          </p>
        </div>

        <nav className="site-footer__cols" aria-label="Footer">
          <div className="site-footer__col">
            <h4 className="site-footer__col-title">Learn</h4>
            <Link to="/courses">Browse courses</Link>
            <Link to="/languages">Languages</Link>
            <a href="/learn/">Open the app</a>
          </div>
          <div className="site-footer__col">
            <h4 className="site-footer__col-title">Product</h4>
            <Link to="/download">Download</Link>
            <Link to="/about">About</Link>
            <Link to="/docs">Docs</Link>
          </div>
          <div className="site-footer__col">
            <h4 className="site-footer__col-title">Open source</h4>
            <a
              href="https://github.com/InfamousVague/Fishbones"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubMark size={13} /> Repository
            </a>
            <a
              href="https://github.com/InfamousVague/Fishbones/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
            >
              Releases
            </a>
            <a
              href="https://github.com/InfamousVague/Fishbones/actions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Build status
            </a>
            <Link to="/support">Support the work</Link>
          </div>
          <div className="site-footer__col">
            <h4 className="site-footer__col-title">Legal</h4>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </nav>
      </div>
      <div className="site-footer__base">
        <span>Free, open source, MIT licensed.</span>
        <span className="site-footer__base-meta">
          Built with the same engine that runs the desktop app.
        </span>
      </div>
    </footer>
  );
}
