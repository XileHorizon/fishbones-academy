// Split-button download CTA: a primary face that auto-detects the
// visitor's OS and links DIRECTLY to the latest .dmg/.msi/.AppImage
// asset (skipping the GitHub release page), and a caret-attached
// dropdown that lets a power user pick a specific version + platform.
//
// Why direct asset URLs and not html_url:
//   The previous CTA pointed at github.com/.../releases/tag/v0.1.8
//   so a click landed users on the assets list, costing them a
//   second click + a scroll. The browser_download_url field on each
//   release asset is the cdn-fronted .dmg/.msi/.AppImage itself —
//   one click, save dialog opens.
//
// Data source: the unauthenticated GitHub REST API. The /releases
// endpoint returns up to 30 releases ordered newest-first; we keep
// the top 8 by default to bound the dropdown height.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { Apple, Boxes, ChevronDown, Download, Laptop } from "lucide-react";
import "./DownloadButton.css";

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}
interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  html_url: string;
  assets: ReleaseAsset[];
}

type DetectedOS = "macos" | "windows" | "linux" | "unknown";

interface PlatformDef {
  os: Exclude<DetectedOS, "unknown">;
  label: string;
  icon: typeof Apple;
  /// Asset filename predicate, in PRIORITY order — first match wins.
  /// e.g. on Windows we prefer the .msi installer over the raw .exe
  /// because msiexec gives users uninstall + group-policy hooks the
  /// portable .exe doesn't.
  match: ReadonlyArray<(name: string) => boolean>;
}

const PLATFORMS: ReadonlyArray<PlatformDef> = [
  {
    os: "macos",
    label: "macOS",
    icon: Apple,
    match: [(n) => n.endsWith(".dmg")],
  },
  {
    os: "windows",
    label: "Windows",
    icon: Laptop,
    // .msi over .exe: standardized installer wrapper.
    match: [(n) => n.endsWith(".msi"), (n) => n.endsWith(".exe")],
  },
  {
    os: "linux",
    label: "Linux",
    icon: Boxes,
    // .AppImage over .deb: distro-agnostic. .rpm omitted from the
    // default tier — Fedora users grab it via the dropdown.
    match: [(n) => n.endsWith(".AppImage"), (n) => n.endsWith(".deb")],
  },
];

const RELEASES_URL =
  "https://api.github.com/repos/InfamousVague/Fishbones/releases";
const GITHUB_RELEASES_PAGE =
  "https://github.com/InfamousVague/Fishbones/releases";
const MAX_VERSIONS_IN_DROPDOWN = 8;

/// Inspect navigator.userAgent + navigator.platform to guess the
/// visitor's OS. Falls back to "unknown" for unrecognised UAs (rare;
/// game consoles, e-readers, etc.) and the dropdown shows all
/// platforms instead of a single primary CTA.
function detectOS(): DetectedOS {
  if (typeof navigator === "undefined") return "unknown";
  const ua = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
  if (/mac|darwin|iphone|ipad|ipod/.test(ua)) return "macos";
  if (/win/.test(ua)) return "windows";
  if (/linux|x11|cros/.test(ua)) return "linux";
  return "unknown";
}

/// Find the asset on a release that best matches a target platform.
/// Walks the platform's `match` predicates in priority order and
/// returns the first asset that satisfies one — falls back to the
/// first asset matching ANY of the predicates if none of the
/// preferred ones did. Returns null if the release has no asset for
/// this platform.
function findAsset(
  release: Release,
  platform: PlatformDef,
): ReleaseAsset | null {
  for (const pred of platform.match) {
    const hit = release.assets.find((a) => pred(a.name));
    if (hit) return hit;
  }
  return null;
}

/// "March 14, 2025" — short, localised. Used in the dropdown's
/// per-version row.
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/// Pretty-print bytes — short form to keep the dropdown tight.
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(0)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

interface Props {
  /// Optional class to allow the caller to slot a hero-sized variant.
  /// We do the same on the Fishbones desktop app's DownloadButton
  /// so the welcome screen can style this element bigger without
  /// wrapping it in another div.
  className?: string;
}

