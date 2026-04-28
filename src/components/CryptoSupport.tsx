// Glass-morphism crypto donation cards. Lives on /support and is also
// linked from the site footer's "Open source" column. Designed to drop
// into either fishbones.academy or mattssoftware.com — the only host
// requirement is the glass + dark token vocabulary defined in
// styles/tokens.css. The icon glyphs and accent colours are config
// (METHODS), so adding a new chain is a one-entry edit, not a CSS
// rewrite.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  /** Solid panel fill — either a CSS colour or a CSS gradient string. */
  background: string;
  /** Foreground (icon + ticker) colour on the solid panel. */
  foreground?: string;
  /** Inline SVG glyph rendered on the solid panel. Receives `currentColor`. */
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

function QrCode({ value, size = 152 }: { value: string; size?: number }) {
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

  return (
    <article className="crypto-card" data-id={method.id}>
      <div
        className="crypto-card__solid"
        style={{
          background: method.background,
          color: method.foreground ?? "#FFFFFF",
        }}
        aria-hidden
      >
        <div className="crypto-card__icon">{method.icon}</div>
      </div>

      <div className="crypto-card__glass">
        <header className="crypto-card__head">
          <div>
            <h3 className="crypto-card__title">{method.ticker}</h3>
            <p className="crypto-card__network">{method.network}</p>
          </div>
        </header>

        <div className="crypto-card__qr">
          <QrCode value={method.address} />
        </div>

        <div className="crypto-card__addr-row">
          <span
            className="crypto-card__addr"
            aria-label={`${method.name} address on ${method.network}`}
          >
            {method.address}
          </span>
          <button
            type="button"
            className="crypto-card__copy"
            onClick={copy}
            data-copied={copied || undefined}
            aria-live="polite"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
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
