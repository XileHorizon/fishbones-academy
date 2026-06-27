import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Tag } from "lucide-react";
import { fetchPost, colorTokens, formatDate, type Post } from "../lib/blog";
import { renderMarkdown } from "../lib/markdown";
import { useSeo } from "../lib/useSeo";
import "./BlogPost.css";

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null | "loading">("loading");
  const [html, setHtml] = useState<string>("");

  // useSeo called unconditionally — hook order must be stable.
  const activePost = post !== "loading" ? post : null;
  useSeo({
    title: activePost
      ? `${activePost.title} — Libre Academy Blog`
      : "Blog — Libre Academy",
    description: activePost?.excerpt,
    canonicalUrl: activePost
      ? `https://libre.academy/blog/${activePost.slug}`
      : undefined,
    ogType: "article",
  });

  useEffect(() => {
    if (!slug) return;
    setPost("loading");
    setHtml("");
    fetchPost(slug).then((p) => setPost(p));
  }, [slug]);

  useEffect(() => {
    if (!activePost?.body) return;
    let cancelled = false;
    renderMarkdown(activePost.body).then((h) => {
      if (!cancelled) setHtml(h);
    });
    return () => { cancelled = true; };
  }, [activePost?.body]);

  if (post === "loading") {
    return (
      <div className="blog-post section section--narrow">
        <div className="blog-post__skeleton" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-post section section--narrow blog-post--not-found">
        <h1>Post not found.</h1>
        <p>That slug isn't in the blog.</p>
        <Link to="/blog" className="btn btn--ghost">
          <ArrowLeft size={14} /> Back to blog
        </Link>
      </div>
    );
  }

  const tokens = colorTokens(post.color);

  return (
    <div className="blog-post section section--narrow">
      <Link to="/blog" className="blog-post__back">
        <ArrowLeft size={14} /> All posts
      </Link>

      {/* ─── Post frame — the colour-customisable container ─────── */}
      <article
        className="post-frame"
        style={{
          "--post-frame-accent": tokens.accent,
          "--post-frame-bg": tokens.bg,
          "--post-frame-border": tokens.border,
        } as React.CSSProperties}
      >
        <header className="post-frame__header">
          <div className="post-frame__meta">
            {post.date && (
              <span className="post-frame__date">
                <CalendarDays size={12} />
                {formatDate(post.date)}
              </span>
            )}
            {post.author && (
              <span className="post-frame__author">{post.author}</span>
            )}
          </div>

          <h1 className="post-frame__title">{post.title}</h1>

          {post.excerpt && (
            <p className="post-frame__excerpt">{post.excerpt}</p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="post-frame__tags">
              <Tag size={11} />
              {post.tags.map((t) => (
                <span key={t} className="pill pill--mono">{t}</span>
              ))}
            </div>
          )}
        </header>

        {/* ─── Markdown body ──────────────────────────────── */}
        <div
          className="post-frame__body md-body"
          dangerouslySetInnerHTML={{ __html: html || "" }}
        />
      </article>
    </div>
  );
}
