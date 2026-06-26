// /reset-password — landing page for the link in the password-reset
// email. Reads `?token=…` from the URL, asks the user for a new
// password (with strength scoring + confirm match), and POSTs both
// to the relay's `/fishbones/auth/password-reset/confirm` endpoint.
//
// On success we don't auto-sign-in (the token is single-use and
// has just been consumed) — we route the user back to the kata
// embed at /learn so they can sign in with their freshly-changed
// credential, which exercises the new password and confirms it
// works. Some flows do auto-login here for friction reasons;
// resetting a password is rare enough that a one-click confirm of
// the new credential is worth the extra step.
//
// The strength scoring + show/hide toggle mirror the kata desktop
// PasswordField (Apps/Fishbones/src/components/SignInDialog/PasswordField.tsx)
// so the cross-surface UX matches. The two implementations are kept
// in lockstep manually — the page is small enough that a shared
// dependency would be more friction than it's worth.

import { useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./ResetPassword.css";

// The live relay. Was `https://api.mattssoftware.com` with a
// `/fishbones/` path prefix — both are pre-rebrand and now dead (the
// host fails TLS), which silently broke web password reset. The current
// relay is `https://api.libre.academy/auth/*`, same as the desktop app.
const RELAY_URL = "https://api.libre.academy";
const PASSWORD_MIN_LENGTH = 8;

type Strength = 0 | 1 | 2 | 3 | 4;

interface PasswordScore {
  score: Strength;
  label: string;
  hint?: string;
  belowMinLength: boolean;
}

const COMMON_PREFIXES = [
  "password",
  "qwerty",
  "abc123",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "fishbones",
];

const LAZY_PATTERNS = [
  /^(?:0123456789|123456789?|987654321|abcdefgh|qwertyuiop)/i,
  /^(\w)\1{4,}/,
];

/// Same heuristic the kata PasswordField uses — kept in lockstep so
/// the Strong/Good/Fair/Weak buckets line up across surfaces. See
/// the original component for the rationale on the weights.
function scorePassword(value: string): PasswordScore {
  if (value.length === 0) {
    return { score: 0, label: "", belowMinLength: true };
  }
  if (value.length < PASSWORD_MIN_LENGTH) {
    return {
      score: 1,
      label: "Too short",
      hint: `${PASSWORD_MIN_LENGTH}+ characters required`,
      belowMinLength: true,
    };
  }
  let points = 0;
  if (value.length >= PASSWORD_MIN_LENGTH) points += 1;
  if (value.length >= 12) points += 1;
  if (value.length >= 16) points += 1;
  if (value.length >= 20) points += 1;
  let classPts = 0;
  if (/[a-z]/.test(value)) classPts += 1;
  if (/[A-Z]/.test(value)) classPts += 1;
  if (/\d/.test(value)) classPts += 1;
  if (/[^a-zA-Z0-9]/.test(value)) classPts += 1;
  points += Math.min(classPts, 3);
  const lower = value.toLowerCase();
  const isCommon = COMMON_PREFIXES.some((p) => lower.startsWith(p));
  const isLazy = LAZY_PATTERNS.some((re) => re.test(value));
  if (isCommon) points -= 4;
  if (isLazy) points -= 3;
  const score: Strength =
    points <= 2 ? 1 : points <= 4 ? 2 : points <= 6 ? 3 : 4;
  switch (score) {
    case 1:
      return {
        score,
        label: "Weak",
        hint: isCommon
          ? "common password — pick something less guessable"
          : isLazy
            ? "looks lazy — try a passphrase or random characters"
            : "add length, mix cases, digits, symbols",
        belowMinLength: false,
      };
    case 2:
      return { score, label: "Fair", hint: "longer or more variety helps", belowMinLength: false };
    case 3:
      return { score, label: "Good", belowMinLength: false };
    case 4:
    default:
      return { score: 4, label: "Strong", belowMinLength: false };
  }
}

function EyeOpen() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeClosed() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A10.4 10.4 0 0 1 12 6c6.5 0 10 7 10 7a17.5 17.5 0 0 1-3.7 4.3M6.6 6.6A17.6 17.6 0 0 0 2 13s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" />
      <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
    </svg>
  );
}

interface PwInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  showStrength?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  error?: string | null;
  helper?: string | null;
}

