import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";
import { fetchManifest, colorTokens, formatDate, type PostMeta } from "../lib/blog";
import { useSeo } from "../lib/useSeo";
import "./Blog.css";

export function Blog() {
  useSeo({
    title: "Blog — Libre Academy",
    description: "Tips, updates, and deep-dives from the Libre Academy team. Interactive coding, open-source development, and building courses that actually stick.",
    canonicalUrl: "https://libre.academy/blog",
  });

  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManifest().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  }, []);

  return (
    <div className="blog-page">
      <header className="blog-hero section section--narrow">
        <span className="section__eyebrow">Blog</span>
        <h1 className="section__title">
          Thoughts from the Libre team.
        </h1>
        <p className="section__subtitle">
          Updates, deep-dives, opinion pieces, and the occasional rant about the industry and state of things.
        </p>
      </header>

      <section className="section blog-list section--narrow">
        {loading && (
          <div className="blog-list__loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="blog-card blog-card--skeleton" />
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="blog-list__empty">
            <p>No posts yet — check back soon.</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="blog-list__grid">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BlogCard({ post }: { post: PostMeta }) {
  const tokens = colorTokens(post.color);

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="blog-card"
      style={{
        "--post-frame-accent": tokens.accent,
        "--post-frame-bg": tokens.bg,
        "--post-frame-border": tokens.border,
      } as React.CSSProperties}
    >
      <div className="blog-card__accent-bar" />
      <div className="blog-card__body">
        <div className="blog-card__meta">
          {post.date && (
            <span className="blog-card__date">
              <CalendarDays size={12} />
              {formatDate(post.date)}
            </span>
          )}
          {post.author && (
            <span className="blog-card__author">{post.author}</span>
          )}
        </div>

        <h2 className="blog-card__title">{post.title}</h2>
        <p className="blog-card__excerpt">{post.excerpt}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="blog-card__tags">
            <Tag size={11} />
            {post.tags.map((t) => (
              <span key={t} className="pill pill--mono">{t}</span>
            ))}
          </div>
        )}

        <span className="blog-card__cta">
          Read post <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}
