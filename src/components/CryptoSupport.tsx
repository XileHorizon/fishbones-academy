// Crypto donation cards, structured like the Untitled UI credit-card
// component: dark glass surface with a hairline-divided right strip
// holding the QR and a brand badge, and the address treated as the
// "card number" across the bottom of the main zone. Lives on /support
// and is linked from the footer's Open Source column. Methods are a
// prop — adding a chain is a one-entry edit to METHODS, not a CSS
// rewrite.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
// We only use a tiny slice of the API; QrFactoryT below pins the shape.
import qrcodeFactory from "qrcode-generator";
import "./CryptoSupport.css";

// ─────────────────────────── Types ───────────────────────────

export interface CryptoMethod {
  id: string;
  ticker: string;
  name: string;
  network: string;
  address: string;
  /** Brand badge fill — either a CSS colour or a gradient string. */
  background: string;
  /** Brand badge foreground colour (the glyph). */
  foreground?: string;
  /**
   * rgba string used to tint the card's radial wash. Should be the
   * brand colour at ~0.18 alpha. If omitted we fall back to a neutral
   * tint so multi-stop gradients (e.g. SOL) still get a soft glow.
   */
  tint?: string;
  /** Inline SVG glyph rendered on the brand badge — receives currentColor. */
  icon: ReactNode;
}

export interface CryptoSupportProps {
  methods?: CryptoMethod[];
  className?: string;
}

// ─────────────────────────── Icons ───────────────────────────
// Single-colour SVG glyphs — they pick up `currentColor` from the
// solid panel's foreground. Kept inline so we don't grow the icons
// folder for one-off marks.

function BtcGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden focusable="false">
      <g fill="currentColor">
        <rect x="11" y="4" width="2.2" height="24" rx="0.4" />
        <rect x="17" y="4" width="2.2" height="24" rx="0.4" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 8h9.5a4 4 0 0 1 0 8H9" />
        <path d="M9 16h10.5a4 4 0 0 1 0 8H9" />
      </g>
    </svg>
  );
}

function EthGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden focusable="false" fill="currentColor">
      <path d="M16 2 L7 17 L16 22 Z" opacity="0.65" />
      <path d="M16 2 L25 17 L16 22 Z" opacity="0.95" />
      <path d="M7 19 L16 30 L16 24 Z" opacity="0.65" />
      <path d="M16 24 L16 30 L25 19 Z" opacity="0.95" />
    </svg>
  );
}

function SolGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden focusable="false" fill="currentColor">
      <path d="M9 8h17l-3 4H6Z" />
      <path d="M6 14h17l3 4H9Z" />
      <path d="M9 20h17l-3 4H6Z" />
    </svg>
  );
}

function UsdcGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden focusable="false">
      <circle cx="16" cy="16" r="13.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7.5v2.4M16 22.1v2.4" />
        <path d="M19.6 12.4c0-1.6-1.6-2.6-3.6-2.6s-3.6 1-3.6 2.6 1.6 2.1 3.6 2.6 3.6 1 3.6 2.6-1.6 2.6-3.6 2.6-3.6-1-3.6-2.6" />
      </g>
    </svg>
  );
}

// ─────────────────────────── Defaults ───────────────────────────
// Placeholder addresses — Matt swaps these for real ones before a
// public deploy. Greppable via `REPLACE_WITH_`.

