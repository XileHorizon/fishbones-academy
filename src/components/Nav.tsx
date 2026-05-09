import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { GithubMark } from "./icons/GithubMark";
import TipPopover from "./TipPopover";
import "./Nav.css";

const LINKS = [
  { to: "/courses", label: "Courses" },
  { to: "/languages", label: "Languages" },
  { to: "/docs", label: "Docs" },
  { to: "/about", label: "About" },
  { to: "/download", label: "Download" },
];

export function Nav() {
  const { pathname } = useLocation();
  // Tying drawer-open state to the current pathname auto-closes the
  // mobile menu on every navigation without needing a setState-in-effect.
  // The internal state is `(pathname, open?)` — a fresh pathname starts
  // closed; toggling within a pathname keeps state until the next nav.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (next: boolean | ((v: boolean) => boolean)) => {
    setOpenFor((current) => {
      const wasOpen = current === pathname;
      const wantsOpen = typeof next === "function" ? next(wasOpen) : next;
      return wantsOpen ? pathname : null;
    });
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " nav--scrolled" : ""}`}>
      <div className="nav__inner">
        <Link to="/" className="nav__brand" aria-label="Libre home">
          {/* Wide ribbon-snake "Libre" wordmark + ".academy" TLD.
              The wide PNG already spells "Libre" with the snake-as-L,
              so the inline span supplies just the suffix. */}
          <img
            src="/libre_wide.png?v=4"
            alt="Libre"
            className="nav__brand-icon"
          />
          <span className="nav__brand-mark">
            <span className="nav__brand-tld">.academy</span>
          </span>
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `nav__link${isActive ? " nav__link--active" : ""}`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
          <a
            className="nav__link nav__link--icon"
            href="https://github.com/InfamousVague/Fishbones"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Libre on GitHub"
          >
            <GithubMark size={16} />
            <span>GitHub</span>
          </a>
          {/* Tip jar — port of the Fishbones desktop app's TipDropdown. */}
          {/* Sits between GitHub + the main CTA so the affordance is */}
          {/* visible from every page without competing with course nav. */}
          <TipPopover />
          <Link to="/courses" className="nav__cta">
            Browse courses
          </Link>
        </nav>

        <button
          type="button"
          className="nav__menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="nav__drawer" role="dialog" aria-label="Mobile menu">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `nav__drawer-link${isActive ? " nav__drawer-link--active" : ""}`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
          <a
            className="nav__drawer-link"
            href="https://github.com/InfamousVague/Fishbones"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <Link to="/courses" className="nav__drawer-cta">
            Browse courses
          </Link>
        </div>
      )}
    </header>
  );
}
