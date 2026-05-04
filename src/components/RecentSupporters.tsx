// Recent-supporters list for /support — sits below TipActivity and
// surfaces the same explorer-scraped events but framed around the
// donor rather than the transaction. Uses the shared `useTipEvents`
// hook so we don't double-fetch when both this component and
// TipActivity are on the same page.
//
// Why two views of the same data: TipActivity is a technical "Latest
// tips" feed (chain badge, tx hash link, refresh button — useful for
// auditing, less compelling for visitors). Recent supporters is a
// social-proof leaderboard ("here's who chipped in") that's
// readable at a glance and reinforces the "people support this" pitch
// next to the QR cards above.

import {
  useTipEvents,
  ChainBadge,
  CHAIN_LABEL,
  type TipEvent,
} from "./TipActivity";
import "./RecentSupporters.css";

export interface RecentSupportersProps {
  /** How many supporters to surface. Default 8 — fits a single
      visual row on desktop without scrolling. */
  limit?: number;
}

export function RecentSupporters({ limit = 8 }: RecentSupportersProps) {
  // Pull a slightly larger window than `limit` so we have headroom
  // when multiple txs come from the same address (we de-dup below
  // and the user-facing limit refers to *supporters*, not txs).
  const { events, loading, errors } = useTipEvents(limit * 4);

  // De-dup by sender address so we show one row per supporter (the
  // most recent tip from each). Anonymous (null sender) rows stay as
  // their own rows since we can't otherwise tell them apart.
  const supporters: TipEvent[] = [];
  const seenSenders = new Set<string>();
  for (const ev of events) {
    if (ev.from) {
      if (seenSenders.has(ev.from)) continue;
      seenSenders.add(ev.from);
    }
    supporters.push(ev);
    if (supporters.length >= limit) break;
  }

  return (
    <section className="recent-supporters" aria-label="Recent supporters">
      <header className="recent-supporters__head">
        <h2 className="recent-supporters__title">Recent supporters</h2>
        <p className="recent-supporters__sub">
          {loading
            ? "Pulling the last few tips off-chain…"
            : supporters.length === 0
              ? "No supporters yet — the spot is open."
              : `${supporters.length} ${
                  supporters.length === 1 ? "person has" : "people have"
                } chipped in recently.`}
        </p>
      </header>

      {loading && supporters.length === 0 ? (
        <ul className="recent-supporters__list" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="recent-supporters__row recent-supporters__row--skeleton"
            >
              <span className="recent-supporters__skel recent-supporters__skel--badge" />
              <span className="recent-supporters__skel recent-supporters__skel--name" />
              <span className="recent-supporters__skel recent-supporters__skel--amount" />
            </li>
          ))}
        </ul>
      ) : supporters.length === 0 ? (
        <div className="recent-supporters__empty">
          <p>
            Send anything from the cards above and you'll appear here once
            the network confirms.
          </p>
          {errors.length > 0 && (
            <p className="recent-supporters__empty-note">
              (Some chain explorers were unreachable —
              {" "}
              {errors.map((e) => CHAIN_LABEL[e.chain]).join(", ")}
              .)
            </p>
          )}
        </div>
      ) : (
        <ul className="recent-supporters__list">
          {supporters.map((ev) => (
            <li
              key={`${ev.chain}-${ev.hash}`}
              className="recent-supporters__row"
            >
              <ChainBadge chain={ev.chain} />
              <a
                className="recent-supporters__name"
                href={ev.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={ev.from ?? "Anonymous supporter"}
              >
                {ev.from ? prettySupporter(ev.from) : "Anonymous supporter"}
              </a>
              <span className="recent-supporters__amount">
                {ev.amountDisplay ?? `Tipped via ${CHAIN_LABEL[ev.chain]}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/// Show "0xab12…cd34" style truncation. Long enough to be
/// recognisable, short enough to fit on one row at mobile widths.
function prettySupporter(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
