import manifestRaw from "./courses-manifest.json";
import type {
  CourseManifest,
  CourseManifestEntry,
  FullCourse,
  ReleaseStatus,
} from "./types";
import { languageById } from "./languages";

/// Embedded manifest — kept in the bundle so the catalog renders even
/// when `public/starter-courses/` isn't populated (e.g. before
/// `npm run sync:courses`). The actual full course JSONs are fetched
/// lazily from /starter-courses/<id>.json when the user opens a course
/// detail page; the manifest carries everything the grid needs.
const manifest = manifestRaw as CourseManifest;

/// Curated topic tags. Each course pulls a single tag from this list
/// based on its language + packType. Used for the catalog's filter
/// bar — the manifest itself doesn't carry topic metadata, so we
/// derive it here. Keep it short on purpose: too many filters and the
/// page reads as a CMS export.
export type CourseTopic =
  | "languages"
  | "tracks"
  | "frameworks"
  | "challenges"
  | "web3"
  | "mobile"
  | "graphics";

const TOPIC_OVERRIDES: Record<string, CourseTopic> = {
  "the-rust-programming-language": "languages",

  "solidjs-fundamentals": "frameworks",
  "htmx-fundamentals": "frameworks",
  "astro-fundamentals": "frameworks",

  "react-native": "mobile",

  "solidity-complete": "web3",
  "solana-programs": "web3",
  "viem-ethers": "web3",
  "cryptography-fundamentals": "web3",
};

export const COURSE_TOPICS: Array<{ id: CourseTopic; label: string }> = [
  { id: "languages", label: "Languages" },
  { id: "tracks", label: "Tracks" },
  { id: "frameworks", label: "Frameworks" },
  { id: "mobile", label: "Mobile" },
  { id: "web3", label: "Web3" },
  { id: "graphics", label: "Graphics" },
  { id: "challenges", label: "Challenges" },
];

export type CourseDifficulty = "easy" | "medium" | "hard";

const DIFFICULTY_OVERRIDES: Record<string, CourseDifficulty> = {
  "htmx-fundamentals": "easy",
  "astro-fundamentals": "easy",
  "solidjs-fundamentals": "easy",
  "the-rust-programming-language": "medium",
  "react-native": "medium",
  "viem-ethers": "medium",
  "cryptography-fundamentals": "medium",
  "solidity-complete": "hard",
  "solana-programs": "hard",
  // Challenge packs scale with the user — we don't try to peg one tier.
};

export const COURSE_DIFFICULTIES: Array<{
  id: CourseDifficulty;
  label: string;
}> = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

export interface CatalogCourse extends CourseManifestEntry {
  /// Coarse topic bucket — drives the filter chips.
  topic: CourseTopic;
  /// Difficulty tier — drives a second filter chip row.
  difficulty?: CourseDifficulty;
  /// Pretty label for the language chip on each card.
  languageLabel: string;
  /// Best-effort lesson count — `sizeBytes` correlates loosely with
  /// course depth, but we'd rather show a real number. Populated from
  /// the actual JSON when the detail page hydrates; here we fall back
  /// to a heuristic so the card row stays informative.
  approxLessons: number;
  /// Human-readable estimated time. ~12min/lesson average from the
  /// app's own per-lesson telemetry.
  approxMinutes: number;
  /// Always-defined editorial tier (manifest's optional value
  /// normalised, with `UNREVIEWED` as the default). The catalog
  /// page groups cards by this; the tier vocabulary mirrors the
  /// kata desktop app so the same book reads identically across
  /// surfaces.
  releaseStatus: ReleaseStatus;
}

/// Editorial-tier section ordering for the catalog. BETA renders at
/// the top (most polished); UNREVIEWED renders at the bottom (drafts).
export const RELEASE_SECTION_ORDER: ReadonlyArray<{
  status: ReleaseStatus;
  label: string;
  blurb: string;
}> = [
  {
    status: "BETA",
    label: "Beta",
    blurb: "Polished and in final testing — feedback welcome.",
  },
  {
    status: "ALPHA",
    label: "Alpha",
    blurb: "In the collection — content stable, polishing in progress.",
  },
  {
    status: "UNREVIEWED",
    label: "Unreviewed",
    blurb: "Early drafts — content still expanding.",
  },
];

function normaliseReleaseStatus(s: string | undefined): ReleaseStatus {
  return s === "BETA" || s === "ALPHA" ? s : "UNREVIEWED";
}

function approximateLessons(entry: CourseManifestEntry): number {
  // Use the real lesson count from the manifest when available —
  // it is regenerated on every `sync:courses` run from the actual
  // course JSON, so it's exact. Fall back to a sizeBytes heuristic
  // for manifests that predate the lessonCount field.
  if (entry.lessonCount != null && entry.lessonCount > 0) {
    return entry.lessonCount;
  }
  // Roughly 5KB of JSON per lesson on average across the bundled
  // packs. Calibrated against the few we sampled; close enough for a
  // marketing card when the real count isn't present.
  const kb = (entry.sizeBytes ?? 80_000) / 1024;
  return Math.max(8, Math.round(kb / 5));
}

/// Some manifests (synced from older bundles, or merged from
/// multiple sources) have leaked duplicate entries with the same
/// `id`. The catalog renders strictly one card per id; the first
/// occurrence wins so manual ordering in the manifest is respected.
function dedupeById(entries: CourseManifestEntry[]): CourseManifestEntry[] {
  const seen = new Set<string>();
  const out: CourseManifestEntry[] = [];
  for (const e of entries) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
  }
  return out;
}

export const CATALOG: CatalogCourse[] = dedupeById(manifest.courses).map(
  (entry) => {
    const lang = languageById(entry.language);
    const topic: CourseTopic =
      entry.packType === "challenges"
        ? "challenges"
        : entry.packType === "track"
          ? "tracks"
          : TOPIC_OVERRIDES[entry.id] ?? "languages";
    const lessons = approximateLessons(entry);
    return {
      ...entry,
      topic,
      difficulty: DIFFICULTY_OVERRIDES[entry.id],
      languageLabel: lang?.name ?? entry.language,
      approxLessons: lessons,
      approxMinutes: lessons * 12,
      releaseStatus: normaliseReleaseStatus(entry.releaseStatus),
    };
  },
);

export function findCatalogCourse(id: string): CatalogCourse | undefined {
  return CATALOG.find((c) => c.id === id);
}

/// Lazy fetch of a course's full JSON. Lives at /starter-courses/<id>.json
/// in production (synced from kata's public/ via scripts/sync-starter-courses.mjs).
/// In dev, if the sync hasn't been run, this returns null and the detail
/// page renders a "preview unavailable, sync starter courses to see it"
/// banner — better than failing the build.
export async function fetchFullCourse(id: string): Promise<FullCourse | null> {
  try {
    const res = await fetch(`/starter-courses/${id}.json`, {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    return (await res.json()) as FullCourse;
  } catch {
    return null;
  }
}
