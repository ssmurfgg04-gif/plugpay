#!/usr/bin/env python3
"""Netlify site diagnostics: dump site config and hunt for the setting that
controls the /.netlify/scripts/hud HTML injection breaking React hydration.

Uses NETLIFY_AUTH_TOKEN + NETLIFY_SITE_ID from the environment (never printed).
"""
import json
import os
import sys
import urllib.request

TOKEN = os.environ.get("NETLIFY_AUTH_TOKEN", "")
SITE = os.environ.get("NETLIFY_SITE_ID", "")
if not TOKEN or not SITE:
    print("missing NETLIFY_AUTH_TOKEN / NETLIFY_SITE_ID")
    sys.exit(1)

API = "https://api.netlify.com/api/v1"
SECRET_HINTS = ("token", "secret", "key", "password")


def get(path):
    req = urllib.request.Request(f"{API}{path}", headers={"Authorization": f"Bearer {TOKEN}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def scrub(o):
    if isinstance(o, dict):
        return {k: ("***" if any(h in k.lower() for h in SECRET_HINTS) else scrub(v)) for k, v in o.items()}
    if isinstance(o, list):
        return [scrub(x) for x in o]
    return o


site = get(f"/sites/{SITE}")

print("=== SITE: relevant keys ===")
for k in sorted(site.keys()):
    v = json.dumps(site[k])
    print(f"{k} = {v[:180]}")

print("\n=== HUNTING HUD/INJECTION SETTINGS (deep scan) ===")


def walk(o, path=""):
    if isinstance(o, dict):
        for k, v in o.items():
            walk(v, f"{path}.{k}")
    elif isinstance(o, list):
        for i, v in enumerate(o):
            walk(v, f"{path}[{i}]")
    else:
        low = path.lower()
        if any(w in low for w in ("hud", "inject", "snippet", "post_process", "badge", "loop", "ai_", "feature", "flag")):
            print(f"{path} = {json.dumps(o)[:200]}")


walk(site)

print("\n=== BUILD SETTINGS ===")
print(json.dumps(scrub(site.get("build_settings", {})), indent=1)[:2000])

print("\n=== SNIPPETS (injected HTML) ===")
try:
    snips = get(f"/sites/{SITE}/snippets")
    print(json.dumps(scrub(snips), indent=1)[:3000])
except Exception as e:
    print("snippets endpoint:", e)

print("\nDONE")
