// Recent-tips activity feed for /support and /donate. Pulls the last
// confirmed inbound transactions for each tip address in
// `DEFAULT_TIP_METHODS` from public block explorers, normalizes the
// shapes, and renders a unified time-sorted list.
//
// Per-chain APIs (all CORS-enabled, no API keys, free tier):
//   BTC     blockstream.info Esplora        /address/{a}/txs
//   ETH     eth.blockscout.com v2           /addresses/{a}/transactions
//   USDC    eth.blockscout.com v2           /addresses/{a}/token-transfers?type=ERC-20
//   SOL     api.mainnet-beta.solana.com     getSignaturesForAddress (signatures only;
//                                            no amount without N+1 getTransaction calls)
//   XRP     api.xrpscan.com v1              /account/{a}/transactions
//
// Each chain has its own fetcher + try/catch. A failure (network, CORS,
// 429, parse) shows an inline "couldn't load" note for that chain only;
// the rest of the feed still renders. We never block render on the
// network — `loading` flips to `false` after Promise.allSettled
// resolves so the empty / partial UI shows up immediately.
//
// Refresh is manual (button in the header). No polling — keeps explorer
// quotas happy and respects user agency.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_TIP_METHODS, type TipMethod } from "./TipPopover";
import "./TipActivity.css";

// ────────────────────── Normalized shape ──────────────────────

type Chain = "btc" | "eth" | "usdc" | "sol" | "xrp";

interface TipEvent {
  chain: Chain;
  /** Tx hash / signature, full string. Used as React key + explorer link. */
  hash: string;
  /** Sender address or "—" if unknown / multi-input. Truncated for display. */
  from: string | null;
  /** Human-formatted amount with ticker, e.g. "0.0042 ETH" or "12.50 USDC". */
  amountDisplay: string | null;
  /** Unix seconds. Drives "3h ago" + sort order. */
  timestamp: number;
  /** Explorer URL — opens in new tab when the row is clicked. */
  explorerUrl: string;
}

interface ChainState {
  events: TipEvent[];
  /** When set, this chain failed to load. Other chains may still have data. */
  error: string | null;
}

// ────────────────────── Address index ──────────────────────
// Pull addresses from TipPopover so there's exactly one source of
// truth on this site. If you swap a wallet, both the popover deck and
// the activity feed update together.

interface ResolvedMethod {
  chain: Chain;
  method: TipMethod;
}

function resolveMethods(): ResolvedMethod[] {
  // Map tip method ids to our internal Chain enum. The TipPopover
  // method list is the single source of truth.
  const lookup: Record<string, Chain> = {
    btc: "btc",
    eth: "eth",
    sol: "sol",
    xrp: "xrp",
    usdc: "usdc",
  };
  const out: ResolvedMethod[] = [];
  for (const m of DEFAULT_TIP_METHODS) {
    const chain = lookup[m.id];
    if (!chain) continue;
    out.push({ chain, method: m });
  }
  return out;
}

// ────────────────────── Per-chain fetchers ──────────────────────
// Each returns a list of normalized TipEvents (incoming only) or
// throws. Throwers surface as a per-chain error band; successes feed
// the unified list.

const FETCH_TIMEOUT_MS = 8000;
const MAX_PER_CHAIN = 8;

/** USDC on Ethereum mainnet — used to filter the address's full
    token-transfer history down to USDC tips only. */
const USDC_CONTRACT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
/** Ripple epoch (seconds-since-2000-01-01-UTC) → unix epoch shift. */
const RIPPLE_EPOCH_OFFSET = 946684800;

/** Wraps fetch with an AbortController-driven timeout. Public block
    explorers usually respond < 1s, but a stalled fetch shouldn't pin
    the loading spinner indefinitely. */
async function timedFetch(url: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    window.clearTimeout(t);
  }
}