export const DEFAULT_METHODS: CryptoMethod[] = [
  {
    id: "btc",
    ticker: "BTC",
    name: "Bitcoin",
    network: "Bitcoin mainnet",
    address: "REPLACE_WITH_BTC_ADDRESS",
    background: "#F7931A",
    foreground: "#FFFFFF",
    tint: "rgba(247, 147, 26, 0.20)",
    icon: <BtcGlyph />,
  },
  {
    id: "eth",
    ticker: "ETH",
    name: "Ethereum",
    network: "Ethereum mainnet",
    address: "REPLACE_WITH_ETH_ADDRESS",
    background: "#627EEA",
    foreground: "#FFFFFF",
    tint: "rgba(98, 126, 234, 0.22)",
    icon: <EthGlyph />,
  },
  {
    id: "sol",
    ticker: "SOL",
    name: "Solana",
    network: "Solana mainnet",
    address: "REPLACE_WITH_SOL_ADDRESS",
    background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
    foreground: "#FFFFFF",
    tint: "rgba(153, 69, 255, 0.22)",
    icon: <SolGlyph />,
  },
  {
    id: "usdc",
    ticker: "USDC",
    name: "USD Coin",
    network: "USDC on Base",
    address: "REPLACE_WITH_USDC_ADDRESS",
    background: "#2775CA",
    foreground: "#FFFFFF",
    tint: "rgba(39, 117, 202, 0.22)",
    icon: <UsdcGlyph />,
  },
];

// ─────────────────────────── QR ───────────────────────────
// `qrcode-generator` builds the bitmap in JS; we render it as an SVG
// of <rect> modules so React owns the DOM (no dangerouslySetInnerHTML)
// and the QR can pick up theme colours. ECL "M" is the right balance
// for an address — recoverable through smudges without ballooning.

interface QrFactoryT {
  (typeNumber: 0, ecl: "M"): {
    addData(data: string): void;
    make(): void;
    getModuleCount(): number;
    isDark(row: number, col: number): boolean;
  };
}

function QrCode({ value, size = 116 }: { value: string; size?: number }) {
  const { count, dark } = useMemo(() => {
    const make = qrcodeFactory as QrFactoryT;
    const q = make(0, "M");
    q.addData(value);
    q.make();
    const n = q.getModuleCount();
    const cells: { x: number; y: number }[] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (q.isDark(r, c)) cells.push({ x: c, y: r });
      }
    }
    return { count: n, dark: cells };
  }, [value]);

  const margin = 2;
  const total = count + margin * 2;

  return (
    <svg
      className="crypto-card__qr-svg"
      viewBox={`0 0 ${total} ${total}`}
      width={size}
      height={size}
      role="img"
      aria-label={`QR code for ${value}`}
      shapeRendering="crispEdges"
    >
      <rect width={total} height={total} fill="#FFFFFF" />
      <g fill="#0B0B10" transform={`translate(${margin} ${margin})`}>
        {dark.map((p) => (
          <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={1} height={1} />
        ))}
      </g>
    </svg>
  );
}

// ─────────────────────────── Card ───────────────────────────

function CryptoCard({ method }: { method: CryptoMethod }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(method.address);
    } catch {
      // Older Safari / non-secure contexts: fall back to a hidden
      // textarea + execCommand. Not pretty, but it keeps the button
      // usable for visitors on flaky environments.
      const ta = document.createElement("textarea");
      ta.value = method.address;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    }
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  }

  // Brand colour drives the card's radial wash + bottom-right badge.
  // Falls back to a neutral steel-blue tint when the chain ships a
  // gradient (since you can't radial-wash from a multi-stop fill).
  const cardStyle = {
    "--brand-tint": method.tint ?? "rgba(155, 166, 237, 0.18)",
  } as CSSProperties;

  return (
    <article className="crypto-card" data-id={method.id} style={cardStyle}>
      <div className="crypto-card__main">
        <header className="crypto-card__head">
          <div
            className="crypto-card__badge"
            style={{
              background: method.background,
              color: method.foreground ?? "#FFFFFF",
            }}
            aria-hidden
          >
            {method.icon}
          </div>
          <h3 className="crypto-card__title">
            {method.name}
            <span className="crypto-card__title-dot">.</span>
          </h3>
        </header>

        <div className="crypto-card__bottom">
          <div className="crypto-card__meta">
            <span className="crypto-card__meta-label">{method.ticker}</span>
            <span className="crypto-card__meta-sep" aria-hidden>·</span>
            <span className="crypto-card__meta-value">{method.network}</span>
          </div>

          <span
            className="crypto-card__addr"
            aria-label={`${method.name} address on ${method.network}`}
          >
            {method.address}
          </span>
        </div>
      </div>

      <div className="crypto-card__strip">
        <div className="crypto-card__qr">
          <QrCode value={method.address} />
        </div>
        <button
          type="button"
          className="crypto-card__copy"
          onClick={copy}
          data-copied={copied || undefined}
          aria-label={`Copy ${method.name} address`}
        >
          {copied ? "Copied" : "Copy address"}
        </button>
      </div>
    </article>
  );
}

