import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Wallet, Send, Box, Zap, FileCode2, Activity } from "lucide-react";
import "./EvmChainSpotlight.css";

/// Marketing replica of the in-app ChainDock — the floating EVM
/// inspector that sits beside the workbench when learning Solidity.
/// Mirrors the real component's layout (block header / accounts list
/// / transactions feed / contracts list) but with synthetic data
/// that animates: block number ticks every ~2.4s, a fake tx
/// appears every ~3.5s, the Counter contract from the WorkbenchSpotlight
/// above shows up in the deployments list to tie the two sections
/// together.
///
/// Why a replica instead of mounting the real ChainDock:
///   - The real one binds to `evmChainService` (a singleton with
///     @ethereumjs/vm + viem inside, ~1 MB gzipped). Marketing
///     pages can't carry that bundle.
///   - The animation tells a story (chain advancing, txs landing,
///     contracts being deployed) that a screenshot can't.
///
/// All data is hardcoded except the block number (increments every
/// 2.4s) and the tx feed (a rolling window of 6 txs, new ones
/// appear via Framer Motion layout animations).

const FAKE_ACCOUNTS = [
  { addr: "0x5FbDB2…aaA3", balance: "9999.85", label: "Deployer" },
  { addr: "0x70997…dEf0", balance: "10000.00", label: "Account 1" },
  { addr: "0x3C44C…b906", balance: "10000.00", label: "Account 2" },
  { addr: "0x90F79…a65a", balance: "10000.00", label: "Account 3" },
  { addr: "0x15d34…c4Bc", balance: "9999.92", label: "Account 4" },
];

const FAKE_CONTRACTS = [
  { name: "Counter", addr: "0x5FbDB2…aaa3", deployedAt: 128 },
  { name: "ERC20Mock", addr: "0xe7f17…D9aB", deployedAt: 124 },
];

// Tx templates that the rolling feed cycles through. Each fake
// "tx" gets a fresh hash + block number when it lands.
const TX_TEMPLATES = [
  { kind: "call" as const, fn: "increment()", to: "Counter", from: "0x70997…dEf0", gas: "26,431" },
  { kind: "call" as const, fn: "transfer(address,uint256)", to: "ERC20Mock", from: "0x3C44C…b906", gas: "51,205" },
  { kind: "call" as const, fn: "increment()", to: "Counter", from: "0x90F79…a65a", gas: "26,431" },
  { kind: "deploy" as const, fn: "constructor()", to: "Counter v2", from: "0x5FbDB2…aaA3", gas: "152,194" },
  { kind: "call" as const, fn: "approve(address,uint256)", to: "ERC20Mock", from: "0x70997…dEf0", gas: "46,012" },
  { kind: "call" as const, fn: "reset()", to: "Counter", from: "0x15d34…c4Bc", gas: "23,118" },
];

interface Tx {
  id: number;
  hash: string;
  kind: "call" | "deploy";
  fn: string;
  to: string;
  from: string;
  gas: string;
  block: number;
}

function genHash(): string {
  // Plausible-looking hash. Not cryptographic; we just need
  // visual variety in the feed.
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 6; i++) s += hex[Math.floor(Math.random() * 16)];
  let t = "";
  for (let i = 0; i < 4; i++) t += hex[Math.floor(Math.random() * 16)];
  return `0x${s}…${t}`;
}

