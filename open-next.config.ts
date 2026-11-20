import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig({}),
  external: ["sharp"],
  buildCommand: "npm run build",
};
