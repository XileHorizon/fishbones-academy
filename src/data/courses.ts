import manifestRaw from "./courses-manifest.json";
import type { CourseManifest, CourseManifestEntry, FullCourse } from "./types";
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
  | "frameworks"
  | "challenges"
  | "web3"
  | "mobile"
  | "graphics";

const TOPIC_OVERRIDES: Record<string, CourseTopic> = {
  "javascript-crash-course": "languages",
  "python-crash-course": "languages",
  "javascript-the-definitive-guide": "languages",
  "learning-go": "languages",

  "svelte-5-complete": "frameworks",
  "solidjs-fundamentals": "frameworks",
  "fluent-react": "frameworks",
  "htmx-fundamentals": "frameworks",
  "astro-fundamentals": "frameworks",
  "bun-fundamentals": "frameworks",
  "bun-complete": "frameworks",

  "learning-react-native": "mobile",
  "react-native": "mobile",

  "interactive-web-development-with-three-js-and-a-frame": "graphics",

  "solidity-complete": "web3",
  "solana-programs": "web3",
  "viem-ethers": "web3",
};

export const COURSE_TOPICS: Array<{ id: CourseTopic; label: string }> = [
  { id: "languages", label: "Languages" },
  { id: "frameworks", label: "Frameworks" },
  { id: "mobile", label: "Mobile" },
  { id: "web3", label: "Web3" },
  { id: "graphics", label: "Graphics" },
  { id: "challenges", label: "Challenges" },
];

export type CourseDifficulty = "starter" | "intermediate" | "advanced";

const DIFFICULTY_OVERRIDES: Record<string, CourseDifficulty> = {
  "javascript-crash-course": "starter",
  "python-crash-course": "starter",
  "bun-fundamentals": "starter",
  "htmx-fundamentals": "starter",
  "astro-fundamentals": "starter",
  "solidjs-fundamentals": "starter",
  "svelte-5-complete": "intermediate",
  "fluent-react": "intermediate",
  "bun-complete": "intermediate",
  "javascript-the-definitive-guide": "intermediate",
  "learning-go": "intermediate",
  "learning-react-native": "intermediate",
  "react-native": "intermediate",
  "interactive-web-development-with-three-js-and-a-frame": "intermediate",
  "viem-ethers": "intermediate",
  "solidity-complete": "advanced",
  "solana-programs": "advanced",
  // Challenge packs scale with the user — we don't try to peg one tier.
};

export const COURSE_DIFFICULTIES: Array<{
  id: CourseDifficulty;
  label: string;
}> = [
  { id: "starter", label: "Starter" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
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
}

function approximateLessons(entry: CourseManifestEntry): number {
  // Roughly 5KB of JSON per lesson on average across the bundled
  // packs. Calibrated against the few we sampled; close enough for a
  // marketing card.
  const kb = (entry.sizeBytes ?? 80_000) / 1024;
  return Math.max(8, Math.round(kb / 5));
}

export const CATALOG: CatalogCourse[] = manifest.courses.map((entry) => {
  const lang = languageById(entry.language);
  const topic: CourseTopic =
    entry.packType === "challenges"
      ? "challenges"
      : TOPIC_OVERRIDES[entry.id] ?? "languages";
  const lessons = approximateLessons(entry);
  return {
    ...entry,
    topic,
    difficulty: DIFFICULTY_OVERRIDES[entry.id],
    languageLabel: lang?.name ?? entry.language,
    approxLessons: lessons,
    approxMinutes: lessons * 12,
  };
});

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
