/// Big random logo at the top of the homepage.
///
/// The brand wants a stronger logo presence on the landing page;
/// this component picks one of the rotation logos under
/// `/public/logos/` at random on every mount, so each page-load
/// surfaces a different variant. Server-side rendering would
/// pin the choice across users, but this is a Vite SPA so the
/// random pick runs purely in the browser at first paint.
///
/// Loading strategy:
///   - `loading="eager"` + `fetchpriority="high"` so the chosen
///     logo lands as fast as possible — it will likely be the
///     LCP element on most paint paths, which is the trade-off
///     for the visual brand impact the design is going for.
///   - `decoding="async"` so layout doesn't block on decode.
///   - Each entry carries the trimmed source's exact width +
///     height so the browser reserves the right slot before the
///     pixels arrive (zero CLS). Trimmed dimensions vary per
///     logo since `magick -trim` strips whitespace differently
///     for each wordmark.

import { useState } from "react";
import "./LogoHero.css";

/// Rotation pool. Each entry pairs the file under `/public/logos/`
/// with the exact pixel dimensions of the (post-`magick -trim`)
/// source so the <img> tag can supply width/height attrs that
/// match the natural aspect ratio. Adding a new logo: drop the
/// file in the folder + append an entry here.
const LOGOS: Array<{ src: string; w: number; h: number }> = [
  { src: "logo-01.png", w: 640, h: 525 },
  { src: "logo-02.png", w: 1024, h: 518 },
  { src: "logo-03.png", w: 1024, h: 531 },
  { src: "logo-04.png", w: 1024, h: 365 },
];

export function LogoHero() {
  /// Pick once at mount. The `useState` initializer fires
  /// exactly once per component lifetime — subsequent re-renders
  /// (state changes elsewhere on the page) keep the same logo.
  /// A full page reload triggers a fresh mount → fresh pick.
  const [chosen] = useState(() => LOGOS[Math.floor(Math.random() * LOGOS.length)]);

  return (
    <div className="logo-hero" aria-hidden>
      <img
        src={`/logos/${chosen.src}`}
        alt="Libre Academy"
        width={chosen.w}
        height={chosen.h}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="logo-hero__img"
      />
    </div>
  );
}
