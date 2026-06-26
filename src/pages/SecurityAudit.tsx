import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ShieldAlert,
  PackageCheck,
  Lock,
  Eye,
  GitBranch,
  Terminal,
  FileSearch,
  CheckCircle2,
  CircleSlash,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { GithubMark } from "../components/icons/GithubMark";
import "./SecurityAudit.css";

/// Public security + supply-chain transparency page.
///
/// Two halves: a reproducible dependency / supply-chain scan, and a
/// summary of a deep internal CODE audit (sandbox-escape, the native
/// command surface, content rendering, the AI agent, auth/sync).
///
/// Disclosure policy: the High-severity code-audit findings were
/// FIXED before this page was published — we don't ship working
/// exploits for a public repo. They're disclosed here as resolved,
/// at a category level (no file:line exploit maps), which is the
/// same responsible-disclosure stance the preamble asks of readers.
/// Remaining items are honest, named, defense-in-depth hardening.
///
/// Refresh the snapshot date + the npm-advisory counts whenever a
/// dependency bump materially changes `npm audit` output.

const REPO = "https://github.com/InfamousVague/Libre.academy";

const SUPPLY_CHAIN = [
  {
    name: 'Shai-Hulud / "qix" worm',
    when: "Sep 2025",
    pkgs: "chalk · debug · ansi-styles · strip-ansi · color-convert",
    bad: "chalk@5.6.1, debug@4.4.2",
    clear: "ship chalk 5.6.2, debug 4.4.3 — past the poisoned releases",
  },
  {
    name: "@solana/web3.js backdoor",
    when: "Dec 2024",
    pkgs: "@solana/web3.js",
    bad: "1.95.6, 1.95.7",
    clear: "ship 1.98.4 — the backdoored builds are not in the tree",
  },
  {
    name: "ua-parser-js hijack",
    when: "Oct 2021",
    pkgs: "ua-parser-js",
    bad: "0.7.29, 0.8.0, 1.0.0",
    clear: "ship 1.0.41 — clean of the cryptominer releases",
  },
  {
    name: "node-ipc protestware",
    when: "Mar 2022",
    pkgs: "node-ipc",
    bad: "9.2.2, 10.1.1, 10.1.2",
    clear: "none of the sabotage versions are present",
  },
  {
    name: "eslint-config-prettier compromise",
    when: "Jul 2025",
    pkgs: "eslint-config-prettier",
    bad: "8.10.1, 9.1.1, 10.1.6",
    clear: "compromised tags absent from the lockfile",
  },
  {
    name: "event-stream backdoor",
    when: "2018",
    pkgs: "event-stream / flatmap-stream",
    bad: "3.3.6",
    clear: "not a dependency, at any version",
  },
];

const POSTURE = [
  {
    icon: Lock,
    title: "Sandboxed code execution — verified",
    body: "The deep audit's headline question was whether learner code can escape to your machine. It can't: JavaScript / TypeScript / Python run in isolated Web Workers with no DOM, no Tauri bridge, and a hard kill-timer; web/React previews run on a separate localhost origin. Untrusted lesson code never reaches the native command bridge.",
  },
  {
    icon: ShieldCheck,
    title: "Minimal Tauri capability surface",
    body: "The webview is granted only window + webview lifecycle permissions — no blanket filesystem, shell, or HTTP capability. A real Content-Security-Policy is set (no inline/eval scripts), there is no global Tauri injection, and auto-updates are minisign-signed against an embedded key.",
  },
  {
    icon: GitBranch,
    title: "Solid auth & data isolation",
    body: "Argon2id passwords and tokens, single-use SHA-256 reset tokens with timing-equalized anti-enumeration, JWKS-verified OAuth with issuer/audience pinning + PKCE + CSRF state, and strictly per-account data partitioning — one user cannot read another's progress or files.",
  },
  {
    icon: Lock,
    title: "Local-first by default",
    body: "Courses, progress, streak, and XP live in on-device SQLite / IndexedDB. Nothing leaves the machine unless you opt into cloud sync. The app runs fully offline.",
  },
  {
    icon: Eye,
    title: "No silent telemetry; no secrets in git",
    body: "Desktop / iOS builds send zero analytics. The site uses cookieless, self-hosted, first-party Plausible. No credentials are committed to either repository, and the deploy secret cannot reach the client bundle.",
  },
  {
    icon: GitBranch,
    title: "Fully open source, MIT",
    body: "The desktop app, the browser build, this site, and the sync server are all public on GitHub under MIT. Every claim on this page is checkable against that source.",
  },
];