async function fetchBtc(addr: string): Promise<TipEvent[]> {
  const r = await timedFetch(`https://blockstream.info/api/address/${addr}/txs`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const txs = (await r.json()) as Array<{
    txid: string;
    status?: { confirmed?: boolean; block_time?: number };
    vin?: Array<{ prevout?: { scriptpubkey_address?: string } }>;
    vout?: Array<{ value: number; scriptpubkey_address?: string }>;
  }>;
  return txs
    .flatMap<TipEvent>((tx) => {
      // Sum outputs paid to OUR address — that's the incoming amount.
      // BTC values are in satoshis.
      const sats = (tx.vout ?? [])
        .filter((v) => v.scriptpubkey_address === addr)
        .reduce((acc, v) => acc + (v.value ?? 0), 0);
      if (sats <= 0) return [];
      // Pick the first input address as the "from" for display. BTC
      // can have multiple inputs (and self-spends), so this is a
      // best-effort hint, not a definitive sender.
      const from =
        tx.vin?.find((i) => i.prevout?.scriptpubkey_address)?.prevout
          ?.scriptpubkey_address ?? null;
      return [{
        chain: "btc",
        hash: tx.txid,
        from,
        amountDisplay: `${(sats / 1e8).toFixed(8)} BTC`.replace(/0+$/, "").replace(/\.$/, ".0"),
        timestamp: tx.status?.block_time ?? Math.floor(Date.now() / 1000),
        explorerUrl: `https://blockstream.info/tx/${tx.txid}`,
      }];
    })
    .slice(0, MAX_PER_CHAIN);
}

async function fetchEth(addr: string): Promise<TipEvent[]> {
  // `filter=to` returns only txs where the address is the recipient,
  // i.e. incoming tips. The blockscout v2 schema returns ISO timestamps
  // and decimal-string `value` (wei).
  const r = await timedFetch(
    `https://eth.blockscout.com/api/v2/addresses/${addr}/transactions?filter=to`,
  );
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = (await r.json()) as {
    items?: Array<{
      hash: string;
      value: string;
      from?: { hash?: string };
      timestamp: string;
    }>;
  };
  return (data.items ?? [])
    .flatMap<TipEvent>((tx) => {
      const wei = BigInt(tx.value || "0");
      if (wei === 0n) return [];
      const eth = Number(wei) / 1e18;
      return [{
        chain: "eth",
        hash: tx.hash,
        from: tx.from?.hash ?? null,
        amountDisplay: `${eth.toFixed(eth < 0.001 ? 6 : 4)} ETH`,
        timestamp: Math.floor(new Date(tx.timestamp).getTime() / 1000),
        explorerUrl: `https://etherscan.io/tx/${tx.hash}`,
      }];
    })
    .slice(0, MAX_PER_CHAIN);
}

async function fetchUsdc(addr: string): Promise<TipEvent[]> {
  // ERC-20 token transfers on the same Ethereum address. The endpoint
  // returns every token; we filter to USDC by contract address.
  const r = await timedFetch(
    `https://eth.blockscout.com/api/v2/addresses/${addr}/token-transfers?type=ERC-20`,
  );
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = (await r.json()) as {
    items?: Array<{
      transaction_hash: string;
      from?: { hash?: string };
      to?: { hash?: string };
      timestamp: string;
      total?: { value?: string; decimals?: string };
      token?: { address?: string };
    }>;
  };
  // flatMap with explicit type parameter widens the element type to
  // TipEvent, sidestepping the TS narrowing quirk where `chain: "usdc"
  // as const` makes the post-map element narrower than TipEvent and
  // breaks a downstream type-predicate filter. flatMap returns the
  // empty array to skip an item; otherwise wraps a single TipEvent.
  return (data.items ?? [])
    .filter((t) => {
      // Only inbound transfers; only the USDC contract.
      const isInbound = t.to?.hash?.toLowerCase() === addr.toLowerCase();
      const isUsdc = t.token?.address?.toLowerCase() === USDC_CONTRACT;
      return isInbound && isUsdc;
    })
    .flatMap<TipEvent>((t) => {
      const decimals = Number(t.total?.decimals ?? "6");
      const raw = BigInt(t.total?.value || "0");
      // USDC has 6 decimals. Floating-point divide is safe at this scale.
      const usd = Number(raw) / Math.pow(10, decimals);
      if (usd === 0) return [];
      return [{
        chain: "usdc",
        hash: t.transaction_hash,
        from: t.from?.hash ?? null,
        amountDisplay: `${usd.toFixed(2)} USDC`,
        timestamp: Math.floor(new Date(t.timestamp).getTime() / 1000),
        explorerUrl: `https://etherscan.io/tx/${t.transaction_hash}`,
      }];
    })
    .slice(0, MAX_PER_CHAIN);
}

async function fetchSol(addr: string): Promise<TipEvent[]> {
  // `getSignaturesForAddress` returns sig + blockTime only — fetching
  // the actual amount requires `getTransaction` per signature, which
  // would be N+1 RPC calls and easily blow the public mainnet rate
  // limit. We accept the tradeoff: SOL rows display the signature +
  // time, marked with a hint in the amount column instead of a
  // resolved amount.
  const r = await timedFetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getSignaturesForAddress",
      params: [addr, { limit: MAX_PER_CHAIN }],
    }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = (await r.json()) as {
    error?: { message?: string };
    result?: Array<{ signature: string; blockTime: number | null; err: unknown }>;
  };
  if (data.error?.message) throw new Error(data.error.message);
  return (data.result ?? [])
    .filter((s) => !s.err && s.blockTime)
    .map((s) => ({
      chain: "sol" as const,
      hash: s.signature,
      from: null, // not fetched — see comment above
      amountDisplay: null,
      timestamp: s.blockTime as number,
      explorerUrl: `https://solscan.io/tx/${s.signature}`,
    }));
}

