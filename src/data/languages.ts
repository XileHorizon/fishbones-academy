/// The 16+ languages Fishbones supports. Each entry says how lessons in
/// that language run on the desktop app — Browser (Web Worker / Pyodide /
/// iframe), Sandbox (proxied to a hosted compiler), or Local (shells out
/// to a system toolchain).
///
/// `slug` is the URL fragment for /languages/<slug>; `id` matches the
/// `LanguageId` union in kata's data/types.ts so a course's `language`
/// field can be matched back to a card.

export type LanguageRun = "browser" | "sandbox" | "local";

export interface Language {
  /// LanguageId from kata. Used to filter the catalog.
  id: string;
  /// URL slug — kebab-cased version of id, plus a few aliases.
  slug: string;
  /// Display name as it shows on cards + per-language pages.
  name: string;
  /// File extension or short token used in the small mono badge.
  glyph: string;
  /// One-line "what you can build with it" copy.
  blurb: string;
  /// Where lessons in this language execute.
  run: LanguageRun;
  /// Free-form footnote: "(Pyodide)", "(clang)", etc. Rendered next to
  /// the Run badge to be precise without cluttering it.
  runNote?: string;
  /// Lit when the in-browser learn app can run lessons in this language.
  /// Languages that need a system compiler are desktop-only.
  inBrowser: boolean;
}

export const LANGUAGES: Language[] = [
  {
    id: "javascript",
    slug: "javascript",
    name: "JavaScript",
    glyph: "JS",
    blurb: "The lingua franca. Build whatever, run it in the editor.",
    run: "browser",
    inBrowser: true,
  },
  {
    id: "typescript",
    slug: "typescript",
    name: "TypeScript",
    glyph: "TS",
    blurb: "JavaScript with a type checker. Same runtime, sharper feedback.",
    run: "browser",
    inBrowser: true,
  },
  {
    id: "python",
    slug: "python",
    name: "Python",
    glyph: "PY",
    blurb: "Scripts, scrapers, scientific code. Runs in your browser via Pyodide.",
    run: "browser",
    runNote: "(Pyodide)",
    inBrowser: true,
  },
  {
    id: "rust",
    slug: "rust",
    name: "Rust",
    glyph: "RS",
    blurb: "Systems code without the foot-guns. Compiled by a hosted playground.",
    run: "sandbox",
    runNote: "(play.rust-lang.org)",
    inBrowser: true,
  },
  {
    id: "go",
    slug: "go",
    name: "Go",
    glyph: "GO",
    blurb: "Concurrency by default. Compiled by the Go playground.",
    run: "sandbox",
    runNote: "(play.golang.org)",
    inBrowser: true,
  },
  {
    id: "c",
    slug: "c",
    name: "C",
    glyph: "C",
    blurb: "The closest thing to writing assembly without writing assembly.",
    run: "local",
    runNote: "(clang)",
    inBrowser: false,
  },
  {
    id: "cpp",
    slug: "cpp",
    name: "C++",
    glyph: "C++",
    blurb: "Power, complexity, and the entire history of compiled languages.",
    run: "local",
    runNote: "(c++)",
    inBrowser: false,
  },
  {
    id: "java",
    slug: "java",
    name: "Java",
    glyph: "JV",
    blurb: "Enterprise classics + JVM ergonomics. Compiles via javac.",
    run: "local",
    runNote: "(javac)",
    inBrowser: false,
  },
  {
    id: "kotlin",
    slug: "kotlin",
    name: "Kotlin",
    glyph: "KT",
    blurb: "Modern JVM language. Concise, null-safe, batteries included.",
    run: "local",
    runNote: "(kotlinc)",
    inBrowser: false,
  },
  {
    id: "csharp",
    slug: "csharp",
    name: "C#",
    glyph: "C#",
    blurb: ".NET fundamentals. Compiles + runs via the dotnet CLI.",
    run: "local",
    runNote: "(dotnet)",
    inBrowser: false,
  },
  {
    id: "swift",
    slug: "swift",
    name: "Swift",
    glyph: "SW",
    blurb: "Apple-flavoured systems language. Runs via the Swift toolchain.",
    run: "local",
    runNote: "(swift)",
    inBrowser: false,
  },
  {
    id: "assembly",
    slug: "assembly",
    name: "Assembly",
    glyph: "ASM",
    blurb: "x86_64 + ARM64. The only language without an abstraction.",
    run: "local",
    runNote: "(as + ld)",
    inBrowser: false,
  },
  {
    id: "solidity",
    slug: "solidity",
    name: "Solidity",
    glyph: "SOL",
    blurb: "Smart contracts on EVM-compatible chains. Compiles in-browser.",
    run: "browser",
    inBrowser: true,
  },
  {
    id: "svelte",
    slug: "svelte",
    name: "Svelte",
    glyph: "SV",
    blurb: "Compiled UI. The one without a virtual DOM.",
    run: "browser",
    inBrowser: true,
  },
  {
    id: "solid",
    slug: "solidjs",
    name: "SolidJS",
    glyph: "SO",
    blurb: "React-shaped reactivity, but fast all the way down.",
    run: "browser",
    inBrowser: true,
  },
  {
    id: "htmx",
    slug: "htmx",
    name: "HTMX",
    glyph: "HX",
    blurb: "HTML, but it does AJAX. The anti-framework framework.",
    run: "browser",
    inBrowser: true,
  },
  {
    id: "astro",
    slug: "astro",
    name: "Astro",
    glyph: "AS",
    blurb: "Content sites that ship zero JS by default.",
    run: "browser",
    inBrowser: true,
  },
  {
    id: "reactnative",
    slug: "react-native",
    name: "React Native",
    glyph: "RN",
    blurb: "Build a phone app in the editor. Floats a phone preview frame.",
    run: "browser",
    runNote: "(react-native-web)",
    inBrowser: true,
  },
  {
    id: "threejs",
    slug: "threejs",
    name: "Three.js",
    glyph: "3D",
    blurb: "WebGL graphics in the browser, scenegraph included.",
    run: "browser",
    inBrowser: true,
  },
  {
    id: "bun",
    slug: "bun",
    name: "Bun",
    glyph: "BUN",
    blurb: "The all-in-one JS toolkit — runtime, bundler, package manager.",
    run: "browser",
    inBrowser: true,
  },
];

export const LANGUAGES_BY_ID = new Map(LANGUAGES.map((l) => [l.id, l]));
export const LANGUAGES_BY_SLUG = new Map(LANGUAGES.map((l) => [l.slug, l]));

export function languageById(id: string | undefined): Language | undefined {
  if (!id) return undefined;
  return LANGUAGES_BY_ID.get(id);
}

export function languageBySlug(slug: string | undefined): Language | undefined {
  if (!slug) return undefined;
  return LANGUAGES_BY_SLUG.get(slug);
}
