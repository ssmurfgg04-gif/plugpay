#!/bin/bash
# End-to-end email + password auth flow test against a running PlugPay server.
# Verifies: register -> clean account, login, bad creds rejected, duplicates
# rejected, validation errors, logout, and that public APIs keep working.
set -u
BASE="${1:-http://localhost:3000}"
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL  $1"; }
check() { # $1 desc, $2 actual, $3 expected-substring
  if echo "$2" | grep -qi "$3"; then ok "$1"; else bad "$1 — got: $(echo "$2" | head -c 200)"; fi
}

STAMP=$(date +%s)
EMAIL="e2e.trader.${STAMP}@plugpay.test"
EMAIL2="e2e.agent.${STAMP}@plugpay.test"
PW="Sup3rSecret!pass"
JAR="$(mktemp)"; JAR2="$(mktemp)"
trap 'rm -f "$JAR" "$JAR2"' EXIT

echo "== 1. register validation =="
R=$(curl -s -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" -d '{"email":"notanemail","password":"short"}')
check "invalid email rejected" "$R" "valid email"
R=$(curl -s -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" -d "{\"email\":\"x${STAMP}@t.test\",\"password\":\"short\"}")
check "short password rejected" "$R" "at least 8"

echo "== 2. register trader (email+password) =="
R=$(curl -s -c "$JAR" -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\",\"role\":\"trader\",\"businessName\":\"E2E Test Duka\",\"ownerName\":\"E2E Tester\"}")
check "registration succeeds" "$R" '"ok":true'
check "session cookie set" "$(grep -c pp_session "$JAR" 2>/dev/null)" "1"
SLUG=$(echo "$R" | python3 -c "import json,sys; print(json.load(sys.stdin).get('merchantSlug',''))")
echo "   merchant slug: $SLUG"

echo "== 3. duplicate registration rejected =="
R=$(curl -s -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\",\"role\":\"trader\"}")
check "duplicate email 409" "$R" "already registered"

echo "== 4. new account is CLEAN (no demo data) =="
R=$(curl -s -b "$JAR" "$BASE/api/bootstrap")
CAT=$(echo "$R" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len((d.get('products') or d.get('catalogue') or [])))")
SALES=$(echo "$R" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len((d.get('receipts') or d.get('sales') or [])))")
INV=$(echo "$R" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len((d.get('invoices') or [])))")
RID=$(echo "$R" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len((d.get('riders') or [])))")
[ "$CAT" = "0" ] && ok "catalogue empty ($CAT)" || bad "catalogue NOT empty: $CAT"
[ "$SALES" = "0" ] && ok "sales empty ($SALES)" || bad "sales NOT empty: $SALES"
[ "$INV" = "0" ] && ok "invoices empty ($INV)" || bad "invoices NOT empty: $INV"
[ "$RID" = "0" ] && ok "riders empty ($RID)" || bad "riders NOT empty: $RID"
NAME=$(echo "$R" | python3 -c "import json,sys; d=json.load(sys.stdin); p=d.get('seller') or {}; print(p.get('businessName') or p.get('business_name') or '')")
[ "$NAME" = "E2E Test Duka" ] && ok "profile hydrated: $NAME" || bad "profile wrong/missing: $NAME"
EMAILCHK=$(echo "$R" | python3 -c "import json,sys; d=json.load(sys.stdin); print((d.get('seller') or {}).get('email',''))")
[ "$EMAILCHK" = "$EMAIL" ] && ok "profile email matches session user" || bad "profile email mismatch: $EMAILCHK"
CATNAME=$(echo "$R" | python3 -c "import json,sys; d=json.load(sys.stdin); print((d.get('seller') or {}).get('category',''))")
[ -n "$CATNAME" ] && ok "profile category set ($CATNAME)" || bad "profile category missing"

echo "== 5. wrong password rejected =="
R=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"WrongPass123\"}")
check "wrong password 401" "$R" "incorrect"

echo "== 6. login with same email+password =="
R=$(curl -s -c "$JAR2" -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\"}")
check "login ok" "$R" '"ok":true'
check "role returned trader" "$R" '"role":"trader"'

echo "== 7. session endpoint =="
R=$(curl -s -b "$JAR2" "$BASE/api/auth/session")
check "session returns user" "$R" "$EMAIL"

echo "== 8. dashboard renders with session =="
CODE=$(curl -s -b "$JAR2" -o /tmp/dash_e2e.html -w "%{http_code}" "$BASE/seller/dashboard" --max-time 30)
[ "$CODE" = "200" ] && ok "seller dashboard 200" || bad "seller dashboard $CODE"
# Business name is client-hydrated from /api/bootstrap (covered by step 4 and
# the browser e2e); here we assert the shell loads without leaking demo names.
if grep -qiE "Wanjiku|Mwangi|demo merchant" /tmp/dash_e2e.html; then bad "dashboard leaks demo data"; else ok "no demo merchant names in dashboard shell"; fi

echo "== 9. anonymous bootstrap has no session data =="
R=$(curl -s "$BASE/api/bootstrap")
ANON=$(echo "$R" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('email') or d.get('user') or d.get('profile') or 'none')")
check "anonymous gets no profile" "$ANON" "none"

echo "== 10. register agent + landlord roles =="
R=$(curl -s -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL2\",\"password\":\"$PW\",\"role\":\"agent\",\"ownerName\":\"E2E Agent\"}")
check "agent registration ok" "$R" '"ok":true'
R=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL2\",\"password\":\"$PW\"}")
check "agent login ok" "$R" '"role":"agent"'

echo "== 11. public search still works =="
R=$(curl -s "$BASE/api/search?q=electronics" --max-time 20)
check "search returns results" "$R" '"results"'

echo "== 12. logout =="
R=$(curl -s -b "$JAR2" -c "$JAR2" -X POST "$BASE/api/auth/logout")
check "logout ok" "$R" '"ok":true'
R=$(curl -s -b "$JAR2" "$BASE/api/auth/session")
check "session cleared after logout" "$R" '"ok":false'

echo ""
echo "RESULTS: $PASS passed, $FAIL failed"
[ "$FAIL" = "0" ]
