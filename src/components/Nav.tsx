import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { GithubMark } from "./icons/GithubMark";
import { DiscordMark } from "./icons/DiscordMark";
import TipPopover from "./TipPopover";
import "./Nav.css";

/// Public Discord invite — shared between the desktop nav row and
/// the mobile drawer so the URL only lives in one place.
const DISCORD_INVITE = "https://discord.gg/2yPVVfuFdW";

const LINKS = [
  { to: "/courses", label: "Courses" },
  { to: "/languages", label: "Languages" },
  { to: "/blog", label: "Blog" },
  { to: "/docs", label: "Docs" },
  // "About" was retired from the primary nav in favour of the public
  // security audit (labelled "Audit" here — shorter, and it's the
  // trust signal we want in the top bar). The /about route still
  // exists and stays linked from the footer's Product column; only
  // the nav slot was reassigned.
  { to: "/security", label: "Audit" },
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
        <Link to="/" className="nav__brand" aria-label="Libre.academy home">
          {/* Single-glyph "Libre.academy" wordmark — the
              ribbon-snake "Libre" + ".academy" suffix come together
              in one PNG, so the lockup ships as one image with no
              paired text span needed. */}
          <img
            src="/libreacademy.png?v=1"
            alt="Libre.academy"
            className="nav__brand-icon"
          />
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
            href="https://github.com/InfamousVague/Libre.academy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Libre Academy on GitHub"
          >
            <GithubMark size={16} />
            <span>GitHub</span>
          </a>
          {/* Community Discord. Same icon-link treatment as the GitHub */}
          {/* link above so the row stays visually balanced. */}
          <a
            className="nav__link nav__link--icon"
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join the Libre Discord"
          >
            <DiscordMark size={16} />
            <span>Discord</span>
          </a>
          {/* Tip jar — port of the desktop app's TipDropdown. Sits */}
          {/* between GitHub + the main CTA so the affordance is */}
          {/* visible from every page without competing with course nav. */}
          <TipPopover />
          <Link to="/courses" className="nav__cta">
            Start learning free
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
            href="https://github.com/InfamousVague/Libre.academy"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="nav__drawer-link"
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
          <Link to="/courses" className="nav__drawer-cta">
            Start learning free
          </Link>
        </div>
      )}
    </header>
  );
}
