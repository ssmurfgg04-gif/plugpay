import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: no R2 incremental-cache bucket is provisioned for this
// worker, so the default (per-isolate) cache is used. Add an
// r2IncrementalCache bucket here if shared ISR caching is ever needed.
//
// buildCommand is pinned at the top level to npm: the repo ships a stale
// bun.lock, which makes the auto-detector pick `bun run build` — fine on
// machines with bun, but GitHub Actions (and most environments) only have
// npm/node. Spreading keeps defineCloudflareConfig's keys intact while
// adding the override the aws build layer reads.
export default {
  ...defineCloudflareConfig({}),
  buildCommand: "npm run build",
};