export function DownloadButton({ className }: Props): ReactElement {
  const [releases, setReleases] = useState<Release[] | null>(null);
  const [open, setOpen] = useState(false);
  const detectedOS = useMemo(() => detectOS(), []);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Fetch releases on mount. Cached at the GitHub-CDN edge for ~60s
  // so even without our own caching we're not hitting the API
  // hard. We keep all releases (typically 30 in the response, we
  // slice to MAX_VERSIONS_IN_DROPDOWN below for display).
  useEffect(() => {
    let cancelled = false;
    fetch(RELEASES_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Release[] | null) => {
        if (cancelled || !data) return;
        // Drop drafts (shouldn't be visible to the public anyway,
        // but unauthenticated API hides them already — belt + braces).
        // Keep prereleases — labelled in the UI, useful for testers.
        setReleases(data.filter((r) => !r.draft));
      })
      .catch(() => {
        // Network error — UI falls back to the GitHub Releases link.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Click-outside / Escape dismisses the dropdown. Only listens
  // while open so we don't leak global handlers per render.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      if (wrapRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const latest = releases?.[0] ?? null;
  const primaryPlatform =
    detectedOS === "unknown"
      ? null
      : PLATFORMS.find((p) => p.os === detectedOS) ?? null;
  const primaryAsset =
    latest && primaryPlatform ? findAsset(latest, primaryPlatform) : null;

  // Primary face: prefer a direct asset URL; if the platform isn't
  // detected, fall back to opening the dropdown so the user can pick.
  const primaryHref =
    primaryAsset?.browser_download_url ??
    latest?.html_url ??
    GITHUB_RELEASES_PAGE;
  const primaryLabel = (() => {
    if (!latest) return "Download";
    if (primaryPlatform) {
      return `Download ${latest.tag_name} for ${primaryPlatform.label}`;
    }
    return `Download ${latest.tag_name}`;
  })();
  const PrimaryIcon = primaryPlatform?.icon ?? Download;

  return (
    <div
      className={`download-button${className ? ` ${className}` : ""}`}
      ref={wrapRef}
    >
      {/* Primary face — direct link, opens the save dialog. */}
      <a
        href={primaryHref}
        className="download-button__primary"
        rel="noopener noreferrer"
        // No target=_blank: a direct asset URL just kicks off a
        // download in the same tab without ever navigating, so the
        // existing tab stays put without a flash of an empty new
        // window. The github fallback URL DOES open in-tab the
        // same way — that's a navigation either way and a new tab
        // would be unexpected.
      >
        <PrimaryIcon size={16} aria-hidden />
        <span>{primaryLabel}</span>
      </a>
      {/* Caret — opens the version + platform picker. */}
      <button
        type="button"
        className={`download-button__caret${
          open ? " download-button__caret--open" : ""
        }`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Pick a different version or platform"
        title="Pick a different version or platform"
      >
        <ChevronDown size={14} aria-hidden />
      </button>

      {open && (
        <div
          className="download-button__pop"
          role="menu"
          aria-label="Choose version and platform"
        >
          {!releases ? (
            <div className="download-button__pop-empty">Loading releases…</div>
          ) : releases.length === 0 ? (
            <div className="download-button__pop-empty">
              Couldn't fetch releases. Try{" "}
              <a href={GITHUB_RELEASES_PAGE} rel="noopener noreferrer">
                GitHub Releases
              </a>
              .
            </div>
          ) : (
            <>
              {releases.slice(0, MAX_VERSIONS_IN_DROPDOWN).map((rel, idx) => (
                <ReleaseRow key={rel.tag_name} release={rel} highlight={idx === 0} />
              ))}
              <a
                href={GITHUB_RELEASES_PAGE}
                target="_blank"
                rel="noopener noreferrer"
                className="download-button__pop-all"
                role="menuitem"
              >
                View all releases on GitHub →
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/// One release in the dropdown. Header: version + date + (prerelease
/// badge if applicable). Below: a row of platform pills, each a
/// direct download link to that release's asset for that platform.
/// Platforms with no asset on this release are dimmed and disabled.
function ReleaseRow({
  release,
  highlight,
}: {
  release: Release;
  highlight: boolean;
}): ReactElement {
  return (
    <div
      className={`download-button__release${
        highlight ? " download-button__release--latest" : ""
      }`}
    >
      <div className="download-button__release-head">
        <span className="download-button__release-tag">
          {release.tag_name}
          {highlight && (
            <span className="download-button__release-badge">Latest</span>
          )}
          {release.prerelease && (
            <span className="download-button__release-badge download-button__release-badge--pre">
              Pre-release
            </span>
          )}
        </span>
        <span className="download-button__release-date">
          {formatDate(release.published_at)}
        </span>
      </div>
      <div className="download-button__release-platforms">
        {PLATFORMS.map((p) => {
          const asset = findAsset(release, p);
          const Icon = p.icon;
          if (!asset) {
            return (
              <span
                key={p.os}
                className="download-button__platform download-button__platform--missing"
                title={`No ${p.label} build for ${release.tag_name}`}
              >
                <Icon size={14} aria-hidden />
                {p.label}
              </span>
            );
          }
          return (
            <a
              key={p.os}
              href={asset.browser_download_url}
              className="download-button__platform"
              role="menuitem"
              rel="noopener noreferrer"
              title={`${asset.name} · ${formatSize(asset.size)}`}
            >
              <Icon size={14} aria-hidden />
              {p.label}
              <span className="download-button__platform-size">
                {formatSize(asset.size)}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
