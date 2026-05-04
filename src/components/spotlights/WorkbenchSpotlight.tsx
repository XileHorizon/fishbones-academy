import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { codeToHtml } from "shiki";
import { Play, Check, X, Terminal } from "lucide-react";
import "./WorkbenchSpotlight.css";

/// Animated workbench mock for the homepage. Pretends to be the
/// real Fishbones editor: types Solidity character-by-character,
/// then "compiles" + "deploys" + "tests" with a 3-stage console
/// stream that finishes with green pass pills. The whole sequence
/// runs ~14 seconds and loops every ~25.
///
/// Why a mock instead of mounting the real Monaco + EVM stack:
///   - Real Monaco is ~3 MB gzipped; @ethereumjs/vm + viem add
///     another ~1 MB. Marketing pages should load in <2s — we
///     can't afford either.
///   - Shiki (already in the marketing bundle for code blocks)
///     gives us indistinguishable syntax highlighting at a
///     fraction of the cost.
///   - The animation tells a story (write → compile → deploy →
///     test) that a static screenshot can't.
///
/// IntersectionObserver gates the animation: nothing runs until
/// the spotlight scrolls into view. After it plays once, it loops
/// forever (with a 4s pause between cycles) so a learner who
/// scrolls back up sees activity.
const SOLIDITY_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public count;

    function increment() public {
        count += 1;
    }

    function reset() public {
        count = 0;
    }
}`;

/// Console output stages — each one streams in over ~1.4s with a
/// short pause before the next. Shapes mirror the real workbench's
/// solc/EVM output as closely as possible without faking the actual
/// gas numbers (those vary per compile).
type Stage =
  | { kind: "info"; text: string }
  | { kind: "ok"; text: string; pill?: string }
  | { kind: "test-pass"; name: string };

const CONSOLE_STAGES: Stage[] = [
  { kind: "info", text: "compiling Counter.sol with solc 0.8.30…" },
  { kind: "ok", text: "compiled in 234ms", pill: "1 contract · 0 errors" },
  { kind: "info", text: "deploying to local EVM…" },
  { kind: "ok", text: "Counter deployed at 0x5FbDB2…aa3", pill: "block #128 · gas 152,194" },
  { kind: "info", text: "running 3 tests…" },
  { kind: "test-pass", name: "starts at zero" },
  { kind: "test-pass", name: "increments on call" },
  { kind: "test-pass", name: "reset returns to zero" },
];

export function WorkbenchSpotlight() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { amount: 0.4, once: false });

  // Highlighted HTML for the Solidity source. We render the FULL
  // highlighted block once, then mask it with a width-clipped wrapper
  // that grows over time to simulate typing — vastly cheaper than
  // re-running Shiki on every keystroke.
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  // Typewriter progress: number of characters revealed so far. The
  // wrapper has a CSS clip-path tied to this ratio.
  const [typedChars, setTypedChars] = useState(0);
  const [stageIndex, setStageIndex] = useState(-1); // -1 = pre-typing
  const [cycle, setCycle] = useState(0); // bump to restart loop

  useEffect(() => {
    let cancelled = false;
    codeToHtml(SOLIDITY_CODE, {
      lang: "solidity",
      theme: "github-dark-default",
    }).then((html) => {
      if (!cancelled) setHighlightedHtml(html);
    });
    return () => { cancelled = true; };
  }, []);

  // Run the animation when the section is in view. Each cycle:
  //   1. Type the code (chars revealed at ~30 per second)
  //   2. Pause 600ms
  //   3. Stream console stages (1 every ~750ms)
  //   4. Hold the final state for 4s, then reset + restart
  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setTypedChars(0);
    setStageIndex(-1);

    // Typewriter
    let charIdx = 0;
    const typeTick = () => {
      if (cancelled) return;
      charIdx += 2; // 2 chars per tick @ ~16ms = ~120 cps; feels brisk
      setTypedChars(charIdx);
      if (charIdx < SOLIDITY_CODE.length) {
        timers.push(setTimeout(typeTick, 16));
      } else {
        // Settle on full code, pause, then start console stages
        timers.push(setTimeout(() => {
          if (cancelled) return;
          let s = 0;
          const stageTick = () => {
            if (cancelled) return;
            setStageIndex(s);
            s++;
            if (s < CONSOLE_STAGES.length) {
              timers.push(setTimeout(stageTick, 750));
            } else {
              // Hold the finished state, then loop
              timers.push(setTimeout(() => {
                if (cancelled) return;
                setCycle((c) => c + 1);
              }, 5000));
            }
          };
          stageTick();
        }, 600));
      }
    };
    typeTick();

    return () => {
      cancelled = true;
      for (const t of timers) clearTimeout(t);
    };
  }, [inView, cycle]);

  // Compute clip-path that reveals only the typed portion. We clip
  // by line: count newlines in the typed prefix → reveal that many
  // full lines, plus a partial reveal of the active line via width.
  const typedPrefix = SOLIDITY_CODE.slice(0, typedChars);
  const lineCount = (typedPrefix.match(/\n/g) || []).length + 1;
  const lastLineChars = typedPrefix.length - typedPrefix.lastIndexOf("\n") - 1;
  const totalLines = SOLIDITY_CODE.split("\n").length;

  return (
    <section className="ws-spotlight" ref={containerRef}>
      <div className="ws-spotlight__inner">
        <div className="ws-spotlight__copy">
          <span className="ws-spotlight__eyebrow">
            <Terminal size={12} /> Workbench
          </span>
          <h2 className="ws-spotlight__title">
            Write code. Hit Run. Get tests back. <em>That fast.</em>
          </h2>
          <p className="ws-spotlight__lede">
            A real Monaco editor wired to per-language test runners. No
            tab-switching, no terminal, no setup. The lesson knows what to
            grade and tells you the moment you're right.
          </p>
          <ul className="ws-spotlight__bullets">
            <li><span className="ws-spotlight__dot" /> Solidity compiles via solc-js, deploys to in-process EVM</li>
            <li><span className="ws-spotlight__dot" /> Hidden tests run against your actual bytecode</li>
            <li><span className="ws-spotlight__dot" /> Every pass / fail surfaces inline, no console-spelunking</li>
          </ul>
          <a href="/download" className="ws-spotlight__cta">
            Get the desktop app
            <span className="ws-spotlight__cta-arrow" aria-hidden>→</span>
          </a>
        </div>

        <motion.div
          className="ws-editor"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Editor chrome — title bar + language pill */}
          <div className="ws-editor__chrome">
            <div className="ws-editor__dots">
              <span /><span /><span />
            </div>
            <span className="ws-editor__filename">Counter.sol</span>
            <span className="ws-editor__lang-pill">Solidity</span>
          </div>

          {/* Code pane — highlighted HTML revealed via clip-path */}
          <div className="ws-editor__code">
            <div className="ws-editor__gutter" aria-hidden>
              {Array.from({ length: totalLines }).map((_, i) => (
                <span
                  key={i}
                  className={
                    i < lineCount
                      ? "ws-editor__gutter-line ws-editor__gutter-line--shown"
                      : "ws-editor__gutter-line"
                  }
                >
                  {i + 1}
                </span>
              ))}
            </div>
            <div
              className="ws-editor__highlight"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              style={{
                // Clip path reveals fully-typed lines + a partial
                // reveal of the in-progress line based on chars typed.
                // We clip by inserting a CSS variable that controls
                // the visible bottom edge.
                ["--ws-lines-shown" as string]: lineCount,
                ["--ws-last-line-chars" as string]: lastLineChars,
              }}
            />
            {/* Blinking caret follows the typing position. Hidden
                once typing finishes. */}
            {typedChars < SOLIDITY_CODE.length && (
              <span
                className="ws-editor__caret"
                style={{
                  ["--ws-caret-line" as string]: lineCount - 1,
                  ["--ws-caret-col" as string]: lastLineChars,
                }}
                aria-hidden
              />
            )}
          </div>

          {/* Console pane */}
          <div className="ws-editor__console">
            <div className="ws-editor__console-head">
              <button
                type="button"
                className="ws-editor__run-btn"
                disabled={typedChars < SOLIDITY_CODE.length}
                aria-hidden
              >
                <Play size={11} /> Run
              </button>
              <span className="ws-editor__console-meta">
                {stageIndex >= CONSOLE_STAGES.length - 1
                  ? "3 / 3 passed · 1.4s"
                  : stageIndex >= 0
                    ? "running…"
                    : "ready"}
              </span>
            </div>
            <div className="ws-editor__console-body">
              {CONSOLE_STAGES.slice(0, Math.max(0, stageIndex + 1)).map((s, i) => (
                <ConsoleLine key={`${cycle}-${i}`} stage={s} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ConsoleLine({ stage }: { stage: Stage }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={`ws-console-line ws-console-line--${stage.kind}`}
    >
      {stage.kind === "info" && <span className="ws-console-line__glyph">›</span>}
      {stage.kind === "ok" && (
        <span className="ws-console-line__glyph ws-console-line__glyph--ok">
          <Check size={11} />
        </span>
      )}
      {stage.kind === "test-pass" && (
        <span className="ws-console-line__glyph ws-console-line__glyph--ok">
          <Check size={11} />
        </span>
      )}
      <span className="ws-console-line__text">
        {stage.kind === "test-pass" ? `test ${stage.name}` : stage.text}
      </span>
      {stage.kind === "ok" && stage.pill && (
        <span className="ws-console-line__pill">{stage.pill}</span>
      )}
      {stage.kind === "test-pass" && (
        <span className="ws-console-line__pill ws-console-line__pill--pass">PASS</span>
      )}
    </motion.div>
  );
}

// Suppress ts-unused-X for the X icon — kept around in case we
// want to wire a "fail" cycle variant in the future.
void X;