/// High-severity code-audit findings — FIXED before this page went
/// live. Described at a category level on purpose.
const RESOLVED = [
  {
    title: "Toolchain installer command not allowlisted",
    sev: "was High",
    body: "A backend command that installs language toolchains accepted a caller-supplied command string and ran it through a shell. Fixed: the supplied command is now rejected unless it exactly matches the small, fixed set the toolchain recipe can legitimately produce for that language.",
  },
  {
    title: "Course-archive path traversal (zip-slip)",
    sev: "was High",
    body: "Importing a maliciously crafted course archive could write files outside the courses directory because entry paths weren't checked for traversal. Fixed: every archive entry path and the archive's declared id are now component-validated; any `..` / absolute / drive component fails the whole import.",
  },
  {
    title: "Desktop OAuth callback not bound to the sign-in attempt",
    sev: "was High",
    body: "The desktop sign-in deep link applied whatever token arrived without checking it came from the sign-in this app started — a crafted link could sign you into an unintended account. Fixed: the callback is now verified against a single-use, time-bounded session nonce (the same control the browser flow already had).",
  },
  {
    title: "AI agent auto-ran generated code by default",
    sev: "was Medium",
    body: "The coding agent shipped with auto-approve on, so generated file writes / runs could happen unattended — risky because untrusted lesson text enters the model's context. Fixed: auto-approve now ships OFF; each write / patch / run asks for explicit approval (power users can re-enable it).",
  },
];

/// Honest, named defense-in-depth work still in progress. Kept
/// general — none is a passive-user remote risk.
const TRACKED = [
  "Per-IP rate-limiting on the unauthenticated auth / password-reset endpoints (currently leaning on Argon2 cost).",
  "HTTP security response headers — HSTS, CSP, X-Frame-Options, Referrer-Policy — on the site and relay.",
  "Execution timeouts, output caps, and resource limits on the local native compilers (so a runaway lesson can't hang or starve the host); per-run randomized temp directories.",
  "Move stored AI API keys from the plaintext settings file into the OS keychain.",
  "A second-layer HTML sanitizer behind the Markdown renderer (today's XSS defense is correct but single-setting).",
  "Cryptographically signed completion certificates (today they're self-asserted and not a security boundary).",
  "Route the AI stream-file-writer through the same approval/scope gate as the formal write tool.",
];

