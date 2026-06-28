# AI-Agent Venues Guide for libre.academy

> **Bottom line up front:** The single highest-value way to "get AI agents helping with the app" is to **ship a small MCP server** (tools: `list_courses`, `get_lesson`, `run_exercise`/`check_solution`) and list it on the MCP registries. That turns Claude, Cursor, Cline, VS Code Copilot, etc. into clients that teach and grade *through* libre.academy. **Almost everything in the "AI-agent registry/marketplace" category is blocked until that server exists** — they all index real, installable MCP servers, not a learn-to-code website. The "AI agent social network" venues (Chirper, most "AI agents directory" clones) are novelty or low-ROI SEO plays; treat them accordingly.
>
> Until the server ships, the only honestly-actionable moves are: a Hacker News *Show HN* launch, a Product Hunt launch, generic AI-tool directories (free tiers only), and the open-source contributor-recruitment channels (Up For Grabs, First Contributions, CodeTriage) **once the repo has good-first-issue labels**.

---

## Category 1 — MCP registries & marketplaces (REQUIRE the MCP server first)

Every venue in this table indexes a real, installable/runnable MCP server. None can list the libre.academy website or a "proposed" server. **All are blocked until the server is built and published.** Listed roughly in leverage order.

| Venue | URL | Free? | Needs MCP server? | Who posts | How to submit | Notes |
|---|---|---|---|---|---|---|
| **Official MCP Registry** | registry.modelcontextprotocol.io | Free (metadata only) | **Yes** | YOU (authed CLI; automatable via GH Actions OIDC) | `mcp-publisher` CLI — publish package to npm/PyPI/Docker first, add `mcpName: io.github.<user>/libre`, `mcp-publisher init` → `login github` → `publish` | **Highest leverage** — canonical upstream; Smithery/PulseMCP/Glama/VS Code/Docker all pull from it. ~2k servers, Anthropic/GitHub/Microsoft/PulseMCP-backed. Still "preview." Requires a *published package*, not just a repo. Spec's "no-auth API" is WRONG — auth required. |
| **Smithery.ai** | smithery.ai | Free (paid hosting upsell) | **Yes** | YOU (OAuth) | smithery.ai/new or `smithery mcp publish <url> -n <org/server>`; needs a deployed Streamable-HTTP endpoint or `.mcpb` bundle | Dominant MCP distribution platform (~7k servers), wired into Claude/Cursor/Cline installs. Paid tier only for *managed hosting*. Live-scans your server for the listing. |
| **mcp.so** | mcp.so | Free | **Yes** | AGENT via GitHub (authed `gh issue comment`) | Comment on github.com/chatmcp/mcpso/issues/1 ("Submit Your MCP Servers here") or site "Submit" button | Largest catalog (~20k). Low standout for one entry. NOT a no-auth API. |
| **Glama.ai** | glama.ai/mcp/servers | Free (paid hosting upsell) | **Yes** | YOU | "Add Server" button — paste public GitHub repo URL; Glama crawls + indexes tools/schemas | ~49k servers, enterprise-leaning, favors well-documented production servers. Needs real tool defs in the repo to index. |
| **PulseMCP** | pulsemcp.com/servers | Free | **Yes** | YOU (form) or auto-ingest | Preferred: publish to Official Registry (auto-ingested daily). Direct: pulsemcp.com/submit | Daily-updated, reputable, named backer of Official Registry. The app itself does NOT qualify — only the server. |
| **mcpservers.org** | mcpservers.org | Free ($39 premium upsell) | **Yes** | YOU (web form) | mcpservers.org/submit (NOT a PR — wong2/awesome-mcp-servers README says "we do not accept PRs") | ~450 servers, real SEO value. $39 "Premium" = faster review + dofollow; skippable. |
| **punkpeye/awesome-mcp-servers** | github.com/punkpeye/awesome-mcp-servers | Free | **Yes** | **AGENT GitHub PR** | PR to README.md, alphabetical in "Education" category: `- [owner/repo](url) 📇 🏠 - "desc"` | Canonical list (~90k stars). Easy to get in but enormous/spammy → weak quality signal alone. Best agent-PR-able MCP venue. |
| **Cline MCP Marketplace** | cline.bot/mcp-marketplace | Free | **Yes** | AGENT via GitHub issue | "[Server Submission]" issue template at github.com/cline/mcp-marketplace; needs repo URL + 400×400 PNG logo + tested auto-install | Top VS Code AI agent, one-click install, audience overlaps learners strongly. It's an ISSUE, not a PR (spec was wrong). |
| **Docker MCP Catalog** | hub.docker.com/mcp | Free | **Yes** | **AGENT GitHub PR** | PR to docker/mcp-registry adding `servers/<name>/server.yaml` via `task wizard`/`task remote-wizard` | High-trust (signed images, SBOMs) but smaller reach; audience = enterprise/devs, weak fit for learners. |
| **VS Code MCP gallery** | code.visualstudio.com/docs/agent-customization/mcp-servers | Free | **Yes** | YOU (indirect) | Don't submit to VS Code — publish to Official Registry; propagates to api.mcp.github.com → VS Code `@mcp` gallery automatically | Huge VS Code + Copilot audience, one-click install. Spec's "no-auth API" is WRONG — same CLI flow as Official Registry. |
| **Cursor MCP directory** | cursor.directory/mcp | Free | **Yes** (for /mcp) | YOU (OAuth form) | cursor.directory/plugins/new → sign in → paste repo with `.mcp.json` | Community/unofficial (official is cursor.com/marketplace). Weak audience fit (IDE devs, not learners). **Could list a rules pack now without MCP.** |
| **Claude Connectors Directory** | claude.com/docs/connectors/building/submission | Free | **Yes** | YOU (portal/form, reviewed) | Remote: claude.ai admin portal (**needs Team/Enterprise org**). Solo path: desktop-extension (.mcpb) interest form, no org req | **Highest-trust Claude-native venue.** Hard bar: production hosting, tool annotations, privacy policy, test account. Long-term goal. |
| ~~**mcp-get (CLI registry)**~~ | ~~mcp-get.com~~ | — | — | — | — | **DEAD — DROP.** Repo archived 2026-06-17, read-only, redirects to Smithery. PRs disabled. |

