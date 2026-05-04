import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// fishbones.academy — Vite config.
//
// Two non-trivial things happening here:
//
//   1. **Aliases reach into the app source.** The marketing
//      spotlights mount the actual React components from
//      `Apps/Fishbones/src/components/...` (Trees, ChainDock,
//      BookCover) so the homepage shows the real product UI, not
//      a copy. We expose two aliases for that:
//        - `@base/*`  → user's design system (already a dep here)
//        - `@app/*`   → `../../Apps/Fishbones/src/*`
//
//   2. **Tauri imports get the same web stubs the app uses.** The
//      app's own web build (FISHBONES_TARGET=web) aliases every
//      `@tauri-apps/*` import to a local stub. We point at THE
//      SAME stub files so any app component we mount on the
//      marketing site gets the same resolution behaviour. Without
//      this Rollup trips on `Resource`, `invoke`, etc. that the
//      app's components transitively import.

const APP_ROOT = resolve(__dirname, "../../Apps/Fishbones");
const APP_SRC = resolve(APP_ROOT, "src");
const TAURI_STUB_DIR = resolve(APP_SRC, "lib/tauri-stubs");

// Same alias map the app's web build uses. We DON'T mirror the
// whole list — only the modules that any spotlight component we
// mount can transitively reach for. New mounts may need new
// entries; the stub-not-found error is loud and obvious.
const tauriAliases = {
  "@tauri-apps/api/core": resolve(TAURI_STUB_DIR, "core.ts"),
  "@tauri-apps/api/event": resolve(TAURI_STUB_DIR, "event.ts"),
  "@tauri-apps/api/webviewWindow": resolve(TAURI_STUB_DIR, "webviewWindow.ts"),
  "@tauri-apps/plugin-dialog": resolve(TAURI_STUB_DIR, "plugin-dialog.ts"),
  "@tauri-apps/plugin-deep-link": resolve(TAURI_STUB_DIR, "plugin-deep-link.ts"),
  "@tauri-apps/plugin-opener": resolve(TAURI_STUB_DIR, "plugin-opener.ts"),
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Design-system shorthand — same path the app uses.
      "@base": resolve(__dirname, "node_modules/@mattmattmattmatt/base"),
      // App-source shorthand for marketing spotlight wrappers that
      // import real product components.
      "@app": APP_SRC,
      // Force the alias to resolve into THIS site's React copy.
      // Without this an `import { useState } from "react"` inside
      // an aliased app file resolves to `Apps/Fishbones/node_modules/
      // react` (closest node_modules walking up from the file's
      // location). At runtime the marketing bundle then has TWO
      // React instances loaded — useState() from the app's copy
      // can't find the dispatcher the marketing copy registered,
      // and you get `null is not an object (evaluating
      // 'c.H.useState')` the moment any aliased component mounts.
      // Pinning these aliases to the marketing-site node_modules
      // forces a single instance.
      react: resolve(__dirname, "node_modules/react"),
      "react-dom": resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": resolve(__dirname, "node_modules/react/jsx-runtime"),
      ...tauriAliases,
    },
    // Belt-and-braces dedupe in case any nested import bypasses
    // the alias above (e.g. an internal `react/jsx-dev-runtime`
    // path Vite's react plugin injects). dedupe makes Vite collapse
    // every package by name to a single resolved id.
    dedupe: ["react", "react-dom"],
  },
  // Allow Vite to read files outside the marketing site's root
  // (the app's src/). Without this Vite refuses to serve any path
  // it considers "outside the project" during dev.
  server: {
    fs: {
      allow: [resolve(__dirname, ".."), APP_ROOT],
    },
  },
});