async function fetchXrp(addr: string): Promise<TipEvent[]> {
  const r = await timedFetch(
    `https://api.xrpscan.com/api/v1/account/${addr}/transactions`,
  );
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = (await r.json()) as {
    transactions?: Array<{
      hash: string;
      date?: string;
      tx?: {
        Account?: string;
        Destination?: string;
        Amount?: string | { value?: string; currency?: string };
        TransactionType?: string;
        date?: number;
      };
    }>;
  };
  return (data.transactions ?? [])
    .filter((t) => {
      // Inbound XRP payments only. Skip OfferCreate / TrustSet etc.
      if (t.tx?.TransactionType !== "Payment") return false;
      if (t.tx?.Destination?.toLowerCase() !== addr.toLowerCase()) return false;
      // Native XRP payments have a string Amount (drops). Issued
      // currencies are objects — we skip those (only XRP tips count
      // toward the XRP address).
      return typeof t.tx.Amount === "string";
    })
    .map((t) => {
      const drops = Number(t.tx?.Amount as string) || 0;
      const xrp = drops / 1e6;
      // xrpscan ships an ISO `date` field on the outer object; the
      // inner `tx.date` is in Ripple epoch (seconds since 2000-01-01).
      const ts = t.date
        ? Math.floor(new Date(t.date).getTime() / 1000)
        : (t.tx?.date ?? 0) + RIPPLE_EPOCH_OFFSET;
      return {
        chain: "xrp" as const,
        hash: t.hash,
        from: t.tx?.Account ?? null,
        amountDisplay: `${xrp.toFixed(xrp < 1 ? 4 : 2)} XRP`,
        timestamp: ts,
        explorerUrl: `https://xrpscan.com/tx/${t.hash}`,
      };
    })
    .slice(0, MAX_PER_CHAIN);
}

// ────────────────────── Display helpers ──────────────────────

