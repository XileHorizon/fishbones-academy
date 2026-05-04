/// Lifted verbatim from `Apps/Fishbones/src/data/trees.ts` — the
/// SMART_CONTRACTS skill tree (21 nodes, EVM mental model → DeFi
/// primitives). Pulling the real data into the marketing site keeps
/// the homepage spotlight aligned with what learners see in-app, so
/// /learn/trees and the homepage tree always tell the same story.
///
/// We also lift the minimal subset of types + layout helpers needed
/// to render it: SkillNode, SkillTree, layoutTree (depth assignment),
/// and a stripped-down `layoutWeb` that drops the section-stacking
/// pass (this tree has no section nodes) and the desktop-only
/// completion / lock state. The marketing renderer treats every
/// node as "discoverable" — there's no user state on the marketing
/// site to gate against.
///
/// If the in-app tree changes, re-paste this file. We deliberately
/// avoid setting up a shared build / package import to keep the
/// marketing site's deploy independent of the app's build pipeline.

export interface SkillMatch {
  courseId: string;
  lessonId: string;
}

export interface SkillNode {
  id: string;
  label: string;
  summary: string;
  prereqs: readonly string[];
  matches: readonly SkillMatch[];
  gapNote?: string;
  kind?: "section";
}

export interface SkillTree {
  id: string;
  title: string;
  short: string;
  description: string;
  audience: "beginner" | "specialty";
  accent: string;
  nodes: readonly SkillNode[];
}

// ─────────────────────────────────────────────────────────────────
// SMART CONTRACTS & WEB3 — verbatim from the in-app trees.ts
// ─────────────────────────────────────────────────────────────────

