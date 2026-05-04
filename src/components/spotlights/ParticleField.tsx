import { useEffect, useRef } from "react";

/// Ambient drifting-particle overlay for the hero. Pure canvas, no
/// dependencies, ~80 particles by default. Particles follow a slow
/// constant-velocity drift, wrap around the viewport, and react to
/// the cursor with a gentle parallax pull (the closer to the cursor,
/// the more they drift toward it).
///
/// Why canvas instead of SVG / DOM:
///   - 80 nodes × 60fps = 4800 paint ops/sec. SVG/DOM choke at
///     half that on lower-end laptops; canvas stays at 60fps with
///     room to spare.
///   - We only ever draw circles; no gradients, no images. The cost
///     is dominated by `arc()` calls which canvas optimises for.
///
/// The component respects `prefers-reduced-motion` — when set, the
/// canvas is mounted but never animates (the dots freeze in their
/// initial random positions, still readable as decoration).
interface Props {
  /// How many particles to render. 80 reads as 'gentle atmosphere'
  /// without feeling sparse; bump to 150 for a denser web. Capped
  /// internally at 250 to keep paint times sane.
  count?: number;
  /// Hex/rgba colour for the dots. Default is the blue accent the
  /// per-cover Update badge already uses (#6c8cff) at 60% alpha.
  color?: string;
  /// CSS class forwarded to the wrapper div so callers can position
  /// the canvas (typically `position: absolute; inset: 0;`).
  className?: string;
}

export function ParticleField({ count = 80, color = "rgba(108, 140, 255, 0.6)", className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Mouse position lives in a ref (not state) so it doesn't trigger
  // re-renders on every mousemove. The animation loop reads it
  // directly.
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Honour reduced-motion: render once with frozen positions then
    // bail out of the animation loop.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const N = Math.min(count, 250);
    type P = { x: number; y: number; vx: number; vy: number; r: number; baseAlpha: number };
    const particles: P[] = [];

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx?.scale(dpr, dpr);
    }
    resize();

    // Re-seed particles each resize so they fill the new viewport
    // evenly. Velocities are intentionally tiny (0.05–0.15 px/frame)
    // so the field reads as 'drifting' not 'flying'.
    function seed() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      particles.length = 0;
      for (let i = 0; i < N; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          r: 0.6 + Math.random() * 1.4,
          baseAlpha: 0.3 + Math.random() * 0.5,
        });
      }
    }
    seed();

    let raf = 0;
    function frame() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const mouse = mouseRef.current;
      for (const p of particles) {
        // Mouse parallax pull: dots within ~140px of the cursor
        // drift slightly toward it. Outside that radius they ignore
        // the cursor entirely.
        if (mouse) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const pull = (1 - Math.sqrt(d2) / 140) * 0.08;
            p.vx += dx * pull * 0.001;
            p.vy += dy * pull * 0.001;
          }
        }
        p.x += p.vx;
        p.y += p.vy;
        // Wrap around the viewport so particles never disappear.
        if (p.x < -10) p.x = rect.width + 10;
        if (p.x > rect.width + 10) p.x = -10;
        if (p.y < -10) p.y = rect.height + 10;
        if (p.y > rect.height + 10) p.y = -10;
        // Damp velocity so mouse pull doesn't accumulate forever.
        p.vx *= 0.98;
        p.vy *= 0.98;
        // Re-seed minimum drift so dots never fully stop.
        if (Math.abs(p.vx) < 0.02) p.vx = (Math.random() - 0.5) * 0.2;
        if (Math.abs(p.vy) < 0.02) p.vy = (Math.random() - 0.5) * 0.2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        // Each particle has a slight alpha variance so the field
        // reads as having depth without being noisy.
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${p.baseAlpha})`);
        ctx.fill();
      }
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }
    frame();

    function onResize() {
      resize();
      seed();
    }
    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onMouseLeave() {
      mouseRef.current = null;
    }

    window.addEventListener("resize", onResize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [count, color]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", pointerEvents: "auto" }}
        aria-hidden
      />
    </div>
  );
}