function shortenHash(s: string, head = 6, tail = 4): string {
  if (!s) return "—";
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

function timeAgo(unixSeconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSeconds;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  return new Date(unixSeconds * 1000).toLocaleDateString();
}

const CHAIN_LABEL: Record<Chain, string> = {
  btc: "BTC",
  eth: "ETH",
  usdc: "USDC",
  sol: "SOL",
  xrp: "XRP",
};

const CHAIN_TINT: Record<Chain, string> = {
  btc: "#F7931A",
  eth: "#627EEA",
  usdc: "#2775CA",
  sol: "#9945FF",
  xrp: "#3631cc",
};

// ────────────────────── Component ──────────────────────

export interface TipActivityProps {
  /** Optional cap on rows shown across all chains. Default 20. */
  limit?: number;
}

export function TipActivity({ limit = 20 }: TipActivityProps) {
  const methods = useMemo(() => resolveMethods(), []);
  const [perChain, setPerChain] = useState<Record<Chain, ChainState>>(() => ({
    btc: { events: [], error: null },
    eth: { events: [], error: null },
    usdc: { events: [], error: null },
    sol: { events: [], error: null },
    xrp: { events: [], error: null },
  }));
  const [loading, setLoading] = useState(true);
  const [reloadNonce, setReloadNonce] = useState(0);

  const refresh = useCallback(() => {
    setReloadNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Map each resolved chain to its fetcher. Wrapped in a chain-tagged
    // promise so Promise.allSettled returns enough info to slot the
    // result back into per-chain state without losing the chain id.
    const tasks = methods.map(({ chain, method }) => {
      const run = async (): Promise<{ chain: Chain; events: TipEvent[] }> => {
        const events =
          chain === "btc" ? await fetchBtc(method.address)
          : chain === "eth" ? await fetchEth(method.address)
          : chain === "usdc" ? await fetchUsdc(method.address)
          : chain === "sol" ? await fetchSol(method.address)
          : chain === "xrp" ? await fetchXrp(method.address)
          : [];
        return { chain, events };
      };
      return run()
        .then((r) => ({ ok: true as const, ...r }))
        .catch((e: unknown) => ({
          ok: false as const,
          chain,
          error: e instanceof Error ? e.message : "fetch failed",
        }));
    });

    void Promise.all(tasks).then((results) => {
      if (cancelled) return;
      // Build a fresh per-chain map so a chain that previously errored
      // can clear on a successful refresh.
      const next: Record<Chain, ChainState> = {
        btc: { events: [], error: null },
        eth: { events: [], error: null },
        usdc: { events: [], error: null },
        sol: { events: [], error: null },
        xrp: { events: [], error: null },
      };
      for (const r of results) {
        if (r.ok) next[r.chain] = { events: r.events, error: null };
        else next[r.chain] = { events: [], error: r.error };
      }
      setPerChain(next);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [methods, reloadNonce]);

  // Flatten + sort all chains' events into one time-descending feed,
  // capped at `limit`.
  const events = useMemo(() => {
    const all: TipEvent[] = [];
    for (const c of Object.values(perChain)) all.push(...c.events);
    all.sort((a, b) => b.timestamp - a.timestamp);
    return all.slice(0, limit);
  }, [perChain, limit]);

  const errors = (Object.entries(perChain) as Array<[Chain, ChainState]>)
    .filter(([, s]) => s.error)
    .map(([chain, s]) => ({ chain, message: s.error as string }));

  const totalEvents = events.length;

  return (
    <section className="tip-activity" aria-label="Recent tips">
      <header className="tip-activity__head">
        <div className="tip-activity__head-text">
          <h2 className="tip-activity__title">Latest tips</h2>
          <p className="tip-activity__sub">
            {loading
              ? "Loading recent transactions across every address…"
              : totalEvents === 0
                ? "No tips yet across any chain. Be the first."
                : `Showing ${totalEvents} recent transaction${totalEvents === 1 ? "" : "s"} across ${methods.length} addresses.`}
          </p>
        </div>
        <button
          type="button"
          className="tip-activity__refresh"
          onClick={refresh}
          disabled={loading}
          title="Refresh"
        >
          <RefreshIcon />
          <span>Refresh</span>
        </button>
      </header>

      {errors.length > 0 && (
        <div className="tip-activity__errors" role="status">
          {errors.map((e) => (
            <span key={e.chain} className="tip-activity__error-chip">
              <ChainBadge chain={e.chain} />
              <span>Couldn’t load {CHAIN_LABEL[e.chain]}</span>
            </span>
          ))}
        </div>
      )}

      {loading && totalEvents === 0 ? (
        <ul className="tip-activity__list" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="tip-activity__row tip-activity__row--skeleton">
              <span className="tip-activity__skeleton tip-activity__skeleton--badge" />
              <span className="tip-activity__skeleton tip-activity__skeleton--main" />
              <span className="tip-activity__skeleton tip-activity__skeleton--time" />
            </li>
          ))}
        </ul>
      ) : totalEvents === 0 ? (
        <div className="tip-activity__empty">
          <p>
            Nothing to show yet — once a tip lands at any of the addresses
            above, it’ll show here within a few seconds of confirming.
          </p>
        </div>
      ) : (
        <ul className="tip-activity__list">
          {events.map((ev) => (
            <li key={`${ev.chain}-${ev.hash}`} className="tip-activity__row">
              <ChainBadge chain={ev.chain} />
              <div className="tip-activity__main">
                <div className="tip-activity__amount">
                  {ev.amountDisplay ?? (
                    <span className="tip-activity__amount-muted">
                      Tx · {CHAIN_LABEL[ev.chain]}
                    </span>
                  )}
                </div>
                <div className="tip-activity__meta">
                  {ev.from && (
                    <>
                      <span className="tip-activity__meta-label">from</span>
                      <span className="tip-activity__meta-mono">
                        {shortenHash(ev.from)}
                      </span>
                      <span className="tip-activity__meta-sep">·</span>
                    </>
                  )}
                  <a
                    className="tip-activity__meta-link tip-activity__meta-mono"
                    href={ev.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on block explorer"
                  >
                    {shortenHash(ev.hash, 8, 6)}
                  </a>
                </div>
              </div>
              <time
                className="tip-activity__time"
                dateTime={new Date(ev.timestamp * 1000).toISOString()}
                title={new Date(ev.timestamp * 1000).toLocaleString()}
              >
                {timeAgo(ev.timestamp)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ────────────────────── Bits ──────────────────────

function ChainBadge({ chain }: { chain: Chain }): ReactNode {
  return (
    <span
      className="tip-activity__chain-badge"
      style={{ background: CHAIN_TINT[chain] }}
      aria-label={CHAIN_LABEL[chain]}
      title={CHAIN_LABEL[chain]}
    >
      {CHAIN_LABEL[chain]}
    </span>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 21" />
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 3" />
      <path d="M21 3v6h-6" />
      <path d="M3 21v-6h6" />
    </svg>
  );
}
