#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname $(dirname "$0"))" || exit 1
ROOT=$(pwd)
LOG=.e2e.log
rm -f "$LOG" .login.json .credit.json .audit.json .dev.pid .dev.log

echo "1) Ensuring demo users exist via /api/auth/register..." | tee -a "$LOG"
# Create demo users via API register (idempotent if already present)
for user in \
  '{"email":"admin@example.com","nombre":"Administrador","password":"admin123","rol":"admin"}' \
  '{"email":"contador@example.com","nombre":"Contador General","password":"contador123","rol":"contador"}' \
  '{"email":"visor@example.com","nombre":"Visualizador","password":"visor123","rol":"visor"}'; do
  echo "Registering: $user" | tee -a "$LOG"
  curl -s -X POST "http://localhost:3000/api/auth/register" -H "Content-Type: application/json" -d "$user" || true
  echo "" | tee -a "$LOG"
done

echo "\n2) Starting dev server in background..." | tee -a "$LOG"
# Kill existing
pkill -f "next dev" || true
pkill -f "npm run dev" || true
nohup npm run dev > .dev.log 2>&1 &
echo $! > .dev.pid

# Wait for server readiness
PORT=""
for i in $(seq 1 40); do
  for p in 3000 3001; do
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${p}/api/hello || true)
    if [ "$status" = "200" ]; then
      PORT=$p
      break 2
    fi
  done
  sleep 1
done
if [ -z "$PORT" ]; then
  echo "ERROR: dev server did not start within timeout. Tail .dev.log:" | tee -a "$LOG"
  tail -n 200 .dev.log | tee -a "$LOG"
  exit 1
fi

echo "Dev server ready on port $PORT" | tee -a "$LOG"

# Login (use seed admin@example.com/admin123)
echo "\n3) Attempting login..." | tee -a "$LOG"
curl -s -X POST "http://localhost:${PORT}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin123"}' > .login.json
cat .login.json | tee -a "$LOG"
# Extract token from response: { ok: true, data: { token, usuario } }
TOKEN=$(node -e "try{const fs=require('fs'); const j=JSON.parse(fs.readFileSync('.login.json','utf8')); if(j && j.data && j.data.token) console.log(j.data.token);}catch(e){}")
if [ -z "$TOKEN" ]; then
  echo "ERROR: could not get token. See .login.json and .dev.log" | tee -a "$LOG"
  exit 1
fi

echo "Token obtained (truncated): ${TOKEN:0:12}..." | tee -a "$LOG"

# 4) Create credit
echo "\n4) Creating credit..." | tee -a "$LOG"
CREATE_RESP=$(curl -s -X POST "http://localhost:${PORT}/api/socios/1/creditos" -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d '{"montoTotal":1000,"cuotas":4,"descripcion":"Prueba E2E","fechaInicio":"2025-11-18"}')
echo "$CREATE_RESP" | tee -a "$LOG" > .credit.json
CRE_ID=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('.credit.json','utf8')); if(j && j.credit && j.credit.id) console.log(j.credit.id);}catch(e){}")
if [ -z "$CRE_ID" ]; then echo "ERROR: create credit failed" | tee -a "$LOG"; exit 1; fi

echo "Created credit id: $CRE_ID" | tee -a "$LOG"

# 5) Edit credit (PUT)
echo "\n5) Editing credit..." | tee -a "$LOG"
EDIT_RESP=$(curl -s -X PUT "http://localhost:${PORT}/api/socios/1/creditos" -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d '{"id":"'$CRE_ID'","montoTotal":1200,"descripcion":"Actualizado E2E"}')
echo "$EDIT_RESP" | tee -a "$LOG"

# 6) Delete credit
echo "\n6) Deleting credit..." | tee -a "$LOG"
DEL_RESP=$(curl -s -X DELETE "http://localhost:${PORT}/api/socios/1/creditos" -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d '{"id":"'$CRE_ID'"}')
echo "$DEL_RESP" | tee -a "$LOG"

# 7) Fetch audit logs
echo "\n7) Fetching audit logs..." | tee -a "$LOG"
curl -s "http://localhost:${PORT}/api/auditoria/logs?limit=10" -H "Authorization: Bearer ${TOKEN}" > .audit.json
cat .audit.json | tee -a "$LOG"

# Tail dev log for context
echo "\n--- .dev.log tail ---" | tee -a "$LOG"
tail -n 80 .dev.log | tee -a "$LOG"

echo "\nE2E script finished. Logs: .e2e.log, .dev.log, .audit.json" | tee -a "$LOG"
exit 0
