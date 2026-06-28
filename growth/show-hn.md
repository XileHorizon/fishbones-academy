# Show HN draft

Hacker News rewards specificity, technical honesty, and modesty. No marketing
language, no superlatives, no emoji. State what it is, what's interesting about how
it's built, and what's not done yet. The audience here disproportionately
recommends tools to learners, and a thread produces a durable, frequently-cited URL.

**Honest expectation:** HN is a single, unpredictable shot. A flat launch is normal
and not a failure. The lasting value is the URL and any substantive discussion, not
the points.

---

## Title options (pick one — keep it factual)

Primary:

> **Show HN: Libre Academy – Open-source interactive coding courses, runs in the browser**

Alternates:

> Show HN: Libre Academy – Learn to code by writing code, 26 languages, MIT-licensed

> Show HN: Libre Academy – Free, open-source Codecademy alternative (Python/Rust/Go in-browser)

Keep it under ~80 chars, lead with "Show HN:", name the project, and say the one
true hook. Avoid hype words ("amazing", "revolutionary").

---

## Body draft

> Libre Academy is a free, open-source platform for learning to code by actually
> writing code. Each lesson is short prose plus an exercise: you write real code in
> an in-browser Monaco editor and hidden tests grade it immediately. You get XP and
> streaks for momentum. There's no paywall and no sign-up to use it in the browser.
>
> What might interest this crowd:
>
> - **It runs real toolchains in the browser.** JavaScript and TypeScript run in a
>   sandboxed worker; Python runs fully client-side via Pyodide (WASM); Rust and Go
>   and several web frameworks also run in-browser. Progress is stored locally in
>   IndexedDB — no account, no telemetry.
> - **A desktop app** (macOS/Windows/Linux, Tauri) adds native runners for the
>   compiled languages that can't run in a browser sandbox — C, C++, Java, Kotlin,
>   C#, Swift, Assembly — plus an optional local AI tutor through Ollama.
> - **Bring-your-own-book ingest.** The desktop app can take a technical PDF or
>   EPUB and turn it into an interactive, auto-graded course. This is the feature
>   I'd most like feedback on.
> - **Fully open source, MIT** — the website, the desktop app, and the optional
>   cloud-sync server. Cloud sync is free but entirely optional and off by default.
>
> Right now it's 94 courses across 26 languages. The grading is "hidden tests
> against your code" rather than diffing against a reference solution, which keeps
> exercises flexible but means the test design matters a lot — happy to talk about
> how that's structured.
>
> Try it without installing anything: https://libre.academy/learn/
> Source: https://github.com/InfamousVague/Libre.academy
>
> Honest about the gaps: it's a solo/small project, some courses are more polished
> than others, and a few of the in-browser language runtimes are newer than others.
> Feedback on the editor, the grading model, and the book-ingest feature is exactly
> what I'm after.

> First comment (post immediately after submitting, from the same account):
> a short note on the trickiest technical bit — e.g. how Python/Rust/Go run
> client-side, or how book ingest converts a chapter into gradeable exercises.
> This seeds the technical discussion HN responds to.

---

## Launch checklist

- [ ] Post from a **real, established account** (the maintainer's). No new throwaway.
- [ ] Submit the **bare URL form** with the "Show HN:" title; put the description in
      the **text/body**, not the URL field (Show HN convention).
- [ ] Link **`/learn/`** (the live app) so people can try it in one click — not a
      download page.
- [ ] Post during a higher-traffic US window (roughly 13:00–17:00 UTC, weekday)
      for visibility, but don't over-optimize.
- [ ] Have the **first comment** ready (technical detail, see above) and post it
      within a minute or two.
- [ ] Be **present for 2–4 hours** to answer questions promptly and substantively.
      Engagement quality matters more than the title.
- [ ] **Do not ask anyone to upvote.** No DMs, no Slack/Discord rallies, no rings —
      HN detects voting rings and will penalize the post and the account. This is a
      hard red line.
- [ ] Reply to criticism plainly and without defensiveness; concede real gaps. HN
      respects builders who do.
- [ ] Afterward, **save the thread URL** — it's a durable, citable reference
      regardless of how the launch ranks.

---

## Anticipated questions (have honest answers ready)

**"How is this different from freeCodeCamp / Codecademy / Exercism / Scrimba?"**
> It's open source end-to-end (MIT) and local-first — your work stays in your
> browser with no account and no telemetry, sync is optional. It's built around
> active recall (you write and run real code, graded by hidden tests) rather than
> video. And the desktop app can turn your own PDF/EPUB into an interactive course,
> which I haven't seen elsewhere.

**"What's the business model? What's the catch?"**
> There isn't a paywall. It's a free, open-source project — site, desktop app, and
> sync server are all MIT-licensed. Cloud sync is free and optional. The honest
> catch is it's small, so polish varies by course.

**"How does in-browser execution actually work? Is it sandboxed?"**
> JS/TS run in a sandboxed Web Worker (console-only, time-capped). Python runs in
> Pyodide (CPython compiled to WASM) entirely client-side. Rust/Go and the web
> frameworks also run client-side. The compiled languages that can't be sandboxed
> in a browser (C/C++/Java/Kotlin/C#/Swift/Assembly) are desktop-only, where they
> use real local toolchains.

**"How does grading work — does it diff against a solution?"**
> No reference-diff. Each exercise ships hidden tests that run against your code,
> so there are many valid solutions. The tradeoff is that test design carries the
> weight, which is why exercises are validated before they ship.

**"Does my code/data leave my machine?"**
> In the browser, no — progress lives in IndexedDB and there's no telemetry. Cloud
> sync is opt-in and off by default; the sync server is open source too if you'd
> rather self-host.

**"Can I contribute / add a course / fix a course?"**
> Yes — it's on GitHub, MIT-licensed. (Point to the repo and its CONTRIBUTING.)

**"Why Tauri / why a desktop app at all?"**
> Browsers can't run native toolchains for compiled languages, and the
> bring-your-own-book ingest and local Ollama tutor want native filesystem/process
> access. The browser version covers everything that can run in a sandbox.
