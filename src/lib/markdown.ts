/// Standalone markdown renderer used by the course detail preview and
/// the docs pages. Mirrors kata's src/components/Lesson/markdown.ts
/// behaviour at a high level — Shiki-highlighted code blocks, GFM
/// tables, plain prose — but doesn't try to reproduce the in-app
/// glossary, callouts, or `?` Ask-Fishbones badges. Those features
/// belong inside the desktop app; here the markdown is read-only
/// preview content.
///
/// We use shiki/core with explicit per-lang imports so the production
/// bundle only ships the highlighters we actually use (~25 languages
/// instead of every grammar shiki supports). Otherwise the homepage
/// chunk balloons by megabytes for languages we'll never highlight.

import MarkdownIt from "markdown-it";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

let highlighterPromise: Promise<HighlighterCore> | null = null;

const SUPPORTED_LANGS = [
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "python",
  "rust",
  "go",
  "c",
  "cpp",
  "java",
  "kotlin",
  "csharp",
  "swift",
  "asm",
  "solidity",
  "html",
  "css",
  "json",
  "bash",
  "shell",
  "markdown",
  "svelte",
  "yaml",
  "toml",
] as const;

type SupportedLang = (typeof SUPPORTED_LANGS)[number];

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [import("shiki/themes/github-dark.mjs")],
      langs: [
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/tsx.mjs"),
        import("shiki/langs/jsx.mjs"),
        import("shiki/langs/python.mjs"),
        import("shiki/langs/rust.mjs"),
        import("shiki/langs/go.mjs"),
        import("shiki/langs/c.mjs"),
        import("shiki/langs/cpp.mjs"),
        import("shiki/langs/java.mjs"),
        import("shiki/langs/kotlin.mjs"),
        import("shiki/langs/csharp.mjs"),
        import("shiki/langs/swift.mjs"),
        import("shiki/langs/asm.mjs"),
        import("shiki/langs/solidity.mjs"),
        import("shiki/langs/html.mjs"),
        import("shiki/langs/css.mjs"),
        import("shiki/langs/json.mjs"),
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/shellscript.mjs"),
        import("shiki/langs/markdown.mjs"),
        import("shiki/langs/svelte.mjs"),
        import("shiki/langs/yaml.mjs"),
        import("shiki/langs/toml.mjs"),
      ],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  }
  return highlighterPromise;
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
});

// Shiki is async, so we render code fences as a placeholder pre with a
// data-lang marker. The post-render pass below substitutes the
// highlighted HTML in.
md.options.highlight = (code, lang) => {
  const safeLang = SUPPORTED_LANGS.includes(lang as SupportedLang) ? lang : "";
  const escaped = md.utils.escapeHtml(code);
  return `<pre class="md-code-pending" data-lang="${safeLang}"><code>${escaped}</code></pre>`;
};

/// Render markdown to HTML. Returns a single HTML string safe to drop
/// into `dangerouslySetInnerHTML`.
export async function renderMarkdown(source: string): Promise<string> {
  const rawHtml = md.render(source);
  if (!rawHtml.includes("md-code-pending")) return rawHtml;

  const highlighter = await getHighlighter();
  return rawHtml.replace(
    /<pre class="md-code-pending" data-lang="([^"]*)"><code>([\s\S]*?)<\/code><\/pre>/g,
    (_match, langAttr: string, escaped: string) => {
      const code = decodeEntities(escaped);
      const lang = langAttr || "text";
      try {
        return highlighter.codeToHtml(code, {
          lang,
          theme: "github-dark",
          transformers: [
            {
              pre(node) {
                node.properties.class = `md-code shiki shiki--${lang}`;
              },
            },
          ],
        });
      } catch {
        // Unknown language — fall back to a plain pre block.
        return `<pre class="md-code md-code--plain"><code>${escaped}</code></pre>`;
      }
    },
  );
}

function decodeEntities(s: string): string {
  return s
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

/// Truncate a markdown string to roughly maxChars, breaking at a
/// paragraph boundary so we don't slice mid-sentence. Used by the
/// course detail preview.
export function truncateMarkdown(source: string, maxChars = 1800): string {
  if (source.length <= maxChars) return source;
  const cut = source.slice(0, maxChars);
  const lastBreak = cut.lastIndexOf("\n\n");
  return (lastBreak > maxChars * 0.5 ? cut.slice(0, lastBreak) : cut) + "\n\n…";
}
