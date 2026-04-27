import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// fishbones.academy — Vite config.
//
// We do nothing fancy here. The site is a small SPA; React Router handles
// routing client-side, and the embedded learn app at /learn/ is a static
// dist-web/ tree that we copy into public/learn/ via scripts/sync-learn.mjs.
// The Caddy block on the production VPS rewrites /learn/* deep paths back
// to /learn/index.html so the embed's own router survives a refresh.
export default defineConfig({
  plugins: [react()],
});