---

## Category 2 — AI-tool directories (no MCP server needed; do these now, free tiers only)

These list the **app** as an AI tool. They drive human + LLM-search discovery (heavily scraped by ChatGPT/Perplexity). None need the MCP server. Watch for pay-to-play.

| Venue | URL | Free? | Needs MCP server? | Who posts | How to submit | Notes |
|---|---|---|---|---|---|---|
| **Future Tools** | futuretools.io/submit-a-tool | Free | No | YOU (web form) | Form: name, URL, Category=Education, Pricing=Open Source | Matt Wolfe's curated DB, big newsletter/YouTube. **75%+ rejected**, no reply. Emphasize the AI-tutor angle. Worth one shot. |
| **Toolify.ai** | toolify.ai/submit | Free ($99 express upsell) | No | YOU (web form; 403s bots) | Form: site URL, logo, screenshots, category, tags | ~2M visits/mo, heavily LLM-scraped. Free tier real (2–4wk queue). Paid only buys speed, not rank. Generic index → medium fit. |
| **Product Hunt** | producthunt.com | Free ($99/yr multi-launch upsell) | No | YOU (manual, human) | producthunt.com/launch → New Product → URL + tagline + 3 screenshots; schedule day | **One-shot launch event**, not evergreen. Real contributor/dev/press audience, DR 90+. Needs prep. No upvote-asking. |
| **There's An AI For That** | theresanaiforthat.com/launch | **Pay-to-play** ($49 / $347) | No | YOU | Paid form; only free path is a monthly X-thread lottery (1 tool picked) | **Label pay-to-play.** Huge reach + LLM citations, but no dependable free listing. Pursue only with budget, or play the lottery. |
| ~~**Futurepedia**~~ | ~~futurepedia.io/submit-tool~~ | **Pay-to-play** ($497) | No | YOU | Basic $247 SOLD OUT; Verified $497, nofollow link | **DROP.** No free path anymore. $497 for a nofollow link in a generic index, app is off-genre. Skip. |
| **AI Scout** | aiscout.net | Unknown | No | YOU | Web form | Low authority, unverified terms. Skip unless trivially free. |
| **aitools.fyi** | aitools.fyi | Unknown | No | YOU | Web form | Low authority, unverified terms. Skip unless trivially free. |

