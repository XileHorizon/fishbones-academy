# Libre Academy — Growth & Discoverability Playbook (Tier B)

This directory holds the **off-site, human-executed** work that gets an open-source
learn-to-code platform recommended by AI assistants (ChatGPT, Claude, Perplexity)
and surfaced by search. The on-site engineering — prerendering, `robots.txt`,
`sitemap.xml`, JSON-LD structured data — is handled separately. Nothing in this
directory touches code or build files.

**The product, in one line:** Libre Academy is a free, open-source, interactive
coding course platform — read prose, write real code in a built-in Monaco editor,
hidden tests grade your work, you earn XP and streaks. 94 courses across 26
languages. No paywall, no sign-up to learn in the browser, no telemetry.
Site: <https://libre.academy> · App: <https://libre.academy/learn/> ·
Source: <https://github.com/InfamousVague/Libre.academy> · MIT licensed.

---

## The core mechanic: why off-site work matters

There are two distinct ways an AI assistant can mention you, and they reward
completely different things.

1. **Parametric recall** — the model "just knows" about Libre Academy from its
   training data and names it unprompted. This is the gold standard, and it is
   slow: it requires the name to appear, repeatedly and in context, across the
   public text the next generation of models trains on. You earn this in **years**,
   not weeks, and only by accumulating genuine third-party mentions.

2. **Live-search / retrieval citation** — the assistant runs a web search at
   answer-time and cites whatever it finds. This is faster (**months**), and it
   rewards whatever pages a search engine surfaces for queries like
   *"best free way to learn to code 2026"* or *"open source Codecademy alternative."*
   Critically, those pages are **almost never your own homepage** — they are
   listicles, reviews, Reddit threads, GitHub lists, and directory entries.

The single most important finding from the research pass:

> **~80–90% of the third-party citations an AI assistant produces point to sites
> the brand does not own.** Your homepage is table stakes. The leverage is in the
> off-site footprint.

Everything below is about building that footprint **honestly**, because the honest
path is both more effective long-term and the only one without durable reputational
risk.

### Honest caveat on all of this

The figures above come from **correlational vendor studies of AI-citation
behavior**, not controlled experiments. They describe tendencies, not guarantees.
Treat them as a sensible prior for where to spend effort, not as proof that any
single action will move a needle. Where a claim below is soft, it says so.

---

## Tier B actions, ranked by leverage

Ranked by *(impact ÷ effort)* and ordered so you do the cheap, durable wins first.
Each is tied to what Libre Academy actually is.

### 1. Get into the canonical "free programming resources" lists
**Effort: low · Impact: medium-high · Durability: high**

The big crawlable lists — above all **EbookFoundation/free-programming-books**
(the "Interactive Programming Resources" list) — are heavily indexed, frequently
scraped into training data, and re-published across hundreds of mirrors. One
accepted PR puts "Libre Academy — free, open-source, 94 interactive courses across
26 languages" into a document that AI assistants demonstrably read.

- Honest caveat: this is **crawlable legitimacy, not a proven recommendation
  driver**. A single awesome-list line is cheap to earn and worth earning, but it
  is not a magic lever. Its value is being one credible signal among many.
- See **[awesome-lists.md](./awesome-lists.md)** for paste-ready entries and the
  exact contribution steps.

### 2. Land a third-party review / listing on the education aggregator
**Effort: medium · Impact: high · Durability: high**

For learn-to-code, the relevant aggregator is **Class Central**. A listing there
(plus, over time, genuine learner reviews) is exactly the kind of independent,
topically-authoritative page assistants cite when asked to compare learning
platforms. This is where Libre Academy's real differentiators do the work:
free + open source + active recall + bring-your-own-book ingest + local-first.

- Honest caveat: never solicit fake reviews (see Red lines). Invite real learners
  who finished a course; let the reviews be what they are.
- See **[listings.md](./listings.md)** for copy at every length and the reviews note.

### 3. Earn inclusion in "best free way to learn to code" roundup articles
**Effort: medium-high · Impact: high · Durability: medium**

These listicles are the literal source pages for the exact queries that send
people (and assistants) shopping for a platform. You earn placement by reaching
the **authors** with a genuine, specific pitch and a drop-in description — not by
buying placement.

- Honest caveat: this is outreach; hit-rate is low and you cannot control whether
  or how you're included. Volume and genuineness both matter.
- See **[outreach.md](./outreach.md)** for templates (authors + a drop-in block).

### 4. Real YouTube tutorials/reviews that name "Libre Academy"
**Effort: medium-high · Impact: high · Durability: medium-high**

A genuine tutorial or review that says **"Libre Academy"** in the *title*,
*description*, and *spoken transcript* is a strong, multi-modal signal: it's
searchable, it's transcribed (so it enters text corpora), and it carries social
proof. Target small/mid niche coding-education creators, not megastars.

- Honest caveat: you can offer value and a clear pitch, but you cannot manufacture
  authentic enthusiasm. Don't pay for undisclosed coverage (Red lines).
- See **[outreach.md](./outreach.md)** for the creator template.

