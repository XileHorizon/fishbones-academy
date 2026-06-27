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
///   - Width / height attributes hard-coded to the source size so
///     the browser reserves the right amount of vertical space
///     before the image arrives (zero CLS).

import { useState } from "react";
import "./LogoHero.css";

/// Names of the logo files under `/public/logos/`. Adding a new
/// logo is "drop the file in that folder + append its filename
/// here." The rotation grows automatically without code changes
/// elsewhere.
const LOGOS = [
  "logo-01.png",
  "logo-02.png",
  "logo-03.png",
  "logo-04.png",
  "logo-05.png",
];

/// Native logo dimensions in the source files (square). The
/// rendered size on screen is controlled by CSS — these attrs
/// are only here to give the browser an aspect-ratio hint so it
/// can pre-allocate the slot at the right height while the
/// image is still downloading. CLS = 0.
const LOGO_NATIVE_SIZE = 1024;

export function LogoHero() {
  /// Pick once at mount. The `useState` initializer fires
  /// exactly once per component lifetime — subsequent re-renders
  /// (state changes elsewhere on the page) keep the same logo.
  /// A full page reload triggers a fresh mount → fresh pick.
  const [chosen] = useState(() => LOGOS[Math.floor(Math.random() * LOGOS.length)]);

  return (
    <div className="logo-hero" aria-hidden>
      <img
        src={`/logos/${chosen}`}
        alt="Libre Academy"
        width={LOGO_NATIVE_SIZE}
        height={LOGO_NATIVE_SIZE}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="logo-hero__img"
      />
    </div>
  );
}
