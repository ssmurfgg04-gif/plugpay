#!/usr/bin/env python3
"""Wipe e2e test accounts from the production PlugPay DB.

All test emails end with @plugpay.test (both suites use that domain).
Dependent rows (products, receipts, invoices, reviews, vouches, riders)
cascade from merchants. Idempotent — safe to re-run.
"""
import json
import urllib.parse
import urllib.request

BASE = "https://xycmzhpkuzyhmgucwqys.supabase.co/rest/v1"
KEY = None
for line in open("/home/z/my-project/plugpay/netlify.toml"):
    if line.strip().startswith("SUPABASE_SERVICE_ROLE_KEY"):
        KEY = line.split("=", 1)[1].strip().strip('"')
if not KEY:
    raise SystemExit("service key not found")

HDR = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}
TEST = urllib.parse.quote("@plugpay.test")


def req(method, table, query):
    url = f"{BASE}/{table}?{query}"
    r = urllib.request.Request(url, method=method, headers=HDR)
    with urllib.request.urlopen(r, timeout=30) as resp:
        body = resp.read().decode()
        return json.loads(body) if body else []


def count(table, query="select=*"):
    url = f"{BASE}/{table}?{query}"
    r = urllib.request.Request(url, method="GET", headers={**HDR, "Prefer": "count=exact", "Range": "0-0"})
    with urllib.request.urlopen(r, timeout=30) as resp:
        cr = resp.headers.get("content-range", "")
        return cr.split("/")[1] if "/" in cr else "?"


if __name__ == "__main__":
    like = f"email=like.*{TEST}"
    print("test users (app_users):", count("app_users", like))
    print("test merchants:", count("merchants", like))
    mers = req("GET", "merchants", f"{like}&select=slug,business_name")
    print("test merchants found:", [(m.get("slug"), m.get("business_name")) for m in mers])

    deleted_m = req("DELETE", "merchants", like)
    print("deleted merchants (dependents cascade):", len(deleted_m))
    deleted_u = req("DELETE", "app_users", like)
    print("deleted app_users:", len(deleted_u))

    print("remaining test users:", count("app_users", like))
    print("remaining test merchants:", count("merchants", like))
    print("total app_users now:", count("app_users"))
    print("total merchants now:", count("merchants"))
