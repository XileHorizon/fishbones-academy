/// Marketing-page editor demo. Shows the visitor what coding on
/// Libre LOOKS like without making them click through to /learn.
///
/// Engineering constraints (these matter for the "learn to code
/// free" SEO target — Core Web Vitals weights LCP heavily):
///   1. Monaco is ~3 MB unminified. We MUST NOT block the hero
///      LCP element on it. Strategy:
///        - The component renders a SKELETON card on first paint
///          (no Monaco import yet) — same dimensions as the
///          eventual editor so there's no layout shift later.
///        - An IntersectionObserver waits until the component is
///          within 200 px of the viewport before dynamically
///          importing Monaco. A hero-only visit (user scrolls
///          nothing) downloads zero Monaco bytes.
///        - The dynamic import returns a React.lazy-friendly
///          module; Suspense keeps the skeleton on screen until
///          the editor is interactive.
///   2. The "Run" button does NOT do a real eval — that would
///      need a Web Worker sandbox we already ship inside /learn.
///      On the marketing page we reveal pre-baked output captured
///      from the snippet at write time. Honest framing: the
///      caption notes the real runtime lives at /learn.
///   3. Theming uses Monaco's `vs-dark` base. Tokens that drift
///      from the rest of the site palette get overridden via the
///      `defineTheme` call on first load.
///
/// Future: if a real eval ends up shipping, swap the static
/// `OUTPUT` constant for a sandboxed runner call. The component
/// surface (snippet → onRun → output) stays the same.

import {
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
  type ComponentType,
} from "react";
import { Play, ArrowUpRight } from "lucide-react";
import "./LandingEditor.css";

/// The default snippet shown when the editor loads. Picked for
/// (a) visible language idioms in a few lines, (b) two console
/// outputs so the Run reveal has something to show, and (c) a
/// recognizable algorithm so the snippet reads as "real code"
/// rather than a syntactic display piece. TypeScript so the
/// inferred-type popovers light up Monaco's intellisense if a
/// curious visitor hovers a symbol.
const SNIPPET = `// fizzbuzz, the right way
function fizzbuzz(n: number): string {
  if (n % 15 === 0) return "FizzBuzz";
  if (n % 3 === 0) return "Fizz";
  if (n % 5 === 0) return "Buzz";
  return String(n);
}

// Watch the hidden tests grade your work as you type.
for (let i = 1; i <= 15; i++) {
  console.log(\`\${i.toString().padStart(2)}  \${fizzbuzz(i)}\`);
}

console.log("All 15 cases passed.");`;

/// Pre-baked output for the snippet. Captured at write time —
/// not a live eval. Aligned to mirror the snippet's
/// `padStart(2)` formatting so the output reads like real
/// console.log output.
const OUTPUT = ` 1  1
 2  2
 3  Fizz
 4  4
 5  Buzz
 6  Fizz
 7  7
 8  8
 9  Fizz
10  Buzz
11  11
12  Fizz
13  13
14  14
15  FizzBuzz
All 15 cases passed.`;

/// React.lazy wrapper around `@monaco-editor/react`. The dynamic
/// `import("@monaco-editor/react")` is what gives us the
/// code-split — Vite emits Monaco into its own chunk and only
/// fetches it when the lazy component renders.
const Monaco: ComponentType<{
  defaultLanguage: string;
  defaultValue: string;
  height: string;
  theme: string;
  options: object;
}> = lazy(() =>
  import("@monaco-editor/react").then((m) => ({ default: m.default })),
);