export function EvmChainSpotlight() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.3, once: false });

  const [blockNumber, setBlockNumber] = useState(128);
  const [gasPrice, setGasPrice] = useState(2.31);
  const [txs, setTxs] = useState<Tx[]>(() => {
    // Seed with 4 historical txs so the feed isn't empty on first
    // paint.
    return [
      { id: 1, hash: genHash(), block: 127, ...TX_TEMPLATES[0] },
      { id: 2, hash: genHash(), block: 126, ...TX_TEMPLATES[1] },
      { id: 3, hash: genHash(), block: 125, ...TX_TEMPLATES[2] },
      { id: 4, hash: genHash(), block: 124, ...TX_TEMPLATES[3] },
    ];
  });
  const nextTxIdRef = useRef(5);
  const txTemplateIdxRef = useRef(0);

  // Block ticker — increments every 2.4s while in view.
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setBlockNumber((b) => b + 1);
      // Fake gas price wander — keeps the meta strip alive.
      setGasPrice((g) => {
        const next = g + (Math.random() - 0.5) * 0.4;
        return Math.max(0.5, Math.min(8, +next.toFixed(2)));
      });
    }, 2400);
    return () => clearInterval(id);
  }, [inView]);

  // Tx feed — a new one lands every ~3.5s, capped at 6 visible.
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      txTemplateIdxRef.current = (txTemplateIdxRef.current + 1) % TX_TEMPLATES.length;
      const template = TX_TEMPLATES[txTemplateIdxRef.current];
      const newTx: Tx = {
        id: nextTxIdRef.current++,
        hash: genHash(),
        block: blockNumber,
        ...template,
      };
      setTxs((prev) => [newTx, ...prev].slice(0, 6));
    }, 3500);
    return () => clearInterval(id);
  }, [inView, blockNumber]);

  return (
    <section className="evm-spotlight" ref={ref}>
      <div className="evm-spotlight__inner">
        <div className="evm-spotlight__copy">
          <span className="evm-spotlight__eyebrow">
            <Zap size={12} /> Production-grade EVM tooling
          </span>
          <h2 className="evm-spotlight__title">
            A real Ethereum chain. <em>Inside the lesson.</em>
          </h2>
          <p className="evm-spotlight__lede">
            Every Solidity lesson runs against an in-process EVM —
            the same <code>@ethereumjs/vm</code> + <code>viem</code> stack
            production teams use, with snapshots, time-travel, faucets,
            and a 10-account dev set pre-funded for you. Deploy, call,
            revert, replay. No Anvil, no Hardhat, no terminal.
          </p>
          <ul className="evm-spotlight__bullets">
            <li><span className="evm-spotlight__dot" /> Snapshot + revert between tests for free</li>
            <li><span className="evm-spotlight__dot" /> <code>evm_increaseTime</code>, <code>evm_mine</code>, <code>evm_setBalance</code> exposed</li>
            <li><span className="evm-spotlight__dot" /> Faucet ships 100 ETH on demand to any address</li>
            <li><span className="evm-spotlight__dot" /> Same RPC surface as Anvil / Hardhat — viem clients work unchanged</li>
          </ul>
          <a href="/download" className="evm-spotlight__cta">
            Get the desktop app
            <span className="evm-spotlight__cta-arrow" aria-hidden>→</span>
          </a>
        </div>

        <motion.div
          className="evm-dock"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Dock header — chain name + block number that ticks */}
          <div className="evm-dock__header">
            <div className="evm-dock__title">
              <span className="evm-dock__title-dot" />
              Local EVM
            </div>
            <div className="evm-dock__meta">
              <span className="evm-dock__block">
                <Box size={11} /> #{blockNumber}
              </span>
              <span className="evm-dock__gas">
                {gasPrice.toFixed(2)} gwei
              </span>
            </div>
          </div>

          {/* Accounts panel — 5 visible (we say "10 dev accounts"
              in the copy; only show the top 5 to keep the panel
              compact) */}
          <div className="evm-dock__panel">
            <div className="evm-dock__panel-head">
              <Wallet size={11} />
              Accounts
              <span className="evm-dock__panel-meta">10 funded</span>
            </div>
            <div className="evm-dock__accounts">
              {FAKE_ACCOUNTS.map((a, i) => (
                <div className="evm-dock__account" key={a.addr}>
                  <span
                    className="evm-dock__account-avatar"
                    style={{ background: avatarColor(i) }}
                  />
                  <span className="evm-dock__account-addr">{a.addr}</span>
                  <span className="evm-dock__account-balance">{a.balance} ETH</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tx feed — new entries land at the top via layout animation */}
          <div className="evm-dock__panel">
            <div className="evm-dock__panel-head">
              <Activity size={11} />
              Transactions
              <span className="evm-dock__panel-meta">live</span>
            </div>
            <div className="evm-dock__txs">
              {txs.map((tx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: -8, backgroundColor: "rgba(108,140,255,0.18)" }}
                  animate={{ opacity: 1, y: 0, backgroundColor: "rgba(255,255,255,0)" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`evm-dock__tx evm-dock__tx--${tx.kind}`}
                >
                  <span className={`evm-dock__tx-kind evm-dock__tx-kind--${tx.kind}`}>
                    {tx.kind === "deploy" ? "DEPLOY" : "CALL"}
                  </span>
                  <span className="evm-dock__tx-fn">{tx.fn}</span>
                  <span className="evm-dock__tx-to">→ {tx.to}</span>
                  <span className="evm-dock__tx-block">#{tx.block}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contracts panel */}
          <div className="evm-dock__panel">
            <div className="evm-dock__panel-head">
              <FileCode2 size={11} />
              Contracts
              <span className="evm-dock__panel-meta">{FAKE_CONTRACTS.length} deployed</span>
            </div>
            <div className="evm-dock__contracts">
              {FAKE_CONTRACTS.map((c) => (
                <div className="evm-dock__contract" key={c.addr}>
                  <span className="evm-dock__contract-name">{c.name}</span>
                  <span className="evm-dock__contract-addr">{c.addr}</span>
                  <span className="evm-dock__contract-block">block #{c.deployedAt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Faucet button (visual only) */}
          <button
            type="button"
            className="evm-dock__faucet"
            disabled
            aria-hidden
          >
            <Send size={11} /> Faucet · 100 ETH
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/// Generate a stable hue per account index — used as the avatar
/// circle so the accounts list reads as a small, distinguishable
/// set the way the real ChainDock does (it uses a deterministic
/// hue derived from the address; we cheat with the index).
function avatarColor(i: number): string {
  const hues = [210, 250, 290, 30, 70, 110, 150, 190, 330, 0];
  const h = hues[i % hues.length];
  return `linear-gradient(135deg, hsl(${h}, 60%, 55%), hsl(${h + 30}, 60%, 45%))`;
}