// ─────────────────────────── Public ───────────────────────────

export function CryptoSupport({ methods = DEFAULT_METHODS, className }: CryptoSupportProps) {
  return (
    <div className={`crypto-grid${className ? ` ${className}` : ""}`}>
      {methods.map((m) => (
        <CryptoCard key={m.id} method={m} />
      ))}
    </div>
  );
}

// ─────────────────────────── Tip dock ───────────────────────────
// Floating, fixed-position widget that visitors can use to tip from
// any page. Collapsed by default (a small pill in the bottom-right
// corner); expanding it pops a panel above the trigger with the same
// donation cards stacked vertically. The stack scrolls inside the
// panel so it works at any viewport height. Drop <CryptoTipDock /> at
// the app root to make it global; pass `excludePaths` if certain
// routes should hide it (e.g. the /support page itself, where the
// dock would duplicate content).

export interface CryptoTipDockProps {
  methods?: CryptoMethod[];
  /** Pathname matchers — if any match window.location, the dock hides. */
  excludePaths?: string[];
  /** Override the trigger pill's label. Defaults to "Tip in crypto". */
  label?: string;
}

function CoinIcon() {
  // Generic coin / token glyph — the dock isn't tied to one chain so
  // we use a stack-of-coins motif rather than a specific brand mark.
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="6" rx="7" ry="2.5" />
      <path d="M5 6v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
      <path d="M5 11v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

export function CryptoTipDock({
  methods = DEFAULT_METHODS,
  excludePaths,
  label = "Tip in crypto",
}: CryptoTipDockProps) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Path-based hide. We listen to popstate + a polling fallback for
  // pushState/replaceState since react-router doesn't fire a window
  // event on navigation, and we'd rather not couple the dock to a
  // specific router. The polling cadence is cheap (one read per
  // animation frame batch).
  useEffect(() => {
    if (!excludePaths || excludePaths.length === 0) return;
    const check = () => {
      const path = window.location.pathname;
      setHidden(excludePaths.some((p) => path === p || path.startsWith(p + "/")));
    };
    check();
    const id = window.setInterval(check, 400);
    window.addEventListener("popstate", check);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("popstate", check);
    };
  }, [excludePaths]);

  // Close on Escape; close on outside click. Both are scoped to the
  // open state so we don't burn listeners while collapsed.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (hidden) return null;

  return (
    <div className="crypto-dock" data-open={open || undefined}>
      {open && (
        <div
          ref={panelRef}
          className="crypto-dock__panel"
          role="dialog"
          aria-label="Crypto tip jar"
        >
          <header className="crypto-dock__head">
            <div className="crypto-dock__head-text">
              <h3 className="crypto-dock__title">Send a tip</h3>
              <p className="crypto-dock__sub">
                Pick a chain — scan the QR or copy the address.
              </p>
            </div>
            <button
              type="button"
              className="crypto-dock__close"
              onClick={() => setOpen(false)}
              aria-label="Close tip jar"
            >
              <CloseIcon />
            </button>
          </header>
          <div className="crypto-dock__stack">
            {methods.map((m) => (
              <CryptoCard key={m.id} method={m} />
            ))}
          </div>
        </div>
      )}
      <button
        ref={triggerRef}
        type="button"
        className="crypto-dock__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="crypto-dock__trigger-icon" aria-hidden>
          <CoinIcon />
        </span>
        <span className="crypto-dock__trigger-label">{label}</span>
      </button>
    </div>
  );
}