export function LandingEditor() {
  /// Has the component scrolled into the viewport? Until it does,
  /// the Monaco chunk stays unfetched. Defaults to `false` so a
  /// homepage visit that doesn't scroll doesn't pull Monaco at
  /// all (saves the bytes for visitors who never see the demo).
  const [inView, setInView] = useState(false);
  /// Has the user clicked Run? Triggers the output reveal.
  const [showOutput, setShowOutput] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Wait until the editor card is within 200 px of the viewport
  // before we let Monaco load. `rootMargin: "200px"` triggers
  // slightly before the user reaches the section so the editor
  // is ready when they actually look at it.
  useEffect(() => {
    if (inView) return;
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Old browser fallback — skip the optimisation entirely.
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            return;
          }
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView]);

  return (
    <section className="section landing-editor" id="demo">
      <div className="landing-editor__head">
        <span className="section__eyebrow">Try it without leaving the page</span>
        <h2 className="section__title">A real editor. No signup.</h2>
        <p className="landing-editor__subtitle">
          This is the same Monaco engine that ships with VS Code — the same
          one you'll use inside every Libre lesson.
        </p>
      </div>

      <div className="landing-editor__card" ref={containerRef}>
        {/* Window-chrome bar so the editor reads as "an actual
            editor" even before Monaco loads. */}
        <div className="landing-editor__chrome">
          <span className="landing-editor__dot landing-editor__dot--red" aria-hidden />
          <span className="landing-editor__dot landing-editor__dot--yellow" aria-hidden />
          <span className="landing-editor__dot landing-editor__dot--green" aria-hidden />
          <span className="landing-editor__filename">fizzbuzz.ts</span>
          <button
            type="button"
            className="landing-editor__run"
            onClick={() => setShowOutput(true)}
            aria-pressed={showOutput}
          >
            <Play size={13} fill="currentColor" /> Run
          </button>
        </div>

        {/* Monaco mounts here once `inView` flips. The skeleton
            (rendered until then) is the same height as the editor
            so the layout doesn't shift when the real component
            slots in. CLS = 0. */}
        <div className="landing-editor__pane">
          {inView ? (
            <Suspense fallback={<EditorSkeleton />}>
              <Monaco
                defaultLanguage="typescript"
                defaultValue={SNIPPET}
                height="320px"
                theme="vs-dark"
                options={{
                  fontSize: 13.5,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                  minimap: { enabled: false },
                  // The demo isn't editable on purpose — we don't
                  // want a confused visitor expecting their typing
                  // to run through a real sandbox. The real editor
                  // is at /learn.
                  readOnly: true,
                  domReadOnly: true,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  lineNumbersMinChars: 3,
                  padding: { top: 12, bottom: 12 },
                  renderLineHighlight: "none",
                }}
              />
            </Suspense>
          ) : (
            <EditorSkeleton />
          )}
        </div>

        {/* Output reveal. Hidden until the user clicks Run; then
            slides in below the editor with the pre-baked output.
            The caption right under the output is the honest
            framing: this demo's Run is a reveal, the real
            sandbox lives at /learn. */}
        {showOutput && (
          <div className="landing-editor__output">
            <div className="landing-editor__output-head">
              <span className="landing-editor__output-label">Console</span>
              <a href="/learn/" className="landing-editor__try-real">
                Try with a real runtime → <ArrowUpRight size={12} />
              </a>
            </div>
            <pre className="landing-editor__output-body">{OUTPUT}</pre>
          </div>
        )}
      </div>

      <p className="landing-editor__caption">
        Demo output is pre-recorded. The interactive editor and live tests
        live at <a href="/learn/" className="landing-editor__caption-link">/learn</a>.
      </p>
    </section>
  );
}

/// Skeleton placeholder rendered before Monaco fetches. Same
/// height as the eventual editor (`320px`) so the layout doesn't
/// shift when the real component slots in (CLS protection).
function EditorSkeleton() {
  // Code-shaped lines with varying widths so the skeleton reads
  // as "lines of code about to load" rather than "loading bar."
  // Widths chosen to roughly mirror the SNIPPET shape — eyes
  // already adjusting to where the real text will sit.
  const lines = [
    "78%", "62%", "70%", "55%", "40%", "20%",
    "85%", "30%", "90%", "78%", "50%",
  ];
  return (
    <div className="landing-editor__skeleton" aria-label="Loading editor…" role="status">
      {lines.map((w, i) => (
        <span
          key={i}
          className="landing-editor__skeleton-line"
          style={{ width: w }}
        />
      ))}
    </div>
  );
}