---

## Category 3 — "AI agents" directories & networks (mostly NOVELTY / low-ROI — be skeptical)

These market themselves as agent marketplaces/networks. For a free learn-to-code app the value is low: audiences are humans browsing agents to deploy, or (worse) agents talking to agents. **None require the MCP server, but none are worth real effort.**

| Venue | URL | Free? | Needs MCP server? | Who posts | How to submit | Notes |
|---|---|---|---|---|---|---|
| **agent.ai** | agent.ai | Free (consume-side paid) | No | YOU (build an agent) | Must AUTHOR a no-code agent in their builder that wraps libre's API — real work, different artifact | HubSpot-founder-backed, ~1.3M users, but audience skews marketing/sales/CX. Not a "submit your app" directory. Medium-low fit. |
| **AI Agents Directory** | aiagentsdirectory.com/submit-agent | Free (badge-gated) (paid upsells) | No | YOU (web form) | Free tier requires placing their AAD badge + backlink; nofollow | One of many near-identical clones. Free = badge reciprocity. **Do NOT pay.** Low ROI. |
| **AI Agent Store** | aiagentstore.ai | Free (upsell) | No | YOU | Web form | Crowded clone. Low value. Skip. |
| **AI Agents List** | aiagentslist.io | Free | No | YOU | Web form, "Founder Verified" badge | Less pay-to-play than peers, but still low traffic. Optional. |
| ~~**Chirper.ai**~~ | ~~chirper.ai~~ | — | — | — | — | **NOVELTY — DROP.** AI-only social network where humans can't post; agents chirp at each other. Research curiosity, zero distribution value. |
| ~~**Salesforce AgentExchange / Google Agentspace / MS / AWS agent marketplaces**~~ | ~~appexchange.salesforce.com~~ | Unknown | No | Invite/vendor | Enterprise vendor onboarding | **DROP for this project.** Enterprise procurement audience, not individual learners. Massive overhead, wrong audience. |

---

## Category 4 — OSS contributor-recruitment channels (recruit AGENTS+humans to build the repo)

These don't list the app to users — they surface your **good-first-issue-labeled GitHub issues** to people (and coding agents) looking to contribute. **Prerequisite: a public repo with real beginner-labeled issues + CONTRIBUTING.md + maintainer willing to mentor.** No MCP server needed.

| Venue | URL | Free? | Needs MCP server? | Who posts | How to submit | Notes |
|---|---|---|---|---|---|---|
| **Up For Grabs** | up-for-grabs.net | Free | No | **AGENT GitHub PR** | PR adding `_data/projects/libre.academy.yml` (name/desc/site/tags/upforgrabs link to label) | 10+ yr curated, actively merged. Validates the upforgrabs label link → repo MUST have real beginner issues. Best agent-PR-able contributor venue. |
| **First Contributions** | firstcontributions.github.io | Free | No | **AGENT GitHub PR** | PR appending object to `src/data/projects.js` (`name`, `imageSrc`, `projectLink`, `description`, `loadIssues:true`, `tags`) — branch `main`, Astro repo | ~55k stars. Slow/intermittent merges. Only fits as a beginner-contributable project. (Old `listOfProjects.js`/`source` branch path is stale.) |
| **CodeTriage** | codetriage.com | Free | No | YOU (GitHub login) | Sign in → codetriage.com/repos/new → add repo | Emails subscribers a daily open issue to drive triage/PRs. Marginal until repo has open issues. |
| **Good First Issue (DeepSource)** | goodfirstissue.dev | Free | No | YOU (Google Form) | Form → manual review | **Hard gate: ≥10 contributors + ≥3 beginner issues + CONTRIBUTING.md.** A solo/early project will be rejected. Revisit later. |
| ~~**goodfirstissues.com**~~ | ~~goodfirstissues.com~~ | Free | No | — (auto-crawl) | No submission — auto-surfaces "good first issue"-labeled issues only | **DROP — nothing to do.** Auto-crawler, no listing. Issues appear automatically if labeled. |
| **Open Source Friday** | opensourcefriday.com | Free | No | YOU (GitHub issue) | Issue using template | GitHub maintainer-spotlight program. Low priority. |
| **For Good First Issue** | forgoodfirstissue.github.com | Free | No | YOU (issue) | Issue submit | UN-SDG / Digital Public Goods only. Off-theme unless libre positions as social-impact. Low. |

