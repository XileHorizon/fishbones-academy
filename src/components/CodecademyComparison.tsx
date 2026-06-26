/// Three-column comparison table: Libre / Codecademy Free / Codecademy Pro.
///
/// Why this exists: the landing page targets the keyword "learn to
/// code free" and explicitly positions Libre as the open-source
/// alternative to Codecademy. A direct, honest comparison table is
/// the single highest-leverage conversion surface — Codecademy
/// churners arriving here want to see the apples-to-apples deltas,
/// not a manifesto.
///
/// Honesty rules — every row MUST be defensible in writing:
///   1. Libre claims are facts about THIS product (verifiable in
///      this repo + the app repo).
///   2. Codecademy claims describe the PUBLIC product as of the
///      `AS_OF` date below — Codecademy's pricing and plan
///      structure has drifted over time, so we pin the comparison
///      to a date and surface the date in fine print under the
///      table.
///   3. Where Codecademy and Libre genuinely tie on a feature, we
///      mark BOTH with a check — credibility is the asset here, not
///      a clean sweep.
///   4. We do NOT mock Codecademy. The table is for the visitor,
///      not for us; snark would erode trust on the very page
///      that's asking for it.
///
/// The closing pull-quote / pillar is the "No paywall, ever"
/// promise (the user's lock #15). Sits below the table so the
/// reader's last impression is the differentiator, not a
/// comparison check.

import { Check, X, Minus } from "lucide-react";
import "./CodecademyComparison.css";

/// The date the Codecademy column was last verified. Surfaced in
/// the fine print under the table so a stale claim is obviously
/// stale rather than silently wrong. Bump this whenever you
/// re-fact-check the Codecademy column.
const AS_OF = "June 2026";

/// Cell value primitives. `yes` / `no` / `na` render as icons; a
/// `string` renders as plain text (for nuanced rows like "Price"
/// or "Course count" where a checkmark doesn't carry enough info).
type CellValue = "yes" | "no" | "na" | string;

interface Row {
  /// What the row is about.
  feature: string;
  /// Optional one-line subtitle below the feature label —
  /// disambiguates rows where the column heading alone could be
  /// read multiple ways.
  detail?: string;
  libre: CellValue;
  free: CellValue;
  pro: CellValue;
}

/// The comparison rows. Order is intentional: the strongest
/// differentiator (price + paywall) sits first so a skimmer who
/// only reads the top of the table already has the value prop;
/// the structural / philosophical rows (open source, offline,
/// AI policy) sit at the bottom where they reinforce.
const ROWS: Row[] = [
  {
    feature: "Price",
    libre: "Free, forever",
    free: "Free (limited)",
    pro: "$29.99/mo or $239.88/yr",
  },
  {
    feature: "Paywall",
    detail: "Locked lessons / Pro-only content",
    libre: "no",
    free: "yes",
    pro: "no",
  },
  {
    feature: "Sign-up required",
    detail: "Email + account before lesson 1",
    libre: "no",
    free: "yes",
    pro: "yes",
  },
  {
    feature: "Open source",
    detail: "Source code on GitHub, MIT licensed",
    libre: "yes",
    free: "no",
    pro: "no",
  },
  {
    feature: "Real code editor",
    detail: "Monaco / VS Code engine in the browser",
    libre: "yes",
    free: "yes",
    pro: "yes",
  },
  {
    feature: "Hidden tests grade your code",
    libre: "yes",
    free: "yes",
    pro: "yes",
  },
  {
    feature: "Languages covered",
    libre: "26",
    free: "~14",
    pro: "~20",
  },
  {
    feature: "Native desktop app",
    detail: "macOS · Windows · Linux. Runs fully offline.",
    libre: "yes",
    free: "no",
    pro: "no",
  },
  {
    feature: "Works offline",
    libre: "yes",
    free: "no",
    pro: "no",
  },
  {
    feature: "Course archives are portable",
    detail: ".academy zip files you can share, fork, or self-host",
    libre: "yes",
    free: "no",
    pro: "no",
  },
  {
    feature: "Certificates of completion",
    libre: "yes",
    free: "no",
    pro: "yes",
  },
  {
    feature: "Ads / upsell prompts",
    libre: "no",
    free: "yes",
    pro: "no",
  },
  {
    feature: "Local AI tutor",
    detail: "Ollama-powered, runs on your machine, zero token cost",
    libre: "yes",
    free: "no",
    pro: "no",
  },
];

