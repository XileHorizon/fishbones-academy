/// "Open in Fishbones" deep-link helper.
///
/// We don't have a JS API for "is the fishbones:// scheme handler
/// installed?" — querying that ahead of time is browser-restricted
/// (rightly: fingerprinting risk). Best we can do is fire the URL
/// and watch the page's visibility: if the OS hands the URL off to
/// the desktop app, the browser tab loses focus + goes hidden, and
/// we treat that as "yep, app is here." We persist that learning
/// in localStorage so subsequent visits can promote the deep-link
/// CTA to primary instead of guessing every time.
///
/// First-time visitors see two CTAs (Open in Fishbones + Start in
/// browser). If they click "Open in Fishbones" and the app picks it
/// up, we remember and the next visit shows the deep-link as the
/// primary CTA. If they NEVER click it, both CTAs stay equal — we
/// don't try to be clever.

const FLAG_KEY = "fb:has-app";
const PROBE_TTL_MS = 1500;

/// Read the persisted "we've seen this user open the desktop app"
/// flag. Tri-state because no flag = we don't know yet (don't push
/// the deep-link CTA), explicit `false` = we attempted once and the
/// app didn't grab it (don't push it for this device), `true` = we
/// confirmed it.
export function hasFishbonesInstalled(): boolean | null {
  try {
    const v = localStorage.getItem(FLAG_KEY);
    if (v === "1") return true;
    if (v === "0") return false;
    return null;
  } catch {
    return null;
  }
}

function setFlag(installed: boolean) {
  try {
    localStorage.setItem(FLAG_KEY, installed ? "1" : "0");
  } catch {
    /* private mode — fine, we just won't remember */
  }
}

/// Build a `fishbones://open?courseId=…&lessonId=…` URL. Pure,
/// component-free so the same builder works for the page-level CTA
/// and the per-lesson hover button.
export function fishbonesOpenUrl(courseId: string, lessonId?: string): string {
  const params = new URLSearchParams({ courseId });
  if (lessonId) params.set("lessonId", lessonId);
  return `fishbones://open?${params.toString()}`;
}

/// Fire the deep link + run a visibility-loss probe. Returns a
/// promise that resolves to:
///   "opened"     — page went hidden during the probe → app caught it
///   "no-handler" — page stayed visible → no handler (or user
///                  dismissed the OS prompt without opening)
///
/// Callers that want to fall through to /download on "no-handler"
/// can chain off this; callers that want fire-and-forget can ignore
/// the resolved value.
///
/// Caveats: the probe is best-effort. A user who alt-tabs away mid-
/// probe will look like "opened" even if the app didn't catch it.
/// We tolerate the false positive — promoting a deep-link CTA on a
/// device that DOES turn out to need an install is a one-extra-
/// click harm; the alternative (false negatives) is worse because
/// it nags users who have the app installed.
export function openInFishbones(
  courseId: string,
  lessonId?: string,
): Promise<"opened" | "no-handler"> {
  const url = fishbonesOpenUrl(courseId, lessonId);
  return new Promise((resolve) => {
    let settled = false;

    const onVisibility = () => {
      if (document.visibilityState === "hidden" && !settled) {
        settled = true;
        setFlag(true);
        cleanup();
        resolve("opened");
      }
    };
    const cleanup = () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onVisibility);
    };

    document.addEventListener("visibilitychange", onVisibility);
    // Some browsers (Safari) fire blur before visibilitychange when
    // the OS opens an app — listen to both.
    window.addEventListener("blur", onVisibility);

    // Trigger the navigation. Using `window.location.href` lets the
    // browser route through its normal protocol-handler logic
    // (including the "Open in Fishbones?" confirmation prompt on
    // Chrome/Firefox); an `<a>` click would behave the same but
    // requires a synthetic anchor.
    window.location.href = url;

    // After the probe window, if we never saw the page go hidden,
    // assume no handler captured the URL. Don't write a hard `false`
    // to the flag here — the user might have dismissed the OS
    // confirmation prompt this time and have the app installed for
    // a future click. We only persist `true` (confirmed).
    setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve("no-handler");
    }, PROBE_TTL_MS);
  });
}
