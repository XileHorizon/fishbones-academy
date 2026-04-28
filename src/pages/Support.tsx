// /support — donation page surfacing crypto payment methods. Linked
// from the footer's "Open source" column. Intentionally lightweight:
// the heavy lift lives in <CryptoSupport>; this page only sets the
// hero copy and frames the grid.

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GithubMark } from "../components/icons/GithubMark";
import { CryptoSupport } from "../components/CryptoSupport";
import "./Support.css";

export function Support() {
  return (
    <div className="support-page">
      <header className="support-hero">
        <div className="support-hero__inner">
          <span className="section__eyebrow">Support</span>
          <h1 className="section__title">
            Keep the open-source work going.
          </h1>
          <p className="support-hero__lede">
            Fishbones — the desktop app, the browser version, the cloud sync
            server, this site — is MIT licensed and built without a budget.
            If a course or chapter helped you, a few sats or a fraction of an
            ETH keeps the next one shipping.
          </p>
          <div className="support-hero__meta">
            <a
              href="https://github.com/InfamousVague/Fishbones"
              className="btn btn--ghost btn--sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubMark size={13} /> Star the repo
            </a>
            <Link to="/about" className="btn btn--subtle btn--sm">
              Why open source <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      <section className="section support-section">
        <CryptoSupport />
        <p className="support-footnote">
          Send only the listed asset on the listed network — sending wrong-chain
          tokens (e.g. BTC to an ETH address) will lose them permanently. Each
          QR encodes the full address; scan with your wallet to verify before
          sending.
        </p>
      </section>
    </div>
  );
}