export function SecurityAudit() {
  return (
    <div className="security-page section section--narrow">
      <span className="section__eyebrow">
        Security · code &amp; supply-chain audit · May 2026
      </span>
      <h1 className="section__title">Security &amp; supply-chain audit</h1>
      <p className="security-page__lede">
        A standing, public account of where Libre Academy is solid, what a
        deep code review found, what we fixed, and exactly how to confirm
        all of it for yourself. We'd rather show you the audit than ask you
        to trust us.
      </p>

      <aside className="security-preamble" role="note">
        <span className="security-preamble__icon" aria-hidden>
          <FileSearch size={20} />
        </span>
        <div>
          <h2 className="security-preamble__title">
            Don't take our word for it
          </h2>
          <p>
            This page is a summary, not a substitute for your own review.
            Everything that runs on your machine is open source. If you're
            security-conscious — and you should be — clone the repository,
            read the code, and run the same checks we did before you trust
            it with anything. The{" "}
            <a href="#verify-yourself">verify-it-yourself</a> section below
            has the exact commands. Healthy paranoia is welcome here.
          </p>
        </div>
      </aside>

      {/* Supply-chain result. */}
      <section className="security-section">
        <div className="security-banner security-banner--ok">
          <ShieldCheck size={22} aria-hidden />
          <div>
            <strong>No known-compromised packages.</strong> We scanned the
            full lockfile (762 entries) against the exact{" "}
            <code>name@version</code> pairs from every publicised npm
            supply-chain attack. None are present.
          </div>
        </div>

        <div className="security-grid security-grid--supply">
          {SUPPLY_CHAIN.map((s) => (
            <article className="security-card" key={s.name}>
              <header className="security-card__head">
                <span className="security-status security-status--ok">
                  <CheckCircle2 size={14} aria-hidden /> Clear
                </span>
                <span className="security-card__when">{s.when}</span>
              </header>
              <h3 className="security-card__title">{s.name}</h3>
              <p className="security-card__pkgs mono">{s.pkgs}</p>
              <dl className="security-card__detail">
                <div>
                  <dt>Compromised</dt>
                  <dd className="mono">{s.bad}</dd>
                </div>
                <div>
                  <dt>Our status</dt>
                  <dd>{s.clear}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      {/* What checks out. */}
      <section className="security-section">
        <h2 className="security-section__title">
          <ShieldCheck size={18} aria-hidden /> What checks out
        </h2>
        <div className="security-grid security-grid--posture">
          {POSTURE.map((p) => {
            const Icon = p.icon;
            return (
              <article className="security-card" key={p.title}>
                <span className="security-card__posture-icon" aria-hidden>
                  <Icon size={18} />
                </span>
                <h3 className="security-card__title">{p.title}</h3>
                <p className="security-card__body">{p.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Deep code audit — findings & remediation. */}
      <section className="security-section">
        <h2 className="security-section__title">
          <Wrench size={18} aria-hidden /> Code audit — found &amp; fixed
        </h2>
        <p className="security-section__lede">
          We didn't stop at <code>npm audit</code>. We ran a deep internal
          code review across the five surfaces that matter most for an app
          that runs code: sandbox escape, the native command surface,
          untrusted-content rendering, the AI agent, and auth / sync. It
          surfaced real issues. The High-severity ones were{" "}
          <strong>fixed before this page was published</strong> — we won't
          ship a working exploit for an open repo — and are disclosed here
          as resolved, by category. None was ever a zero-click remote risk
          to a passive user; each needed either a file you chose to import
          or a crafted link.
        </p>
        <div className="security-resolved">
          {RESOLVED.map((r) => (
            <article className="security-advisory" key={r.title}>
              <header className="security-advisory__head">
                <span className="security-status security-status--ok">
                  <CheckCircle2 size={14} aria-hidden /> Resolved ·{" "}
                  {r.sev}
                </span>
              </header>
              <h3 className="security-card__title">{r.title}</h3>
              <p className="security-card__body">{r.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Tracked hardening + npm advisories. */}
      <section className="security-section">
        <h2 className="security-section__title">
          <ShieldAlert size={18} aria-hidden /> Tracked hardening
        </h2>
        <p className="security-section__lede">
          The honest part: these are known, lower-severity, defense-in-depth
          improvements we have not landed yet. None is exploitable against a
          passive user; we list them so the gap is public, not hidden.
        </p>
        <ul className="security-tracked">
          {TRACKED.map((t) => (
            <li key={t}>
              <CircleSlash size={14} aria-hidden />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <div className="security-banner security-banner--info">
          <PackageCheck size={20} aria-hidden />
          <div>
            <strong>Dependency advisories:</strong> <code>npm audit</code>{" "}
            reports 14 transitive advisories (8 low / 5 moderate / 1 high /
            0 critical). Every one is in the build chain (esbuild / vite /
            vitest), the in-webview lesson sandbox (svelte / devalue — the
            SSR vectors aren't reachable client-side), or crypto transitives
            used only against throwaway lesson keypairs. They're patched as
            upstream ships fixes and re-checked on every dependency bump.
          </div>
        </div>
      </section>

      {/* Verify-it-yourself. */}
      <section className="security-section" id="verify-yourself">
        <h2 className="security-section__title">
          <Terminal size={18} aria-hidden /> Verify it yourself
        </h2>
        <p className="security-section__lede">
          Every number on this page is reproducible in a few minutes. Don't
          trust the summary — reproduce it.
        </p>
        <pre className="security-code">
          <code>{`# 1. Get the source
git clone ${REPO.replace("https://github.com/", "git@github.com:")}
cd Libre.academy

# 2. Reproduce the advisory counts on this page
npm ci
npm audit

# 3. Re-run the supply-chain scan: grep the lockfile for the
#    exact compromised versions from any npm incident, e.g.
grep -nE '"(chalk|debug|ua-parser-js|@solana/web3.js)"' package-lock.json

# 4. Read the privilege surface — the entire allowlist the
#    webview is granted is in one short file
cat src-tauri/capabilities/default.json

# 5. Confirm what leaves the machine (spoiler: nothing, by default)
ls src/lib  &&  rg -n "fetch\\\\(|invoke\\\\(" src/`}</code>
        </pre>
        <p className="security-section__foot">
          Found something? Responsible disclosure is appreciated — open a
          private security advisory on the{" "}
          <a
            href={`${REPO}/security/advisories/new`}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repo
          </a>{" "}
          rather than a public issue, and we'll work it. It's the same
          courtesy this page extends to you.
        </p>
      </section>

      {/* CTA cluster. */}
      <section className="security-final">
        <h2 className="security-final__title">Read the source</h2>
        <p>The strongest audit is the one you run. Start with the code.</p>
        <div className="security-final__actions">
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost btn--lg"
          >
            <GithubMark size={14} /> View on GitHub
          </a>
          <Link to="/privacy" className="btn btn--subtle btn--lg">
            Privacy policy <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <p className="security-page__back">
        <Link to="/">← Back home</Link>
      </p>
    </div>
  );
}
