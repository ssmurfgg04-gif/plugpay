import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: no R2 incremental-cache bucket is provisioned for this
// worker, so the default (per-isolate) cache is used. Add an
// r2IncrementalCache bucket here if shared ISR caching is ever needed.
//
// buildCommand is pinned to npm for determinism: the repo also ships a
// bun.lock, which would otherwise make the auto-detector prefer bun's script
// runner. Both work; CI builds with `npm run build`, so mirror that.
export default defineCloudflareConfig({
  buildCommand: "npm run build",
} as Parameters<typeof defineCloudflareConfig>[0]);
