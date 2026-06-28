import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../lib/useSeo";
import { LANGUAGES } from "../data/languages";
import {
  Apple,
  ArrowRight,
  Boxes,
  Cloud,
  Download as DownloadIcon,
  Globe,
  Laptop,
  PlayCircle,
  ShieldOff,
} from "lucide-react";
import { GithubMark } from "../components/icons/GithubMark";
import { DownloadButton } from "../components/DownloadButton/DownloadButton";
import "./Download.css";

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}
interface Release {
  tag_name: string;
  assets: ReleaseAsset[];
  html_url: string;
}

interface PlatformBuild {
  os: "macos" | "windows" | "linux";
  label: string;
  icon: typeof Apple;
  /// Asset filename suffix(es) we accept for this platform.
  match: (n: string) => boolean;
  fallbackUrl?: string;
}

const PLATFORMS: PlatformBuild[] = [
  {
    os: "macos",
    label: "macOS",
    icon: Apple,
    match: (n) => n.endsWith(".dmg"),
  },
  {
    os: "windows",
    label: "Windows",
    icon: Laptop,
    match: (n) => n.endsWith(".msi") || n.endsWith(".exe"),
  },
  {
    os: "linux",
    label: "Linux",
    icon: Boxes,
    match: (n) => n.endsWith(".AppImage") || n.endsWith(".deb"),
  },
];

const FALLBACK_URL = "https://github.com/InfamousVague/Libre.academy/releases/latest";

