/// Plausible wrapper for the libre.academy marketing site.
///
/// The Plausible hosted script is loaded from `index.html` — it
/// self-installs `window.plausible(...)` and auto-fires the first
/// pageview when the page loads. This module exists for two
/// reasons:
///
///   1. SPA route changes. React Router transitions don't trigger
///      a real document load, so the hosted script's auto-pageview
///      only catches the entry URL. Every subsequent navigation
///      needs an explicit `plausible("pageview")` call — which
///      lives in App.tsx, keyed on `useLocation().pathname`.
///   2. Custom events. CTA clicks, form submits, etc. The wrapper
///      keeps the dispatch site tight (`trackEvent("download.click",
///      { os: "macos" })`) and provides a single chokepoint for
///      the type signature, the no-op fallback if the script is
///      blocked, and any future swap to a different backend.
///
/// Privacy: Plausible CE doesn't set cookies, doesn't fingerprint,
/// and is GDPR-friendly out of the box. The script + the event
/// endpoint both live on `stats.libre.academy` (same root domain
/// as this site) so corporate firewalls treat them as first-party.

declare global {
  interface Window {
    plausible?: ((
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void) & { q?: unknown[] };
  }
}

/// Fire a manual pageview. Plausible reads the current
/// `document.location` itself, so no URL needs to be passed — call
/// this from a route-change effect and Plausible captures whatever
/// the address bar currently shows.
///
/// Safe to call before the script finishes loading: the early-call
/// buffer in `index.html` queues the invocation on `plausible.q`
/// and the real implementation flushes the queue once it installs.
export function trackPageview(): void {
  try {
    window.plausible?.("pageview");
  } catch {
    /* analytics must never fail the host app */
  }
}

/// Fire a custom event. `name` is the event identifier in the
/// Plausible dashboard ("Goals → + Add custom event goal"); the
/// `props` bag carries the structured payload (`{ os: "macos" }`
/// etc.). Plausible's free tier caps custom-event props at 30 per
/// event, but in practice we want to keep the payload under ~10
/// keys for readability in the dashboard breakdown.
export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
): void {
  try {
    window.plausible?.(name, props ? { props } : undefined);
  } catch {
    /* swallow */
  }
}
