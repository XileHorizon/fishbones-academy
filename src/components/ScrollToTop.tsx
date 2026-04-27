import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/// Routers don't reset scroll on route change. Anchored hashes are
/// preserved (so /docs/using/themes#streaks scrolls to the heading)
/// but plain navigations jump back to the top.
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}