function PwInput({
  label,
  value,
  onChange,
  showStrength = false,
  autoComplete = "new-password",
  disabled,
  error,
  helper,
}: PwInputProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const score = useMemo(() => scorePassword(value), [value]);
  const hasError = !!error;
  return (
    <div className={`reset-pwfield${hasError ? " reset-pwfield--invalid" : ""}`}>
      <label className="reset-pwfield__label" htmlFor={id}>{label}</label>
      <div className="reset-pwfield__row">
        <input
          id={id}
          className="reset-pwfield__input"
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          spellCheck={false}
          disabled={disabled}
          aria-invalid={hasError || undefined}
        />
        <button
          type="button"
          className="reset-pwfield__toggle"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
          tabIndex={value.length === 0 ? -1 : 0}
          disabled={disabled}
        >
          {revealed ? <EyeClosed /> : <EyeOpen />}
        </button>
      </div>
      {showStrength && value.length > 0 && !hasError && (
        <div className={`reset-pwfield__strength reset-pwfield__strength--s${score.score}`} aria-live="polite">
          <div className="reset-pwfield__bar" aria-hidden>
            <span className="reset-pwfield__bar-seg" data-on={score.score >= 1 || undefined} />
            <span className="reset-pwfield__bar-seg" data-on={score.score >= 2 || undefined} />
            <span className="reset-pwfield__bar-seg" data-on={score.score >= 3 || undefined} />
            <span className="reset-pwfield__bar-seg" data-on={score.score >= 4 || undefined} />
          </div>
          <span className="reset-pwfield__label-strength">{score.label}</span>
        </div>
      )}
      {hasError ? (
        <small className="reset-pwfield__error">{error}</small>
      ) : helper ? (
        <small className="reset-pwfield__helper">
          {value.length > 0 && score.hint ? score.hint : helper}
        </small>
      ) : null}
    </div>
  );
}

type Phase = "form" | "submitting" | "success" | "error";

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phase, setPhase] = useState<Phase>(token ? "form" : "error");
  const [errorMsg, setErrorMsg] = useState<string | null>(
    token ? null : "Reset link is missing the token. Open the link from your email again, or request a new one.",
  );

  const score = scorePassword(password);
  const confirmMismatch =
    confirm.length > 0 &&
    confirm.length >= Math.min(password.length, 4) &&
    password !== confirm;
  const canSubmit =
    phase === "form" &&
    !!token &&
    !score.belowMinLength &&
    confirm.length > 0 &&
    password === confirm;

  // Auto-redirect after a successful confirm. 4 seconds gives the
  // user time to read the success message before the page changes
  // out from under them.
  //
  // Use `window.location.assign` rather than the router's `navigate`
  // because `/learn` isn't a SPA route — Caddy rewrites it to the
  // embedded learn-app's index.html. A client-side router push would
  // hit the SPA's catch-all NotFound and never trigger the rewrite.
  useEffect(() => {
    if (phase !== "success") return;
    const t = window.setTimeout(() => {
      window.location.assign("/learn");
    }, 4000);
    return () => window.clearTimeout(t);
  }, [phase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setPhase("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch(`${RELAY_URL}/auth/password-reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      if (res.status === 401) {
        setErrorMsg("This reset link is invalid or has expired. Request a new one from the sign-in dialog.");
        setPhase("error");
        return;
      }
      if (res.status === 400) {
        setErrorMsg("Password didn't meet the minimum length (8 characters).");
        setPhase("form");
        return;
      }
      if (!res.ok && res.status !== 204) {
        setErrorMsg(`Couldn't reset password (${res.status}). Please try again in a moment.`);
        setPhase("form");
        return;
      }
      setPhase("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Couldn't reach the server. Please try again.");
      setPhase("form");
    }
  }

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h1 className="reset-card__title">Reset your password</h1>

        {phase === "error" ? (
          <>
            <p className="reset-card__blurb reset-card__blurb--error">
              {errorMsg ?? "Something went wrong. Please try again."}
            </p>
            {/* Two CTAs depending on what kind of error we're in:
                - Missing token (stranded link)        → back to /learn
                - Invalid / expired / consumed token   → request a new
                  reset (the SignInDialog's forgot-password mode lives
                  on /learn). Both end up at /learn anyway, but the
                  copy makes the next step clear. */}
            {/* Full-page nav rather than client-side <Link> — the
                `/learn` path is served by Caddy's rewrite to the
                embedded app's index.html, NOT by the marketing SPA's
                router. A <Link> click would hit the SPA's catch-all
                NotFound before the rewrite gets a chance. */}
            <a href="/learn" className="reset-card__cta">
              {token ? "Request a new reset link" : "Back to Libre"}
            </a>
          </>
        ) : phase === "success" ? (
          <>
            <p className="reset-card__blurb reset-card__blurb--success">
              Password updated. Redirecting to the sign-in page in a few
              seconds — or click below to go now.
            </p>
            <a href="/learn" className="reset-card__cta">
              Sign in with new password
            </a>
          </>
        ) : (
          <form className="reset-form" onSubmit={onSubmit}>
            <p className="reset-card__blurb">
              Choose a new password. The link you used can only be redeemed once.
            </p>

            <PwInput
              label="New password"
              value={password}
              onChange={setPassword}
              showStrength
              disabled={phase === "submitting"}
              helper={`At least ${PASSWORD_MIN_LENGTH} characters. Mix cases, digits, and symbols for a stronger password.`}
            />

            <PwInput
              label="Confirm password"
              value={confirm}
              onChange={setConfirm}
              disabled={phase === "submitting"}
              error={confirmMismatch ? "Passwords don't match" : null}
            />

            {/* Inline form error — fires for 400 (password length)
                and network failures, both of which keep phase ===
                "form". 401 / missing-token errors set phase to
                "error" and render the dedicated error view above
                instead, so this branch never renders for those. */}
            {errorMsg && (
              <p className="reset-card__error">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="reset-card__cta"
              disabled={!canSubmit}
            >
              {phase === "submitting" ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
