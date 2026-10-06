#!/usr/bin/env python3
"""Apply a SQL file to the Supabase project via the Management API."""
import json
import sys
import urllib.request

REF = "xycmzhpkuzyhmgucwqys"
# Personal access token comes from the environment; never hardcode it here.
import os

TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
if not TOKEN:
    sys.exit("Set SUPABASE_ACCESS_TOKEN in the environment first.")


def run_sql(sql: str) -> None:
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{REF}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode()
            print(f"  status {resp.status}")
            if body.strip() and body.strip() != "[]":
                print("  " + body[:500])
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.status}: {e.read().decode()[:800]}")
        sys.exit(1)


if __name__ == "__main__":
    for path in sys.argv[1:]:
        print(f"applying {path}")
        run_sql(open(path, encoding="utf-8").read())
    print("done")
