/// Blog infrastructure — manifest types, frontmatter parser, and
/// the colour-token map that drives the per-post frame accent.
///
/// Frontmatter is parsed with a tiny hand-rolled extractor rather
/// than pulling in gray-matter; the site only needs five fields and
/// keeping the dep count low is house style here.
///
/// Colour system: post authors set `color: <name>` in frontmatter.
/// The BlogPost page reads this value and injects three CSS custom
/// properties onto the `.post-frame` wrapper:
///
///   --post-frame-accent   ← left-border stroke + heading accents
///   --post-frame-bg       ← subtle tinted background
///   --post-frame-border   ← full perimeter border
///
/// All values are `var(--<palette>-<shade>)` references so they
/// automatically track the active theme's palette.

// ─── Types ───────────────────────────────────────────────────────

export interface PostMeta {
  slug: string;
  title: string;
  date: string;          // ISO date string e.g. "2026-06-26"
  author: string;
  excerpt: string;
  color?: PostColor;     // Optional; defaults to "accent"
  tags?: string[];
  coverImage?: string;   // Optional path relative to /blog/
}

export interface Post extends PostMeta {
  body: string;          // Raw markdown body (frontmatter stripped)
}

// ─── Supported accent colours ────────────────────────────────────

export type PostColor =
  | "blue"
  | "purple"
  | "teal"
  | "amber"
  | "green"
  | "red"
  | "pink"
  | "accent"
  | "warm";

export const POST_COLORS: PostColor[] = [
  "blue", "purple", "teal", "amber", "green", "red", "pink", "accent", "warm",
];

interface ColorTokens {
  accent: string;
  bg: string;
  border: string;
}

/// Map a frontmatter colour name to the three CSS custom-property
/// references that drive the post frame's visual identity.
export function colorTokens(color: PostColor | undefined): ColorTokens {
  switch (color) {
    case "blue":   return { accent: "var(--blue-6)",    bg: "var(--blue-1)",    border: "var(--blue-4)"   };
    case "purple": return { accent: "var(--purple-6)",  bg: "var(--purple-1)",  border: "var(--purple-4)" };
    case "teal":   return { accent: "var(--teal-6)",    bg: "var(--teal-1)",    border: "var(--teal-4)"   };
    case "amber":  return { accent: "var(--amber-6)",   bg: "var(--amber-1)",   border: "var(--amber-4)"  };
    case "green":  return { accent: "var(--green-6)",   bg: "var(--green-1)",   border: "var(--green-4)"  };
    case "red":    return { accent: "var(--red-6)",     bg: "var(--red-1)",     border: "var(--red-4)"    };
    case "pink":   return { accent: "var(--pink-6)",    bg: "var(--pink-1)",    border: "var(--pink-4)"   };
    case "warm":   return { accent: "var(--color-accent-warm)", bg: "var(--amber-1)", border: "var(--amber-3)" };
    case "accent":
    default:       return { accent: "var(--accent-6)",  bg: "var(--accent-1)",  border: "var(--accent-4)" };
  }
}

// ─── Frontmatter parser ──────────────────────────────────────────

interface Frontmatter {
  title?: string;
  date?: string;
  author?: string;
  excerpt?: string;
  color?: PostColor;
  tags?: string[];
  coverImage?: string;
}

/// Extract YAML frontmatter between `---` delimiters.
/// Only handles simple `key: value` and `key: [a, b]` forms —
/// enough for post metadata without a full YAML parser dep.
function parseFrontmatter(source: string): { meta: Frontmatter; body: string } {
  const DELIM = /^---\s*$/m;
  const lines = source.split("\n");

  // Must start with a delimiter on the very first line.
  if (lines[0].trim() !== "---") return { meta: {}, body: source };

  const closeIdx = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (closeIdx === -1) return { meta: {}, body: source };

  const frontLines = lines.slice(1, closeIdx);
  const body = lines.slice(closeIdx + 1).join("\n").trimStart();

  const meta: Frontmatter = {};
  for (const line of frontLines) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const raw = line.slice(colon + 1).trim();

    // Strip surrounding quotes.
    const val = raw.replace(/^["']|["']$/g, "");

    switch (key) {
      case "title":       meta.title = val; break;
      case "date":        meta.date = val; break;
      case "author":      meta.author = val; break;
      case "excerpt":     meta.excerpt = val; break;
      case "coverImage":  meta.coverImage = val; break;
      case "color":
        if ((POST_COLORS as string[]).includes(val)) meta.color = val as PostColor;
        break;
      case "tags": {
        // Handles `tags: [a, b, c]` or `tags: a, b, c`
        const inner = raw.replace(/^\[|\]$/g, "");
        meta.tags = inner.split(",").map((t) => t.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
        break;
      }
    }
  }

  return { meta, body };
}

// ─── Manifest loader ─────────────────────────────────────────────

let manifestCache: PostMeta[] | null = null;

/// Fetch the post manifest from /blog/manifest.json.
/// Cached for the session so the list page and sidebar don't double-fetch.
export async function fetchManifest(): Promise<PostMeta[]> {
  if (manifestCache) return manifestCache;
  const res = await fetch("/blog/manifest.json");
  if (!res.ok) return [];
  const data = (await res.json()) as PostMeta[];
  manifestCache = data;
  return data;
}

// ─── Individual post loader ───────────────────────────────────────

/// Fetch and parse a single post by slug. Returns null if not found.
export async function fetchPost(slug: string): Promise<Post | null> {
  const res = await fetch(`/blog/posts/${slug}.md`);
  if (!res.ok) return null;
  const source = await res.text();
  const { meta, body } = parseFrontmatter(source);

  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "",
    author: meta.author ?? "",
    excerpt: meta.excerpt ?? "",
    color: meta.color,
    tags: meta.tags ?? [],
    coverImage: meta.coverImage,
    body,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────

/// Format an ISO date string to a human-readable label.
export function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
