// /oauth/done — the relay redirects here after a Fishbones web sign-in
// finishes, with `?session=…&status=ok&token=…` (or `&status=error&error=…&message=…`)
// in the URL. Lives in a popup window opened by SignInDialog; the
// only job is to postMessage the payload back to `window.opener`
// and close the popup. The opener (the SignInDialog effect on the
// fishbones.academy/learn build) calls `cloud.applyOAuthToken(token)`,
// /me materialises the user, and the dialog auto-closes.
//
// The popup runs on the same origin as the opener (the SignInDialog
// always sends `return_to=${window.location.origin}/oauth/done`), so
// the postMessage doesn't need to widen origins — both sides pin
// against `window.location.origin`.

import { useEffect } from "react";

interface Payload {
  type: "fishbones-oauth";
  session: string | null;
  token?: string;
  error?: string;
}

function readPayload(): Payload {
  const params = new URLSearchParams(window.location.search);
  const session = params.get("session");
  const status = params.get("status");
  if (status === "ok") {
    const token = params.get("token");
    if (token) return { type: "fishbones-oauth", session, token };
    return {
      type: "fishbones-oauth",
      session,
      error: "Sign-in returned without a token",
    };
  }
  if (status === "error") {
    const code = params.get("error") ?? "unknown_error";
    const message = params.get("message") ?? "Sign-in didn't complete.";
    return { type: "fishbones-oauth", session, error: `${code}: ${message}` };
  }
  return {
    type: "fishbones-oauth",
    session,
    error: "Missing status — this page is opened by the OAuth flow.",
  };
}

export function OAuthDone() {
  useEffect(() => {
    const payload = readPayload();
    const opener = window.opener as Window | null;
    if (opener && !opener.closed) {
      // Pin to our own origin — the SignInDialog sets
      // `return_to=${window.location.origin}/oauth/done`, so opener
      // and popup share an origin and we can lock postMessage to it
      // (no `*` wildcard, never leak the bearer to a foreign tab).
      try {
        opener.postMessage(payload, window.location.origin);
      } catch {
        // Cross-origin or detached opener — fall through to the
        // visible fallback below. Shouldn't happen in practice
        // because the relay's allowlist forces the same-origin
        // return_to, but defensive against future deploys.
      }
    }
    // Give the parent ~150ms to apply the token before we close, so
    // the postMessage handler has a chance to run + start its /me
    // fetch. Closing too eagerly can cancel pending requests.
    const t = window.setTimeout(() => {
      try {
        window.close();
      } catch {
        // Some browsers refuse to close popups they didn't open
        // themselves (e.g. a reload of /oauth/done in a normal tab).
        // The visible fallback below tells the user what to do.
      }
    }, 150);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "0 24px",
        color: "var(--color-text-primary, #f3f3f5)",
        textAlign: "center",
        gap: 12,
      }}
    >
      <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
        Signing you in…
      </h1>
      <p style={{ fontSize: 13, opacity: 0.7, margin: 0, maxWidth: 360 }}>
        You can close this window if it doesn't dismiss itself.
      </p>
    </div>
  );
}
