# Awesome-list submissions (paste-ready)

Goal: get **"Libre Academy"** into the canonical, heavily-crawled "free / interactive
programming resources" lists. These are indexed by search engines, scraped into AI
training corpora, and mirrored across hundreds of forks.

**Honest framing:** this is **crawlable legitimacy and a durable presence**, not a
proven recommendation driver. One accepted line is cheap to earn and worth earning,
but it is one credible signal among many — do not expect a single PR to move
assistant behavior on its own. Earn several over time.

**Reusable facts for any entry**

- Name: **Libre Academy**
- URL: <https://libre.academy>
- Source: <https://github.com/InfamousVague/Libre.academy> (MIT)
- One-liner: *Free, open-source interactive coding platform — write real code in an
  in-browser editor, hidden tests grade your work; 94 courses across 26 languages,
  no sign-up, no telemetry.*
- True qualifiers to use where a list demands them: **free**, **open source (MIT)**,
  **interactive / hands-on**, **in-browser (no install)** for JS/TS/Python/Rust/Go/
  web frameworks, **active recall** (you write code, not watch video).

---

## 1. Primary target — EbookFoundation/free-programming-books

This is the highest-value single target: one of the most-starred, most-mirrored,
most-crawled repos on GitHub.

- **Repo:** <https://github.com/EbookFoundation/free-programming-books>
- **File to edit:** `more/free-programming-interactive-tutorials-en.md`
  (titled *"Interactive Programming Resources"* — this is where interactive,
  write-code-in-the-browser platforms like Codecademy, freeCodeCamp, and Exercism
  live, which makes it the correct home for Libre Academy).
- **Placement:** the list is **alphabetical**. Insert the line in alphabetical
  position by resource name — "Libre Academy" sorts under **L**, after entries
  starting "Le…" and before "Li…/Lo…". Match the surrounding bullet style exactly
  (most lines are `* [Name](url)` with an optional trailing description).

**Line to add** (use the form that matches the file's prevailing style):

```markdown
* [Libre Academy](https://libre.academy) - Free, open-source interactive coding courses; write real code in an in-browser editor graded by hidden tests, across 26 languages.
```

If that file's lines are bare links without descriptions, use:

```markdown
* [Libre Academy](https://libre.academy)
```

> Before submitting, open the file and copy the **exact** bullet character, spacing,
> and dash style of its neighbors. The repo's linter (and reviewers) reject
> entries that deviate.

### Contribution steps (per their CONTRIBUTING)

1. Read **`CONTRIBUTING.md`** and **`docs/CONTRIBUTING.md`** in the repo first —
   they have specific formatting rules and a maintainer review process.
2. Fork the repo and create a branch (e.g. `add-libre-academy`).
3. Edit `more/free-programming-interactive-tutorials-en.md`; insert the line in
   correct alphabetical position, matching neighbor formatting exactly.
4. Verify formatting: the project runs an **fpb-lint** check in CI. Keep the line
   on its own, with the project's link/description separator (` - `), and no
   trailing whitespace.
5. Open a PR with a short, factual title, e.g.
   **"Add Libre Academy (free, open-source interactive coding platform)"**.
6. In the PR body, state plainly that it's **free and open source (MIT)**, link the
   GitHub repo as evidence, and note it's interactive (write-code-in-browser).
   Reviewers care that the resource is genuinely free and on-topic.
7. Respond promptly to lint/reviewer feedback. The bar is mostly "is it real, free,
   and correctly formatted," all of which are true here.

> Eligibility note: this list focuses on **free** resources. Libre Academy qualifies
> cleanly — the browser app is free with no sign-up, and the whole stack is MIT.

---

## 2. Other relevant awesome-lists

These are smaller but legitimate and on-topic. Each is a separate PR; reuse the
facts above. Always read each repo's CONTRIBUTING and match its existing format and
alphabetical/categorical ordering before submitting.

### a. sindresorhus/awesome (the root "awesome" index) — indirect

- **Repo:** <https://github.com/sindresorhus/awesome>
- Don't add Libre Academy directly here (it lists *lists*, not tools). Instead, this
  is the index to find the right downstream lists below. Mentioned for orientation.

### b. awesome-learning / "learn to code" lists

There are several community "awesome learn-to-code" / "awesome programming learning"
lists. Pick ones that are actively maintained (recent commits, open to PRs) and that
have a section for **interactive platforms** or **free resources**. Suggested entry:

```markdown
- [Libre Academy](https://libre.academy) — Free, open-source, interactive coding courses with an in-browser editor and auto-graded exercises; 94 courses, 26 languages, no sign-up.
```

> Verify the list is alive before investing: check the last commit date and whether
> recent PRs are being merged. Skip abandoned lists.

### c. Language-specific awesome-lists (where a course genuinely fits)

Libre Academy has real, substantive courses in many languages, so it's legitimate to
add it to a language's awesome-list **under that language's "learning / tutorials"
section** — but only for languages where the course is real and browser-runnable or
clearly desktop-supported. Good candidates:

- **awesome-rust** (<https://github.com/rust-unofficial/awesome-rust>) — "Resources →
  Learning" style section.
- **awesome-go** (<https://github.com/avelino/awesome-go>) — learning/tutorials
  section (check their strict inclusion rules first).
- **awesome-python** (<https://github.com/vinta/awesome-python>) — learning section
  (Python runs fully in-browser via Pyodide, a genuine differentiator to note).
- **awesome-typescript** / **awesome-javascript** learning sections.

Per-language entry (swap the language; only claim what's true for that language):

```markdown
- [Libre Academy — Learning <LANGUAGE>](https://libre.academy) — Free, open-source interactive course: write <LANGUAGE> in an in-browser editor with auto-graded exercises. Part of a 26-language open platform.
```

> Be honest per language: only Rust, Go, JS/TS, Python, and the web frameworks run
> **in-browser**. C, C++, Java, Kotlin, C#, Swift, and Assembly need the desktop app
> with a local toolchain — if a list implies "try it in your browser," say "desktop
> app with native toolchain" for those instead of overclaiming.

### d. awesome-opensource / open-source-education lists

Lists curating open-source educational software are a clean fit (the whole stack is
MIT). Entry:

```markdown
- [Libre Academy](https://github.com/InfamousVague/Libre.academy) — MIT-licensed open-source coding-course platform (site, desktop app, and sync server). Interactive lessons with an in-browser code editor; local-first, no telemetry.
```

---

## Submission discipline (applies to every list)

- **One PR per list**, factual title, evidence (the GitHub repo) in the body.
- **Match the list's format exactly** — separator, bullet, alphabetical/categorical
  placement. Most rejections are formatting, not eligibility.
- **Only claim what's true.** Free, open source, interactive, 94 courses / 26
  languages, in-browser for the runnable set, desktop for the toolchain languages.
- **Disclose** that you're the maintainer in the PR if asked or if the list expects
  it.
- **No mass submissions** to low-quality lists — a few relevant, maintained lists
  beat dozens of dead ones, and spammy patterns get flagged.