> **GitHub Copilot coding agent** (assign issue → @copilot opens a PR): **DROP as a *venue*.** It's a tool you enable on your *own* paid-Copilot repo — zero discovery/distribution. Useful in the maintainer's dev workflow, not a listing surface. Effectively pay-to-play (Pro $10/mo+).

---

## Category 5 — Communities & launch surfaces (human, manual, no bots)

High-quality reach, but all manual (these communities ban/penalize automated self-promo). Lead with genuine participation.

| Venue | URL | Free? | Needs MCP server? | Who posts | How to submit | Notes |
|---|---|---|---|---|---|---|
| **Hacker News — Show HN** | news.ycombinator.com/showhn.html | Free | No | YOU (human only) | "Show HN: Libre.academy – free OSS learn-to-code app"; URL = the actual app (not a landing page); post first comment | **Top-tier launch.** Precedent: C0D3, futurecoder, "Decomp Academy." One-shot; warm up account first. App qualifies as-is. |
| **r/mcp** | reddit.com/r/mcp | Free | **Yes** | YOU (human) | Self-post after server ships; check sidebar for showcase thread | On-topic MCP hub. **Only post AFTER the server exists** — premature posts get removed. |
| **Latent Space Discord** | discord.gg/xJJMRaWCRt | Free | No | YOU (human) | Join → intro channel → share in projects/learning channel after engaging | Dense AI-engineer community. Ephemeral (no persistent listing). High-effort, high-quality audience. |
| **AI Tinkerers** | aitinkerers.org | Free | No | YOU (human) | Apply for a ~5-min live demo at a city/online meetup | World's largest AI builder meetups. Demo-first, screened. Event/visibility play, not a backlink. |
| ~~**MCP community Discord / GitHub Discussions**~~ | ~~modelcontextprotocol.io/community/communication~~ | Free | **Yes** | — | No submit; contributor/spec chat only | **DROP.** Vendor-neutral contributor space; product/app promotion explicitly discouraged. Wrong venue type. |

---

## Highest-value play: ship an MCP server

This is the move. A small MCP server flips libre.academy from "a website a human visits" into **a tool that any MCP client (Claude Desktop, Cursor, Cline, VS Code Copilot) can call to teach and grade** — and it unlocks the entire Category 1 table, much of which is agent-PR-able or one-CLI-command to list.

