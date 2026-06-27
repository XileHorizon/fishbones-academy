---
title: "Bring Your Own Book: Turning Any PDF Into a Course"
date: "2026-06-20"
author: "The Libre Team"
excerpt: "The desktop app's ingest pipeline turns PDFs, EPUBs, and docs sites into interactive courses with hidden tests. Here's how it works under the hood."
color: teal
tags: [features, ingest, AI]
---

## The problem with fixed course catalogs

Every learning platform has a catalog. Ours does too. But the best technical books in your field? They almost certainly aren't in anyone's catalog.

*The Rust Programming Language.* Crafting Interpreters. Structure and Interpretation of Computer Programs. Category Theory for Programmers. These are the texts that actually change how people write code — and they exist outside any platform's walled garden.

We wanted Libre Academy to work with them.

## How the ingest pipeline works

The desktop app ships a Claude-powered pipeline that does four things:

1. **Structures the book** — chunks chapters, builds a lesson hierarchy, identifies the conceptual arc
2. **Drafts exercises** — for each concept, generates starter code, a worked solution, and hidden tests
3. **Validates everything** — actually runs the generated exercises to verify they pass before adding them to the course
4. **Packages it** — bundles the result as a `.academy` archive you can share with anyone

The validation step is the part we're proudest of. A lot of AI-generated code is syntactically plausible but logically wrong. Running every exercise before it ships means failed generations demote to reading lessons rather than silently landing in your library as broken exercises.

## What you can ingest

- **PDF + EPUB** — the most common format for technical books
- **Docs sites** — the crawler can turn any HTML reference documentation into a course
- **Custom** — if you've got markdown chapters or a GitHub repo, the pipeline can handle that too

## Sharing courses

The `.academy` file format is self-contained. Everything the course needs — lesson content, starter code, hidden tests, metadata — ships in one file. Anyone with Libre installed can open it in one click. No account, no server, no CDN.

This is how we think community course-sharing should work: offline-first, portable, not dependent on our infrastructure staying up.

## Try it

If you have the desktop app, head to **Library → Import** and drop in any PDF. The pipeline runs locally — your book's content stays on your machine.