export function Download() {
  useSeo({
    title: "Download Libre Academy — Free Desktop App for Mac, Windows & Linux",
    description: `Download Libre Academy for free. MIT-licensed desktop app with ${LANGUAGES.length} language runtimes, AI tutor, and PDF/EPUB course ingest. No signup, no paywall.`,
    canonicalUrl: "https://libre.academy/download",
  });
  const [release, setRelease] = useState<Release | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("https://api.github.com/repos/InfamousVague/Libre.academy/releases/latest")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Release | null) => {
        if (cancelled) return;
        setRelease(data);
      })
      .catch(() => {
        // Keep null — UI falls back to a generic releases link.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const versionLabel = release?.tag_name ? release.tag_name.replace(/^v/, "v") : "";

  const downloadFor = (platform: PlatformBuild): string => {
    if (!release) return platform.fallbackUrl ?? FALLBACK_URL;
    const asset = release.assets.find((a) => platform.match(a.name));
    return asset?.browser_download_url ?? release.html_url ?? FALLBACK_URL;
  };

  return (
    <div className="download-page">
      <header className="download-hero">
        <div className="download-hero__inner">
          <span className="section__eyebrow">Get Libre Academy</span>
          <h1 className="section__title">
            Free coding courses, on the web or on your desktop.
          </h1>
          <p className="download-hero__lede">
            Two ways to run Libre Academy — both free, both MIT licensed,
            both interactive. The browser version is the fastest way to
            sample any course. The desktop app adds ingest, native runtimes
            for {LANGUAGES.length} languages, and a local AI tutor.
          </p>
        </div>
      </header>

      <section className="section download-tiers">
        <Tier
          icon={Globe}
          eyebrow="Sample"
          title="In your browser"
          price="Free"
          summary="Seventeen starter courses, runs in IndexedDB, no install."
          features={[
            "Sixteen+ browser-runnable languages",
            "Full Monaco editor + hidden tests",
            "Streak + XP tracking (this device only)",
            "Per-tab progress, no cloud sync",
            "No accounts. No telemetry.",
          ]}
          cta={{
            href: "/learn/",
            label: "Open browser app",
            primary: true,
            icon: PlayCircle,
            // `/learn/` is Caddy-rewritten to the embedded app's
            // index.html — NOT a marketing-SPA route. Force a
            // same-tab full navigation so the request actually
            // reaches Caddy instead of the client router 404ing.
            fullNav: true,
          }}
          ctaSecondary={{
            href: "/courses",
            label: "Browse courses",
          }}
        />

        <Tier
          icon={Laptop}
          eyebrow="Daily driver"
          title="Desktop app"
          price="Free"
          summary="The full experience — every language, ingest, AI tutor, native runtimes."
          features={[
            "PDF + EPUB ingest with the Claude pipeline",
            "Docs-site crawler + challenge-pack generator",
            "Native subprocess runners (C/C++/Java/Kotlin/C#/Swift/Asm)",
            "Local Ollama tutor (zero token cost)",
            "Pop-out workbench, multi-monitor friendly",
            "Portable .academy archives — share courses with anyone",
          ]}
          // Custom CTA: a split-button DownloadButton that auto-detects
          // the visitor's OS and links DIRECTLY to the latest .dmg/
          // .msi/.AppImage asset, with a caret for picking older
          // versions or alternative platform builds. Replaces the
          // earlier `Download for your OS` link that pointed at the
          // GitHub releases tag page (one extra click + scroll for
          // the user to actually start the download).
          ctaCustom={<DownloadButton />}
          ctaSecondary={{
            href: "https://github.com/InfamousVague/Libre.academy",
            label: "View source",
            external: true,
          }}
          highlight
        />

        <Tier
          icon={Cloud}
          eyebrow="Optional"
          title="Cloud sync"
          price="Free"
          summary="Mirror progress, XP, and streak across machines. Opt-in, off by default."
          features={[
            "Tiny JSON progress records — nothing else stored",
            "End-to-end encryption on the wire",
            "One toggle in Settings, no second account to make",
            "Open source server — self-host if you'd rather",
            "Lesson contents stay on your disk",
          ]}
          cta={{
            href: "/docs/principles/offline",
            label: "Read the privacy notes",
            primary: false,
            icon: ShieldOff,
            external: false,
          }}
        />
      </section>

      {/* ─── Platform downloads ──────────────────────────── */}
      <section className="section download-platforms">
        <h2 className="section__title">Pick your platform.</h2>
        <p className="section__subtitle">
          Universal build on macOS (Apple Silicon + Intel), MSI on Windows,
          AppImage + .deb on Linux.
        </p>
        <div className="download-platforms__grid">
          {PLATFORMS.map((p) => {
            const url = downloadFor(p);
            return (
              <a
                key={p.os}
                href={url}
                className="card download-platforms__card"
                rel="noopener noreferrer"
              >
                <span className="download-platforms__icon">
                  <p.icon size={24} />
                </span>
                <h3>{p.label}</h3>
                <p className="muted">
                  {versionLabel ? `Latest · ${versionLabel}` : "Latest release"}
                </p>
                <span className="download-platforms__cta">
                  <DownloadIcon size={14} /> Download
                </span>
              </a>
            );
          })}
        </div>
        <p className="download-platforms__hint">
          Or grab any build directly from{" "}
          <a
            href="https://github.com/InfamousVague/Libre.academy/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubMark size={12} /> GitHub Releases
          </a>
          .
        </p>
      </section>

      {/* ─── Final CTA ──────────────────────────────────── */}
      <section className="section section--narrow download-final">
        <h2 className="section__title section__title--centered">
          Honestly free. We're not building a paid tier.
        </h2>
        <p className="section__subtitle section__subtitle--centered">
          Libre Academy is open source under MIT. The desktop app is free.
          The cloud sync server is free. The browser version is free. There
          is no roadmap, ever, for any of that to change.
        </p>
        <div className="download-final__actions">
          <Link to="/about" className="btn btn--ghost btn--lg">
            Why we built it <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Tier({
  icon: Icon,
  eyebrow,
  title,
  price,
  summary,
  features,
  cta,
  ctaCustom,
  ctaSecondary,
  highlight = false,
}: {
  icon: typeof Apple;
  eyebrow: string;
  title: string;
  price: string;
  summary: string;
  features: string[];
  /// Standard link CTA. Provide either this OR `ctaCustom`, not both.
  ///
  /// Link mode resolution:
  ///   - `external: true`  → `<a target="_blank">` (off-site, new tab)
  ///   - `fullNav: true`   → `<a>` same tab, NO React Router. Use for
  ///     paths the marketing SPA doesn't own — chiefly `/learn/`,
  ///     which Caddy rewrites to the embedded app's index.html. A
  ///     client-side `<Link>` to it would hit the SPA's 404 catch-all
  ///     since `/learn/` isn't a defined route here.
  ///   - neither           → `<Link>` (client-side SPA route)
  cta?: {
    href: string;
    label: string;
    primary: boolean;
    icon: typeof Apple;
    external?: boolean;
    fullNav?: boolean;
  };
  /// Slot for an arbitrary CTA element (e.g. the DownloadButton split
  /// button used by the desktop tier — needs version-picker behaviour
  /// the simple link can't express).
  ctaCustom?: React.ReactNode;
  ctaSecondary?: {
    href: string;
    label: string;
    external?: boolean;
    fullNav?: boolean;
  };
  highlight?: boolean;
}) {
  return (
    <article className={`download-tier${highlight ? " download-tier--highlight" : ""}`}>
      <header className="download-tier__head">
        <span className="download-tier__icon">
          <Icon size={18} />
        </span>
        <span className="download-tier__eyebrow">{eyebrow}</span>
      </header>
      <h3 className="download-tier__title">{title}</h3>
      <p className="download-tier__price">{price}</p>
      <p className="download-tier__summary">{summary}</p>
      <ul className="download-tier__features">
        {features.map((f) => (
          <li key={f}>
            <span className="download-tier__bullet" /> {f}
          </li>
        ))}
      </ul>
      <div className="download-tier__cta-row">
        {ctaCustom
          ? ctaCustom
          : cta &&
            (cta.external ? (
              <a
                href={cta.href}
                className={cta.primary ? "btn btn--primary" : "btn btn--ghost"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <cta.icon size={14} /> {cta.label}
              </a>
            ) : cta.fullNav ? (
              // Same-tab full navigation — no React Router. The
              // target (`/learn/`) is served by Caddy's rewrite, not
              // a SPA route, so a `<Link>` would 404 in the client.
              <a
                href={cta.href}
                className={cta.primary ? "btn btn--primary" : "btn btn--ghost"}
              >
                <cta.icon size={14} /> {cta.label}
              </a>
            ) : (
              <Link
                to={cta.href}
                className={cta.primary ? "btn btn--primary" : "btn btn--ghost"}
              >
                <cta.icon size={14} /> {cta.label}
              </Link>
            ))}
        {ctaSecondary &&
          (ctaSecondary.external ? (
            <a
              href={ctaSecondary.href}
              className="btn btn--subtle"
              target="_blank"
              rel="noopener noreferrer"
            >
              {ctaSecondary.label}
            </a>
          ) : ctaSecondary.fullNav ? (
            <a href={ctaSecondary.href} className="btn btn--subtle">
              {ctaSecondary.label}
            </a>
          ) : (
            <Link to={ctaSecondary.href} className="btn btn--subtle">
              {ctaSecondary.label}
            </Link>
          ))}
      </div>
    </article>
  );
}
