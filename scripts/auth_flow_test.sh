#!/bin/bash
# End-to-end sign-in flow test against a running PlugPay server.
BASE="${1:-http://localhost:3111}"
JAR=$(mktemp)
PHONE="0712345678"

echo "== 1. send-otp =="
SEND=$(curl -s -c "$JAR" -X POST "$BASE/api/auth/send-otp" -H "Content-Type: application/json" -d "{\"phone\":\"$PHONE\"}")
echo "$SEND"
CODE=$(echo "$SEND" | python3 -c "import json,sys; print(json.load(sys.stdin).get('demoCode',''))")

echo "== 2. verify-otp with demo code $CODE =="
VERIFY=$(curl -s -b "$JAR" -c "$JAR" -X POST "$BASE/api/auth/verify-otp" -H "Content-Type: application/json" -d "{\"phone\":\"$PHONE\",\"code\":\"$CODE\"}")
echo "$VERIFY"

echo "== 3. dashboard with session cookie =="
DASH=$(curl -s -b "$JAR" -o /tmp/dash.html -w "%{http_code}" "$BASE/dashboard" --max-time 30)
echo "status: $DASH"
grep -o "Your stall\|Profile unavailable\|Wanjiku\|Karibu" /tmp/dash.html | sort | uniq -c

echo "== 4. wrong code is rejected (fresh jar) =="
JAR2=$(mktemp)
curl -s -c "$JAR2" -X POST "$BASE/api/auth/send-otp" -H "Content-Type: application/json" -d '{"phone":"0722113344"}' > /dev/null
curl -s -b "$JAR2" -X POST "$BASE/api/auth/verify-otp" -H "Content-Type: application/json" -d '{"phone":"0722113344","code":"000000"}'
echo ""
echo "== 5. search API =="
curl -s "$BASE/api/search?q=wanjiku" --max-time 20 | python3 -c "import json,sys; d=json.load(sys.stdin); print('results:', len(d.get('results', [])))"
rm -f "$JAR" "$JAR2"
