import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CATALOG } from "../../data/courses";
import "./BookCarousel.css";

/// Auto-scrolling book carousel — visual proof of catalogue depth.
/// Two rows that scroll in opposite directions at slightly different
/// speeds for parallax-y motion. Pulls cover JPGs from
/// /starter-courses/<id>.jpg (the same files the app uses).
///
/// Implementation: classic "duplicate-the-list" infinite-marquee
/// pattern. Each row contains [...books, ...books] with `width:
/// max-content` so it overflows; we then `transform: translateX`
/// from 0 to -50% in a CSS animation that loops, hitting a seamless
/// reset point because the second half is identical to the first.
///
/// Why two rows scrolling opposite directions: a single row reads
/// as a "logo wall" (corporate). Two opposed rows reads as
/// "abundance moving" (catalog). The parallax also gives depth
/// without needing 3D.

// Pull from the actual catalog so the carousel + the courses page
// stay in sync. Take all entries with a cover, fall back to the
// first ~30 if more aren't available.
function selectCovers(): string[] {
  const entries = CATALOG
    .map((c) => c.id)
    // Preview env: we know every catalog entry has a cover JPG
    // staged at /starter-courses/<id>.jpg from the build's
    // sync-starter-courses script.
    .map((id) => `/starter-courses/${id}.jpg`);
  // Pad to >= 32 by repeating so the marquee never has a visible
  // seam on wide viewports. We'd rather show duplicates than gaps.
  while (entries.length < 32) entries.push(...entries);
  return entries;
}

export function BookCarousel() {
  const [covers, setCovers] = useState<string[]>(() => selectCovers());
  const [topRow, setTopRow] = useState<string[]>([]);
  const [bottomRow, setBottomRow] = useState<string[]>([]);

  useEffect(() => {
    // Split covers into two rows. Top row gets even indices,
    // bottom gets odd — makes the two rows visibly different
    // (no two adjacent covers match across rows).
    const top: string[] = [];
    const bot: string[] = [];
    covers.forEach((c, i) => (i % 2 === 0 ? top.push(c) : bot.push(c)));
    setTopRow(top);
    setBottomRow(bot);
  }, [covers]);

  // Suppress the unused setter warning — covers might become
  // dynamically refreshed in a future iteration.
  void setCovers;

  return (
    <section className="book-carousel">
      <div className="book-carousel__inner">
        <div className="book-carousel__copy">
          <span className="book-carousel__eyebrow">The shelf</span>
          <h2 className="book-carousel__title">
            Forty-plus titles, all open-source, all runnable.
          </h2>
          <p className="book-carousel__lede">
            From the long-form Rust + Go books to the kata-style challenge
            packs in twenty-six languages. Every cover is a hand-rendered
            specimen plate. Click any one to start reading + coding.
          </p>
        </div>
      </div>

      {/* Marquee rows live OUTSIDE the inner column so they bleed
          edge-to-edge across the viewport. */}
      <div className="book-carousel__rows">
        <BookRow direction="left" covers={topRow} duration={60} />
        <BookRow direction="right" covers={bottomRow} duration={75} />
      </div>

      {/* Edge fade overlays — soften the marquee start/end so books
          don't visually pop in/out. */}
      <div className="book-carousel__edge book-carousel__edge--left" aria-hidden />
      <div className="book-carousel__edge book-carousel__edge--right" aria-hidden />

      <div className="book-carousel__cta-row">
        <a href="/courses" className="book-carousel__cta">
          Browse all courses <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}

function BookRow({
  direction,
  covers,
  duration,
}: {
  direction: "left" | "right";
  covers: string[];
  duration: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // We render the cover list TWICE so the translate-X loop has a
  // seamless reset at the halfway point.
  const doubled = [...covers, ...covers];

  return (
    <div className="book-carousel__row" ref={ref}>
      <motion.div
        className="book-carousel__track"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {doubled.map((src, i) => (
          <div key={`${src}-${i}`} className="book-carousel__cover">
            <img
              src={src}
              alt=""
              loading="lazy"
              draggable={false}
              onError={(e) => {
                // Some covers may not exist in the public folder
                // (build skipped them or new books were added). Hide
                // gracefully rather than show a broken-image icon.
                (e.currentTarget as HTMLImageElement).style.visibility =
                  "hidden";
              }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