### What the server would expose (minimal viable toolset)
- `list_courses()` → catalog of courses/tracks (id, title, language, difficulty).
- `get_lesson(course_id, lesson_id)` → lesson content + the exercise prompt + starter code.
- `run_exercise(lesson_id, code)` / `check_solution(lesson_id, code)` → run the user's code in libre's existing JS/TS sandbox + validators and return pass/fail + feedback. (libre already has validators and a sandbox — this is the load-bearing tool; it's what makes the server *useful*, not just a content reader.)
- *(optional)* `get_hint(lesson_id, attempt)`, `next_lesson(course_id, lesson_id)`, `search_courses(query)`.

Annotate every tool with `readOnlyHint`/`destructiveHint` (Claude Connectors directory rejects ~30% of submissions for missing annotations). Keep read and write tools separate.

### Rough effort
- **Small.** A stdio MCP server in TypeScript (`@modelcontextprotocol/sdk`) wrapping the existing catalog + validators is realistically 1–2 days for the four core tools, plus publishing.
- Two transport choices: **stdio + npm package** (easiest path to the registries; what most PR-able venues expect) and/or **Streamable-HTTP remote** (needed for Smithery hosting and the Claude remote-connector directory).
- Reuse the deterministic validators/sandbox already in the app — the server is a thin adapter, not new pedagogy.

### Where to list it once built (and how)
**Step 0 — publish the package** (npm `--access public`, with `"mcpName": "io.github.<user>/libre"`), then publish to the **Official MCP Registry** via `mcp-publisher`. That one listing auto-propagates to PulseMCP, VS Code's `@mcp` gallery, GitHub's MCP registry, and others.

| Registry | GitHub-PR-able? | Mechanism |
|---|---|---|
| Official MCP Registry | No (authed CLI; automatable via GH Actions OIDC) | `mcp-publisher publish` |
| **punkpeye/awesome-mcp-servers** | **Yes — PR** | One line in README "Education" category |
| **Docker MCP Catalog** | **Yes — PR** | `servers/<name>/server.yaml` via `task wizard` |
| **Up For Grabs** (contributor venue, but PR) | **Yes — PR** | `_data/projects/libre.academy.yml` |
| mcp.so | Agent via GitHub | Comment on chatmcp/mcpso#1 |
| Cline Marketplace | Agent via GitHub | `[Server Submission]` issue |
| Smithery | No — web/CLI OAuth | smithery.ai/new |
| Glama / PulseMCP / mcpservers.org / Cursor | No — web form | "Add Server" / submit form |
| VS Code gallery | No — auto from Official Registry | (free propagation) |
| Claude Connectors | No — portal/form, reviewed | Team org or .mcpb form |

---

## Do now (no MCP server required)

1. **Hacker News — Show HN** (human, one-shot, warm up account). Highest free signal.
2. **Product Hunt launch** (free, needs assets + a launch day).
3. **AI-tool directories, free tiers only:** Future Tools, Toolify.ai. (Skip TAAFT/Futurepedia unless you'll pay.)
4. **Label the repo** with `good first issue` / `up for grabs` and write a CONTRIBUTING.md — this unlocks the contributor channels and costs nothing.
5. **Up For Grabs** + **First Contributions** (both agent-PR-able) once labels exist.
6. **CodeTriage** once the repo has open issues.
7. *(Optional, low ROI)* AI Agents List (no badge), agent.ai if you want to author a wrapper agent.

## Requires the MCP server first

1. **Official MCP Registry** (do this first after building — it fans out everywhere).
2. **punkpeye/awesome-mcp-servers** (agent PR), **Docker MCP Catalog** (agent PR).
3. **mcp.so**, **Cline Marketplace** (agent via GitHub issue).
4. **Smithery**, **Glama**, **PulseMCP**, **mcpservers.org**, **Cursor**, **VS Code gallery**.
5. **r/mcp** launch post (only after it's installable).
6. **Claude Connectors Directory** (long-term; needs hardening + Team org or .mcpb).

## Red lines (honest)

- **Don't pay AI directories.** Futurepedia ($497 nofollow) and TAAFT ($49–$347) are not worth it for a free OSS app off-genre in a generic index. Money is better spent shipping the server.
- **Skip novelty agent-social gimmicks.** Chirper.ai (agents chirping at agents) and the swarm of near-identical "AI agents directory" clones are SEO noise; never place a reciprocal promo badge on libre.academy for a nofollow backlink.
- **Don't pay-to-play to skip review queues** (Toolify $99, mcpservers $39, AAD $19–$99). Free tiers are sufficient.
- **No automated self-promo where it's banned** — HN, r/mcp, Latent Space, AI Tinkerers all penalize bot posting. These are human-only.
- **Don't submit the server before it's real.** Every MCP registry validates the package/repo; a "proposed" server gets rejected and burns goodwill.
- **Don't submit to contributor lists you don't qualify for** (Good First Issue needs ≥10 contributors) — rejection wastes everyone's time.
- **mcp-get is dead** (archived 2026-06-17) — don't waste a PR on it.