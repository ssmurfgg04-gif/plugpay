// Build-time env baker (Cloudflare Workers deploy / local dev).
//
// Host build env (GitHub Actions env for the Cloudflare Workers deploy) is
// available during the build but NOT at runtime. This prebuild step writes the server-only
// values (Supabase service key, session secret) into a generated module that
// the Next.js bundler then ships inside the server functions.
//
// The committed src/lib/env.gen.ts is a PLACEHOLDER with empty strings.
// Real values never live in source files — only here, transiently, from the
// build environment. Local development uses .env.local instead (gitignored).
//
// Secrets never live in the repo: they come from GitHub Actions secrets or
// a developer's .env.local. The Cloudflare deploy workflow bakes them into
// the worker bundle; rotating = update the secret and re-push.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, '..', 'src', 'lib', 'env.gen.ts');

function esc(v) {
  return String(v ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Keep any value already present in the placeholder unless the build env
// provides one (build env wins). Absent values bake as empty strings → the
// app falls back to bundled seed data rather than failing the build.
let current = { url: '', service: '', session: '' };
if (existsSync(target)) {
  try {
    const src = readFileSync(target, 'utf8');
    const grab = (name) => {
      const m = src.match(new RegExp(name + ":\\s*'([^']*)'"));
      return m ? m[1] : '';
    };
    current = { url: grab('GEN_SUPABASE_URL'), service: grab('GEN_SUPABASE_SERVICE_KEY'), session: grab('GEN_SESSION_SECRET') };
  } catch {
    /* keep empty defaults */
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || current.url;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || current.service;
const session = process.env.SESSION_SECRET || current.session;

const out = `// GENERATED at build time by scripts/gen-env.mjs — do not edit by hand.
// The committed version contains empty placeholders. Real values are injected
// from the build environment (GitHub Actions env / .env.local) and
// only ever exist inside the server bundle, never in client code.
export const GEN_SUPABASE_URL = '${esc(url)}';
export const GEN_SUPABASE_SERVICE_KEY = '${esc(service)}';
export const GEN_SESSION_SECRET = '${esc(session)}';
`;

writeFileSync(target, out);
const baked = [url, service, session].filter(Boolean).length;
console.log(`[gen-env] env.gen.ts written (${baked}/3 values present in build env)`);