export const SMART_CONTRACTS: SkillTree = {
  id: "smart-contracts",
  title: "Smart Contracts & Web3",
  short: "Web3",
  audience: "specialty",
  accent: "#ffba66",
  description:
    "EVM mental model up through DeFi primitives — AMMs, flash loans, governance, proxies. Pulls from Mastering Ethereum + the Solidity Complete deep dive.",
  nodes: [
    {
      id: "evm-mental-model",
      label: "EVM Mental Model",
      summary: "Accounts, contracts, gas, the world state.",
      prereqs: [],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch04-reading" },
        { courseId: "mastering-ethereum", lessonId: "ch14-the-evm-reading-evm-model" },
        { courseId: "solidity-complete", lessonId: "r2" },
      ],
    },
    {
      id: "solidity-storage",
      label: "Storage",
      summary: "State variables, slot layout, storage / memory / calldata.",
      prereqs: ["evm-mental-model"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch07-smart-contracts-and-solidity-reading-storage" },
        { courseId: "solidity-complete", lessonId: "r9" },
        { courseId: "solidity-complete", lessonId: "r10" },
      ],
    },
    {
      id: "solidity-functions",
      label: "Functions",
      summary: "Visibility, return values, state mutability.",
      prereqs: ["solidity-storage"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch07-smart-contracts-and-solidity-reading-constructors" },
        { courseId: "solidity-complete", lessonId: "r3" },
        { courseId: "solidity-complete", lessonId: "r12" },
      ],
    },
    {
      id: "solidity-events",
      label: "Events",
      summary: "emit, indexed parameters, reading from off-chain.",
      prereqs: ["solidity-functions"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch07-smart-contracts-and-solidity-reading-events" },
        { courseId: "solidity-complete", lessonId: "r15" },
        { courseId: "vyper-fundamentals", lessonId: "r1" },
      ],
    },
    {
      id: "modifiers",
      label: "Modifiers",
      summary: "Pre/post hooks, onlyOwner, parametrised access control.",
      prereqs: ["solidity-functions"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch07-smart-contracts-and-solidity-reading-modifiers" },
        { courseId: "solidity-complete", lessonId: "r13" },
      ],
    },
    {
      id: "erc20-basics",
      label: "ERC-20 Basics",
      summary: "transfer, balanceOf, total supply.",
      prereqs: ["solidity-storage", "solidity-events", "modifiers"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch05-reading" },
        { courseId: "solidity-complete", lessonId: "r36" },
      ],
    },
    {
      id: "erc20-allowance",
      label: "ERC-20 Allowance",
      summary: "approve / transferFrom flow, allowance race condition.",
      prereqs: ["erc20-basics"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch10-tokens-reading-erc20-deep" },
      ],
    },
    {
      id: "erc721-nfts",
      label: "ERC-721 NFTs",
      summary: "ownerOf, approvals, safeTransferFrom.",
      prereqs: ["erc20-basics"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch10-tokens-reading-erc721" },
      ],
    },
    {
      id: "erc1155-batch",
      label: "ERC-1155",
      summary: "Multi-token, batch ops.",
      prereqs: ["erc20-basics"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch10-tokens-reading-beyond-erc20" },
      ],
    },
    {
      id: "security-cei",
      label: "Checks-Effects-Interactions",
      summary: "The pattern that defangs reentrancy.",
      prereqs: ["solidity-functions"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch09-smart-contract-security-reading-reentrancy" },
        { courseId: "solidity-complete", lessonId: "r30" },
      ],
    },
    {
      id: "security-reentrancy",
      label: "Reentrancy",
      summary: "The DAO bug, mutex guards, untrusted external calls.",
      prereqs: ["security-cei"],
      matches: [
        { courseId: "solidity-complete", lessonId: "r29" },
        { courseId: "mastering-ethereum", lessonId: "ch09-smart-contract-security-reading-reentrancy" },
      ],
    },
    {
      id: "security-overflow",
      label: "Overflow Safety",
      summary: "Default checked arithmetic since 0.8, unchecked blocks.",
      prereqs: ["solidity-functions"],
      matches: [
        { courseId: "solidity-complete", lessonId: "r27" },
        { courseId: "solidity-complete", lessonId: "r28" },
      ],
    },
    {
      id: "gas-storage-cost",
      label: "Gas & Storage",
      summary: "How gas maps to opcodes, slot packing, hot vs cold.",
      prereqs: ["solidity-storage"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch14-the-evm-reading-packing" },
        { courseId: "solidity-complete", lessonId: "r33" },
        { courseId: "solidity-complete", lessonId: "r34" },
      ],
    },
    {
      id: "factories-create2",
      label: "CREATE2 Factories",
      summary: "Deterministic addresses for counterfactual deploys.",
      prereqs: ["solidity-functions"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch14-the-evm-reading-create2" },
      ],
    },
    {
      id: "proxies-uups",
      label: "Proxies (UUPS)",
      summary: "Delegatecall, storage layout discipline, upgradability.",
      prereqs: ["factories-create2", "solidity-storage"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch14-the-evm-reading-delegatecall" },
      ],
    },
    {
      id: "amm-basics",
      label: "AMM Basics",
      summary: "Constant-product invariant, slippage, LP tokens.",
      prereqs: ["erc20-basics"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch13-decentralized-finance-reading-amm" },
        { courseId: "mastering-ethereum", lessonId: "ch13-decentralized-finance-reading-defi-intro" },
      ],
    },
    {
      id: "flash-loans",
      label: "Flash Loans",
      summary: "Single-tx borrow + repay, callback-driven.",
      prereqs: ["amm-basics"],
      matches: [],
      gapNote: "No dedicated flash-loan lesson. Host in `mastering-ethereum` DeFi chapter.",
    },
    {
      id: "governance-multisig",
      label: "Governance & Multisig",
      summary: "Proposal lifecycles, timelocks, n-of-m signing.",
      prereqs: ["modifiers"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch12-decentralized-applications-reading-governance" },
        { courseId: "mastering-ethereum", lessonId: "ch12-decentralized-applications-reading-multisig" },
      ],
    },
    {
      id: "merkle-airdrops",
      label: "Merkle Airdrops",
      summary: "Verifying inclusion proofs on-chain.",
      prereqs: ["solidity-storage"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch04-cryptography-reading-merkle" },
        { courseId: "cryptography-fundamentals", lessonId: "r1" },
      ],
    },
    {
      id: "eip712",
      label: "EIP-712 Signatures",
      summary: "Typed structured signing, domain separator, permit pattern.",
      prereqs: ["solidity-functions"],
      matches: [
        { courseId: "mastering-ethereum", lessonId: "ch04-cryptography-reading-eip712" },
        { courseId: "cryptography-fundamentals", lessonId: "r1" },
        { courseId: "viem-ethers", lessonId: "r28" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// Layout helpers — minimal subset of in-app trees layout
// ─────────────────────────────────────────────────────────────────

export interface NodeWithLayout extends SkillNode {
  depth: number;
}

export interface PositionedNode extends NodeWithLayout {
  x: number;
  y: number;
}

export interface LayoutResult {
  positioned: PositionedNode[];
  /// Each non-root node maps to the prereq we treated as its
  /// "primary parent" for layout. Edges from this parent are the
  /// tree skeleton; edges from any *other* prereq are cross-links
  /// and render with a softer style.
  primaryParent: Map<string, string>;
}

const ROW_HEIGHT = 130;
const COL_SPACING = 158;
const ROOT_SPACING = 220;
const SUB_ROW_HEIGHT = 90;
const GRID_PACK_THRESHOLD = 3;

/// Topo-sort nodes and assign each a `depth` (root = 0).
export function layoutTree(tree: SkillTree): NodeWithLayout[] {
  const byId = new Map<string, SkillNode>();
  for (const n of tree.nodes) byId.set(n.id, n);
  const depth = new Map<string, number>();
  const visit = (id: string, stack: Set<string>): number => {
    if (depth.has(id)) return depth.get(id)!;
    if (stack.has(id)) {
      depth.set(id, 0);
      return 0;
    }
    const n = byId.get(id);
    if (!n) return 0;
    stack.add(id);
    let d = 0;
    for (const p of n.prereqs) d = Math.max(d, visit(p, stack) + 1);
    stack.delete(id);
    depth.set(id, d);
    return d;
  };
  for (const n of tree.nodes) visit(n.id, new Set());
  return tree.nodes.map((n) => ({ ...n, depth: depth.get(n.id) ?? 0 }));
}

/// Reingold-Tilford-style placement. Pulled almost verbatim from
/// the in-app `layoutWeb`; the only subtractions are the section-
/// stacking pass (this tree has no section nodes) and the
/// completion-state coloring (we don't have user state here).
export function layoutWeb(tree: SkillTree): LayoutResult {
  const sized = layoutTree(tree);
  const sizedById = new Map(sized.map((n) => [n.id, n] as const));

  // Primary parent: deepest prereq wins (ties → first listed).
  const primaryParent = new Map<string, string>();
  for (const n of sized) {
    if (n.prereqs.length === 0) continue;
    let best = n.prereqs[0];
    let bestDepth = sizedById.get(best)?.depth ?? -1;
    for (const p of n.prereqs) {
      const dp = sizedById.get(p)?.depth ?? -1;
      if (dp > bestDepth) {
        best = p;
        bestDepth = dp;
      }
    }
    primaryParent.set(n.id, best);
  }

  // Adjacency for the primary-parent tree.
  const treeChildren = new Map<string, string[]>();
  for (const n of sized) {
    const pp = primaryParent.get(n.id);
    if (pp) {
      const arr = treeChildren.get(pp) ?? [];
      arr.push(n.id);
      treeChildren.set(pp, arr);
    }
  }

  const placed = new Map<string, PositionedNode>();
  let cursor = 0;

  const layoutSubtree = (id: string): [number, number] => {
    const node = sizedById.get(id);
    if (!node) return [cursor, cursor];
    const kids = treeChildren.get(id) ?? [];
    const y = node.depth * ROW_HEIGHT;
    if (kids.length === 0) {
      const x = cursor;
      placed.set(id, { ...node, x, y });
      cursor += COL_SPACING;
      return [x, x];
    }
    // Grid-pack 3+ siblings that are themselves leaves into a 2-col
    // stack so the tree grows taller, not wider.
    const allKidsAreLeaves = kids.every(
      (k) => (treeChildren.get(k)?.length ?? 0) === 0,
    );
    if (allKidsAreLeaves && kids.length >= GRID_PACK_THRESHOLD) {
      const cols = Math.min(2, kids.length);
      const startX = cursor;
      let minX = Infinity;
      let maxX = -Infinity;
      kids.forEach((kid, i) => {
        const kidNode = sizedById.get(kid);
        if (!kidNode) return;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const kx = startX + col * COL_SPACING;
        const ky = node.depth * ROW_HEIGHT + ROW_HEIGHT + row * SUB_ROW_HEIGHT;
        placed.set(kid, { ...kidNode, x: kx, y: ky });
        if (kx < minX) minX = kx;
        if (kx > maxX) maxX = kx;
      });
      cursor = startX + cols * COL_SPACING;
      const x = (minX + maxX) / 2;
      placed.set(id, { ...node, x, y });
      return [minX, maxX];
    }
    let minLeafX = Infinity;
    let maxLeafX = -Infinity;
    for (const kid of kids) {
      const [klo, khi] = layoutSubtree(kid);
      if (klo < minLeafX) minLeafX = klo;
      if (khi > maxLeafX) maxLeafX = khi;
    }
    const x = (minLeafX + maxLeafX) / 2;
    placed.set(id, { ...node, x, y });
    return [minLeafX, maxLeafX];
  };

  const roots = sized.filter((n) => n.depth === 0);
  for (let i = 0; i < roots.length; i++) {
    layoutSubtree(roots[i].id);
    if (i < roots.length - 1) cursor += ROOT_SPACING - COL_SPACING;
  }

  return { positioned: [...placed.values()], primaryParent };
}

export const TREE_CONSTANTS = {
  ROW_HEIGHT,
  COL_SPACING,
  NODE_WIDTH: 150,
  NODE_HEIGHT: 50,
};
