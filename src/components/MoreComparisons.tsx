/// "Also compared to" — secondary mini-comparisons against the
/// two other named competitors (Team Treehouse + DataCamp).
///
/// Why split this from CodecademyComparison: a single 4- or
/// 5-column comparison table reads as cramped and the key
/// deltas blur. Two focused cards, each with a short framing +
/// 4-bullet delta list, give the visitor scannable Libre-vs-X
/// content without burying the marquee Codecademy table. SEO
/// bonus: each card carries the competitor name in an H3 so the
/// "{competitor} alternative" intent surfaces a hit.
///
/// Same honesty rules as CodecademyComparison.tsx:
///   - Every Libre claim is a fact verifiable in this repo
///   - Every competitor claim describes their public product as
///     of the AS_OF date below; the date surfaces in fine print
///   - We do not mock; the cards are for the visitor, not for us

import "./MoreComparisons.css";

/// The date the competitor claims were last verified. Bumps with
/// every fact-check pass. Surfaced in the fine-print line under
/// each card.
const AS_OF = "June 2026";

interface Comparison {
  /// Competitor name as it appears in the H3 + the section
  /// heading. We intentionally name them so the on-page text
  /// matches the "{name} alternative" search queries.
  name: string;
  /// One-line tagline / framing under the H3 — what the
  /// competitor IS, in their own framing, NOT a swipe.
  framing: string;
  /// External URL to the competitor's pricing or homepage.
  /// `rel="noopener noreferrer nofollow"` so we don't pass link
  /// equity AND so social previews don't capture us.
  url: string;
  /// Delta rows. Each row is one factual axis where Libre and
  /// the competitor differ. Two sides per row; intentional
  /// concision so the delta is scan-readable, not a paragraph.
  deltas: { axis: string; libre: string; them: string }[];
}

const COMPARISONS: Comparison[] = [
  {
    name: "Team Treehouse",
    framing:
      "Subscription learning platform with video-heavy tracks and a hosted Workspaces IDE.",
    url: "https://teamtreehouse.com/pricing",
    deltas: [
      {
        axis: "Price",
        libre: "Free forever",
        them: "$25 – $49 / mo subscription",
      },
      {
        axis: "Lesson format",
        libre: "Interactive prose + real editor + hidden tests",
        them: "Heavily video-led, then exercises",
      },
      {
        axis: "Languages covered",
        libre: "26",
        them: "~12, JS / Python / PHP / Ruby focus",
      },
      {
        axis: "Native desktop app",
        libre: "macOS · Windows · Linux, fully offline",
        them: "Web only",
      },
    ],
  },
  {
    name: "DataCamp",
    framing:
      "Subscription-based interactive courses focused on data science, analytics, and ML.",
    url: "https://www.datacamp.com/pricing",
    deltas: [
      {
        axis: "Price",
        libre: "Free forever",
        them: "$25 – $39 / mo subscription",
      },
      {
        axis: "Subject scope",
        libre: "Full-stack development + 26 languages",
        them: "Data science + analytics (Python / R / SQL)",
      },
      {
        axis: "Open source",
        libre: "MIT, source on GitHub",
        them: "Closed source",
      },
      {
        axis: "Local AI tutor",
        libre: "Ollama-powered, runs on your machine",
        them: "Cloud-based assistant on Pro tier",
      },
    ],
  },
];

export function MoreComparisons() {
  return (
    <section className="section more-cmp" id="more-comparisons">
      <div className="more-cmp__head">
        <span className="section__eyebrow">Also compared to</span>
        <h2 className="section__title">Honest deltas vs Treehouse + DataCamp.</h2>
        <p className="more-cmp__subtitle">
          Two more direct comparisons against the paid interactive-course
          incumbents. Same rule as the Codecademy table above: every Libre
          claim is verifiable in this repo; every competitor claim describes
          their public product as of {AS_OF}.
        </p>
      </div>

      <div className="more-cmp__grid">
        {COMPARISONS.map((c) => (
          <article key={c.name} className="more-cmp__card">
            <header className="more-cmp__card-head">
              <span className="more-cmp__chip">vs</span>
              <h3 className="more-cmp__card-title">{c.name}</h3>
              <p className="more-cmp__card-framing">{c.framing}</p>
            </header>

            <ul className="more-cmp__deltas">
              {c.deltas.map((d) => (
                <li key={d.axis} className="more-cmp__delta">
                  <span className="more-cmp__delta-axis">{d.axis}</span>
                  <div className="more-cmp__delta-pair">
                    <div className="more-cmp__delta-side more-cmp__delta-side--libre">
                      <span className="more-cmp__delta-label">Libre</span>
                      <span className="more-cmp__delta-value">{d.libre}</span>
                    </div>
                    <div className="more-cmp__delta-side">
                      <span className="more-cmp__delta-label">{c.name}</span>
                      <span className="more-cmp__delta-value">{d.them}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <p className="more-cmp__card-foot">
              Pricing + features as of {AS_OF}. See{" "}
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="more-cmp__card-link"
              >
                {c.name}'s current pricing
              </a>{" "}
              for the latest details.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