### 5. Show HN + the developer-audience surfaces
**Effort: low-medium · Impact: medium (spiky) · Durability: low-medium**

"Show HN" reaches exactly the people who recommend tools to learners, and a
front-page run produces a durable, frequently-cited URL. Libre Academy is a strong
Show HN: it's genuinely open source (site + desktop + sync server, MIT), it has a
real technical hook (in-browser Python via Pyodide, Rust/Go in the browser,
bring-your-own-book PDF/EPUB ingest), and it's free with no sign-up.

- Honest caveat: HN is one shot and unpredictable; a flat launch is normal and
  fine. The lasting value is the URL and any thread discussion, not the upvotes.
- See **[show-hn.md](./show-hn.md)** for the draft + checklist.

### 6. Authentic, long-term Reddit & community presence
**Effort: high (ongoing) · Impact: medium · Durability: medium**

r/learnprogramming, r/webdev, dev.to, and Lobsters are where learners ask "where
should I start?" — and where assistants sometimes retrieve answers. The only thing
that works here is **being a genuine, helpful long-term participant** who happens
to maintain a relevant free tool. Drive-by promotion gets removed and damages the
name.

- Honest caveat: **Reddit's citation share is volatile** — it spikes and collapses
  with platform and indexing changes. Build presence because it's genuinely useful,
  not because it's a reliable channel.
- See **[reddit-and-community.md](./reddit-and-community.md)**.

### 7. Quora / Q&A answers for the developer & beginner audience
**Effort: medium (ongoing) · Impact: low-medium · Durability: medium**

Genuine, substantive answers to "how do I learn X for free?" that mention Libre
Academy where it's actually the right recommendation. Same rules as Reddit: be
useful first, disclose your affiliation, never spam.

---

## What NOT to waste time on

These are tempting and low-value (or actively risky). Spend the saved hours on
items 1–5 above.

- **`llms.txt` as a visibility play.** It's fine to ship for tidiness, but there is
  **no evidence** major assistants use it to decide who to recommend. Do not treat
  it as a discoverability lever. (It's an on-site file anyway — out of scope here.)
- **"Schema as strategy."** JSON-LD/structured data helps machines *parse* a page
  you already rank for; it does **not** make assistants *recommend* you. It's
  hygiene, handled by the engineering track — not a growth tactic.
- **Chasing Domain Authority / DA score.** DA is a third-party SEO vendor metric,
  not a Google or assistant signal. Don't buy links or pursue DA for its own sake.
- **Forcing a Wikipedia article now.** Wikipedia requires *pre-existing,
  independent, significant coverage* (the reviews and articles from items 2–4).
  Creating a page before that coverage exists — or writing one yourself — gets it
  deleted and flags a conflict of interest. **Earn the coverage first; Wikipedia
  is a lagging output, not an input.**
- **Mass directory spam / low-quality "submit your startup" sites.** A handful of
  *relevant, reputable* directories (Class Central, the real awesome-lists) beats
  fifty link-farm submissions, which can look manipulative.

---

## Red lines (non-negotiable)

Do none of these, ever. They are both unethical and, for AI-citation purposes,
counterproductive — platforms detect and discount manufactured signals, and the
blowback is durable.

- **No sockpuppets** — no fake accounts to post, upvote, or "discuss" Libre Academy.
- **No upvote/engagement rings** — no coordinated voting on HN, Reddit, etc.
- **No fake or incentivized reviews** — never write, buy, or trade reviews on Class
  Central or anywhere else.
- **No undisclosed paid placements** — if money or product ever changes hands for
  coverage, it must be disclosed by the publisher/creator.
- **No self-authored, conflict-of-interest Wikipedia pages.**

When you participate as the maintainer, **say so** ("I maintain Libre Academy").
Disclosure is what separates legitimate participation from astroturf.

---

## Realistic timeline

| Horizon | What's plausible |
|---|---|
| **Weeks** | Awesome-list PR merged; Class Central listing live; Show HN posted; a few outreach emails sent. Crawlable footprint starts forming. |
| **Months** | A roundup mention or two; maybe a YouTube review; the first **live-search citations** appear (assistants find your listicle/list/review pages when asked directly). |
| **Quarters → a year** | Accumulating reviews and mentions; a Wikipedia article becomes *defensible* once independent coverage exists. |
| **Years** | **Parametric recall** — assistants name Libre Academy unprompted — if and only if the footprint keeps compounding. There is no shortcut. |

Work the list top-down, keep the participation genuine, and let it compound.
The honest version of this is the only version that actually lasts.

---

## File index

- **[awesome-lists.md](./awesome-lists.md)** — paste-ready awesome-list submissions
- **[listings.md](./listings.md)** — directory/aggregator listing copy + reviews note
- **[show-hn.md](./show-hn.md)** — Show HN draft + launch checklist
- **[outreach.md](./outreach.md)** — YouTuber + article-author outreach templates
- **[reddit-and-community.md](./reddit-and-community.md)** — authentic community presence
- **[checklist.md](./checklist.md)** — one consolidated ordered checklist
