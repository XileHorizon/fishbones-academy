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
} from "react";
// We only use a tiny slice of the API; QrFactoryT below pins the shape.
import qrcodeFactory from "qrcode-generator";
// Single source of truth for tip wallets + brand glyphs lives in
// TipPopover. CryptoSupport (the /support grid + floating dock) used
// to keep its own duplicate of the address list, which drifted out
// of sync — `REPLACE_WITH_*` placeholders shipped to production for
// months while TipPopover already had the real wallets. Re-export
// the canonical types and defaults so any future address swap is a
// single-file edit.
import {
  DEFAULT_TIP_METHODS,
  type TipMethod,
} from "./TipPopover";
import "./CryptoSupport.css";

// ─────────────────────────── Types ───────────────────────────

/// Alias kept for backwards compatibility with existing callers
/// (`CryptoMethod[]` props on the page-level grid). The TipPopover
/// shape is identical — id, ticker, name, network, address, badge
/// background/foreground, tint, glyph node — so a thin alias keeps
/// the local API stable without duplicating the interface.
export type CryptoMethod = TipMethod;

export interface CryptoSupportProps {
  methods?: CryptoMethod[];
  className?: string;
}

// ─────────────────────────── Defaults ───────────────────────────
// Re-exported from TipPopover so the `/support` cards and the
// floating dock render the same chains in the same order with the
// same wallets the desktop app uses.

export const DEFAULT_METHODS: CryptoMethod[] = DEFAULT_TIP_METHODS;

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

interface CryptoCardProps {
  method: CryptoMethod;
}

function CryptoCard({ method }: CryptoCardProps) {
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

