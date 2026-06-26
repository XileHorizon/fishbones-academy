/// Tiny per-page SEO hook — sets `<title>`, `<meta description>`,
/// canonical, OG, and Twitter tags from React state without
/// pulling in react-helmet-async or a doc framework.
///
/// Pattern: each page that wants its own SEO calls `useSeo({...})`
/// at the top of its render. The hook writes to the head on mount
/// + when inputs change, and (importantly) RESTORES the previous
/// values on unmount so a back-button to "/" gets the homepage
/// title + description again rather than the stale page-specific
/// ones we set.
///
/// Optional `jsonLd` injects a typed structured-data block into a
/// dedicated <script type="application/ld+json"> tag scoped per
/// page. Subsequent pages replace the block rather than stacking.
///
/// Limitations (acceptable for a small SPA):
///   - Search bots that render JS will pick up the updated tags.
///     Bots that DON'T render JS (legacy crawlers, some social
///     unfurlers) still see the static index.html tags — that's
///     why the homepage tags must remain the strongest baseline.
///   - Only one page's SEO is "active" at a time. Pages that
///     mount in parallel (rare) would compete; in this app the
///     route is exclusive so this isn't a concern.

import { useEffect } from "react";

export interface SeoTags {
  /// `<title>` — keyword-first. Browsers and SERPs truncate around
  /// 60-70 characters; aim for under 65 in case of brand suffix.
  title?: string;
  /// `<meta name="description">` — 140-160 chars is the SERP sweet
  /// spot; longer gets clipped, shorter wastes the snippet budget.
  description?: string;
  /// Absolute URL for the canonical link. Skip the trailing slash
  /// unless the URL is the site root. Defaults to none (page is
  /// indexable as-is at its current URL).
  canonicalUrl?: string;
  /// OG / Twitter image. Should be an absolute URL. Defaults to
  /// the site-wide og-image fallback.
  ogImage?: string;
  /// Override the og:type. Defaults to "website"; use "article" for
  /// course / language detail pages where the schema fits better.
  ogType?: string;
  /// Optional JSON-LD structured data. Pass a serialisable object;
  /// the hook stringifies and writes it to a per-page script tag.
  jsonLd?: object;
}

/// CSS attribute used to mark tags this hook wrote. Lets the
/// cleanup phase distinguish hook-managed tags from the static
/// ones in `index.html` (which we MUST NOT touch — they're the
/// homepage fallback for non-JS crawlers).
const MARKER = "data-libre-seo";

/// Per-page JSON-LD script tag id. One per page means subsequent
/// pages replace rather than stack.
const JSONLD_ID = "libre-seo-jsonld";

/// Find or create a `<meta>` tag matching `selector`. Marks it with
/// our hook attribute so cleanup can identify it.
function upsertMeta(selector: string, tag: "meta" | "link", attrs: Record<string, string>): void {
  const head = document.head;
  let el = head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(MARKER, "1");
    head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
}

export function useSeo(tags: SeoTags): void {
  const { title, description, canonicalUrl, ogImage, ogType, jsonLd } = tags;

  useEffect(() => {
    // Snapshot the values the static index.html shipped with so we
    // can restore them on unmount. This is what makes the back
    // button feel right — leaving /languages/rust restores the
    // homepage title + description rather than leaving Rust's
    // tags stuck.
    const prevTitle = document.title;
    const prevDescription =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") ?? "";
    const prevOgTitle =
      document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? "";
    const prevOgDescription =
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content") ?? "";
    const prevOgUrl =
      document.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? "";
    const prevOgImage =
      document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "";
    const prevOgType =
      document.querySelector('meta[property="og:type"]')?.getAttribute("content") ?? "";
    const prevTwTitle =
      document.querySelector('meta[name="twitter:title"]')?.getAttribute("content") ?? "";
    const prevTwDescription =
      document
        .querySelector('meta[name="twitter:description"]')
        ?.getAttribute("content") ?? "";
    const prevCanonical =
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";

    if (title) {
      document.title = title;
      upsertMeta('meta[property="og:title"]', "meta", {
        property: "og:title",
        content: title,
      });
      upsertMeta('meta[name="twitter:title"]', "meta", {
        name: "twitter:title",
        content: title,
      });
    }
    if (description) {
      upsertMeta('meta[name="description"]', "meta", {
        name: "description",
        content: description,
      });
      upsertMeta('meta[property="og:description"]', "meta", {
        property: "og:description",
        content: description,
      });
      upsertMeta('meta[name="twitter:description"]', "meta", {
        name: "twitter:description",
        content: description,
      });
    }
    if (canonicalUrl) {
      upsertMeta('link[rel="canonical"]', "link", {
        rel: "canonical",
        href: canonicalUrl,
      });
      upsertMeta('meta[property="og:url"]', "meta", {
        property: "og:url",
        content: canonicalUrl,
      });
    }
    if (ogImage) {
      upsertMeta('meta[property="og:image"]', "meta", {
        property: "og:image",
        content: ogImage,
      });
    }
    if (ogType) {
      upsertMeta('meta[property="og:type"]', "meta", {
        property: "og:type",
        content: ogType,
      });
    }
    if (jsonLd) {
      let s = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
      if (!s) {
        s = document.createElement("script");
        s.id = JSONLD_ID;
        s.type = "application/ld+json";
        s.setAttribute(MARKER, "1");
        document.head.appendChild(s);
      }
      s.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup: restore the previous values. Keep the hook-marked
    // tags in place (just rewrite their content) so we don't churn
    // DOM nodes on every route transition; the static index.html
    // tags are NEVER torn down.
    return () => {
      if (title) document.title = prevTitle;
      if (description) {
        upsertMeta('meta[name="description"]', "meta", {
          name: "description",
          content: prevDescription,
        });
        upsertMeta('meta[property="og:description"]', "meta", {
          property: "og:description",
          content: prevOgDescription,
        });
        upsertMeta('meta[name="twitter:description"]', "meta", {
          name: "twitter:description",
          content: prevTwDescription,
        });
      }
      if (title) {
        upsertMeta('meta[property="og:title"]', "meta", {
          property: "og:title",
          content: prevOgTitle,
        });
        upsertMeta('meta[name="twitter:title"]', "meta", {
          name: "twitter:title",
          content: prevTwTitle,
        });
      }
      if (canonicalUrl) {
        upsertMeta('link[rel="canonical"]', "link", {
          rel: "canonical",
          href: prevCanonical,
        });
        upsertMeta('meta[property="og:url"]', "meta", {
          property: "og:url",
          content: prevOgUrl,
        });
      }
      if (ogImage) {
        upsertMeta('meta[property="og:image"]', "meta", {
          property: "og:image",
          content: prevOgImage,
        });
      }
      if (ogType) {
        upsertMeta('meta[property="og:type"]', "meta", {
          property: "og:type",
          content: prevOgType,
        });
      }
      if (jsonLd) {
        const s = document.getElementById(JSONLD_ID);
        s?.remove();
      }
    };
  }, [title, description, canonicalUrl, ogImage, ogType, jsonLd]);
}
