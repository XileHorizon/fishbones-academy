import { useEffect, useState } from "react";
import { CheckCircle2, FileCode, GraduationCap, Sparkles } from "lucide-react";
import "./HeroTerminal.css";

/// Animated three-stage hero element. We progress through:
///   stage 0 — markdown source from a book (the "input")
///   stage 1 — Libre Academy structuring it into a lesson (the "transform")
///   stage 2 — the rendered lesson + a passing test result (the "output")
/// 4s per stage, looping. CSS handles the cross-fade between stages.
export function HeroTerminal() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStage((s) => (s + 1) % 3);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="hero-term" role="img" aria-label="Demonstration of a book becoming a runnable lesson">
      <div className="hero-term__chrome">
        <span className="hero-term__dot" />
        <span className="hero-term__dot" />
        <span className="hero-term__dot" />
        <div className="hero-term__tabs">
          <span
            className={`hero-term__tab${stage === 0 ? " hero-term__tab--active" : ""}`}
          >
            <FileCode size={11} /> book.md
          </span>
          <span
            className={`hero-term__tab${stage === 1 ? " hero-term__tab--active" : ""}`}
          >
            <Sparkles size={11} /> structuring…
          </span>
          <span
            className={`hero-term__tab${stage === 2 ? " hero-term__tab--active" : ""}`}
          >
            <GraduationCap size={11} /> lesson.tsx
          </span>
        </div>
      </div>
      <div className="hero-term__body">
        <Stage active={stage === 0}>
          <PreSource />
        </Stage>
        <Stage active={stage === 1}>
          <PreTransform />
        </Stage>
        <Stage active={stage === 2}>
          <PreLesson />
        </Stage>
      </div>
    </div>
  );
}

function Stage({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className={`hero-term__stage${active ? " hero-term__stage--active" : ""}`}>
      {children}
    </div>
  );
}

function PreSource() {
  return (
    <pre className="hero-term__pre">
      <Line n={1}>
        <Tk c="comment">{"// Chapter 4 — The Closure"}</Tk>
      </Line>
      <Line n={2}>{""}</Line>
      <Line n={3}>
        A <Tk c="kw">closure</Tk> is the bundle of a function and the
      </Line>
      <Line n={4}>
        scope it captured. Think of it as a function with luggage —
      </Line>
      <Line n={5}>
        wherever you take it, the variables it remembered come along.
      </Line>
      <Line n={6}>{""}</Line>
      <Line n={7}>
        <Tk c="comment">## Try it</Tk>
      </Line>
      <Line n={8}>
        Write a <Tk c="str">counter()</Tk> that returns a function which
      </Line>
      <Line n={9}>
        increments and returns a private number.
      </Line>
    </pre>
  );
}

function PreTransform() {
  return (
    <div className="hero-term__transform">
      <Pipe label="Parse chapters" stage={0} />
      <Pipe label="Draft lessons" stage={1} />
      <Pipe label="Generate hidden tests" stage={2} />
      <Pipe label="Verify each runs" stage={3} />
      <div className="hero-term__transform-result">
        <CheckCircle2 size={13} />
        <span>1 chapter · 4 lessons · 12 hidden tests</span>
      </div>
    </div>
  );
}

function PreLesson() {
  return (
    <div className="hero-term__lesson">
      <pre className="hero-term__pre hero-term__pre--lesson">
        <Line n={1}>
          <Tk c="kw">function</Tk> <Tk c="fn">counter</Tk>() {"{"}
        </Line>
        <Line n={2}>
          {"  "}
          <Tk c="kw">let</Tk> n = <Tk c="num">0</Tk>;
        </Line>
        <Line n={3}>
          {"  "}
          <Tk c="kw">return</Tk> () =&gt; ++n;
        </Line>
        <Line n={4}>{"}"}</Line>
        <Line n={5}>{""}</Line>
        <Line n={6}>
          <Tk c="kw">const</Tk> next = <Tk c="fn">counter</Tk>();
        </Line>
        <Line n={7}>
          <Tk c="fn">console</Tk>.<Tk c="fn">log</Tk>(<Tk c="fn">next</Tk>());{" "}
          <Tk c="comment">{"// 1"}</Tk>
        </Line>
      </pre>
      <div className="hero-term__console">
        <div className="hero-term__test hero-term__test--pass">
          <CheckCircle2 size={11} /> counter() returns a function
        </div>
        <div className="hero-term__test hero-term__test--pass">
          <CheckCircle2 size={11} /> first call returns 1
        </div>
        <div className="hero-term__test hero-term__test--pass">
          <CheckCircle2 size={11} /> second call returns 2
        </div>
        <div className="hero-term__test-summary">3 / 3 passed · 8ms</div>
      </div>
    </div>
  );
}

function Line({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="hero-term__line">
      <span className="hero-term__lineno">{n}</span>
      <span className="hero-term__line-body">{children}</span>
    </div>
  );
}

function Tk({
  c,
  children,
}: {
  c: "kw" | "fn" | "str" | "num" | "comment";
  children: React.ReactNode;
}) {
  return <span className={`tk tk--${c}`}>{children}</span>;
}

function Pipe({ label, stage }: { label: string; stage: number }) {
  return (
    <div className="hero-term__pipe" style={{ animationDelay: `${stage * 220}ms` }}>
      <span className="hero-term__pipe-bead" />
      <span className="hero-term__pipe-label">{label}</span>
      <span className="hero-term__pipe-status">
        <CheckCircle2 size={12} />
      </span>
    </div>
  );
}