function Cell({ value }: { value: CellValue }) {
  if (value === "yes") {
    return (
      <span className="cmp__cell cmp__cell--yes" aria-label="Yes">
        <Check size={18} strokeWidth={2.5} />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="cmp__cell cmp__cell--no" aria-label="No">
        <X size={18} strokeWidth={2} />
      </span>
    );
  }
  if (value === "na") {
    return (
      <span className="cmp__cell cmp__cell--na" aria-label="Not applicable">
        <Minus size={18} strokeWidth={2} />
      </span>
    );
  }
  return <span className="cmp__cell cmp__cell--text">{value}</span>;
}

export function CodecademyComparison() {
  return (
    <section className="section cmp" id="vs-codecademy">
      <div className="cmp__head">
        <span className="section__eyebrow">Why Libre vs Codecademy</span>
        <h2 className="section__title">
          Same interactive lessons, no paywall, source code on GitHub.
        </h2>
        <p className="cmp__subtitle">
          Honest, row-by-row comparison. Every Libre claim is verifiable in
          this repo; every Codecademy claim describes their public product
          as of {AS_OF}.
        </p>
      </div>

      {/* Semantic <table> so screen readers + search engines parse
          the structure. CSS collapses it to stacked cards on
          narrow viewports via container queries; on wide ones the
          three columns sit side-by-side with the Libre column
          visually emphasised. */}
      <div className="cmp__table-wrap" role="region" aria-label="Comparison table">
        <table className="cmp__table">
          <thead>
            <tr>
              <th scope="col" className="cmp__th cmp__th--feature">
                Feature
              </th>
              <th scope="col" className="cmp__th cmp__th--libre">
                <span className="cmp__th-eyebrow">Libre Academy</span>
                <span className="cmp__th-tier">Free, forever</span>
              </th>
              <th scope="col" className="cmp__th">
                <span className="cmp__th-eyebrow">Codecademy</span>
                <span className="cmp__th-tier">Free tier</span>
              </th>
              <th scope="col" className="cmp__th">
                <span className="cmp__th-eyebrow">Codecademy</span>
                <span className="cmp__th-tier">Pro</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.feature} className="cmp__row">
                <th scope="row" className="cmp__feature">
                  <span className="cmp__feature-label">{row.feature}</span>
                  {row.detail && (
                    <span className="cmp__feature-detail">{row.detail}</span>
                  )}
                </th>
                <td
                  className="cmp__td cmp__td--libre"
                  data-label="Libre Academy"
                >
                  <Cell value={row.libre} />
                </td>
                <td className="cmp__td" data-label="Codecademy Free">
                  <Cell value={row.free} />
                </td>
                <td className="cmp__td" data-label="Codecademy Pro">
                  <Cell value={row.pro} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="cmp__fineprint">
        Comparison as of {AS_OF}. Codecademy's plan structure and pricing
        change over time —{" "}
        <a
          href="https://www.codecademy.com/pricing"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="cmp__fineprint-link"
        >
          check Codecademy's current pricing page
        </a>{" "}
        for the latest details.
      </p>

      {/* "No paywall, ever" pillar — the emphatic closer to the
          comparison (lock #15). Sits below the table so the
          reader's LAST impression is the differentiator, not a
          row of check marks. */}
      <div className="cmp__pillar">
        <div className="cmp__pillar-mark" aria-hidden>
          ∞
        </div>
        <div className="cmp__pillar-copy">
          <h3 className="cmp__pillar-title">No paywall. Ever.</h3>
          <p className="cmp__pillar-lede">
            Libre Academy is MIT-licensed and will stay free forever. If a
            future maintainer ever tries to put a course behind a paywall,
            fork the repo and host the open version yourself.
          </p>
        </div>
      </div>
    </section>
  );
}
