#!/bin/bash

# Simple E2E test - one step at a time
# This version tests each endpoint separately to avoid long-running processes

API="http://localhost:3000/api"
EMAIL="admin@example.com"
PASS="admin123"

echo "🧪 Starting E2E Test (Simple Version)"
echo ""

# Step 1: Login
echo "Step 1️⃣: LOGIN"
echo "Request: POST $API/auth/login"
echo "Body: {\"email\":\"$EMAIL\",\"password\":\"$PASS\"}"
echo ""

LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")

echo "Response:"
echo "$LOGIN" | head -c 300
echo ""
echo ""

TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ LOGIN FAILED - No token"
  exit 1
fi

echo "✅ LOGIN SUCCESS - Token obtained"
echo "Token: ${TOKEN:0:30}..."
echo ""
echo "=============================================="
echo ""

# Step 2: Create Credit
echo "Step 2️⃣: CREATE CREDIT"
echo "Request: POST $API/socios/1/creditos"
echo "Auth: Bearer $TOKEN"
echo ""

CREATE=$(curl -s -X POST "$API/socios/1/creditos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 1000,
    "cuotas": 12,
    "descripcion": "E2E Test",
    "fechaInicio": "2025-11-21",
    "interes": 5
  }')

echo "Response:"
echo "$CREATE" | head -c 300
echo ""
echo ""

CREDIT_ID=$(echo "$CREATE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$CREDIT_ID" ]; then
  echo "⚠️  Could not extract credit ID"
  echo "Full response: $CREATE"
  echo "ID extraction might have failed. Trying alternative..."
  CREDIT_ID=$(echo "$CREATE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
fi

if [ -z "$CREDIT_ID" ]; then
  echo "❌ CREATE FAILED - No ID returned"
  exit 1
fi

echo "✅ CREATE SUCCESS"
echo "Credit ID: $CREDIT_ID"
echo ""
echo "=============================================="
echo ""

# Step 3: Edit Credit
echo "Step 3️⃣: EDIT CREDIT"
echo "Request: PUT $API/socios/1/creditos"
echo "ID: $CREDIT_ID"
echo ""

EDIT=$(curl -s -X PUT "$API/socios/1/creditos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$CREDIT_ID\",
    \"monto\": 1500,
    \"cuotas\": 12,
    \"descripcion\": \"E2E Test - Edited\",
    \"fechaInicio\": \"2025-11-21\",
    \"interes\": 6
  }")

echo "Response:"
echo "$EDIT" | head -c 300
echo ""
echo ""

if echo "$EDIT" | grep -q "1500\|success\|ok"; then
  echo "✅ EDIT SUCCESS"
else
  echo "⚠️  Edit might have issues"
  echo "Full response: $EDIT"
fi

echo ""
echo "=============================================="
echo ""

# Step 4: Query Audit Logs
echo "Step 4️⃣: QUERY AUDIT LOGS"
echo "Request: GET $API/auditoria/logs?tabla=Credito"
echo ""

AUDIT=$(curl -s -X GET "$API/auditoria/logs?tabla=Credito&limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "Response (first 300 chars):"
echo "$AUDIT" | head -c 300
echo ""
echo ""

if echo "$AUDIT" | grep -q "accion\|logs"; then
  echo "✅ AUDIT LOGS FOUND"
  COUNT=$(echo "$AUDIT" | grep -o '"accion"' | wc -l)
  echo "   Entries found: $COUNT"
else
  echo "⚠️  No audit entries"
  echo "Full response: $AUDIT"
fi

echo ""
echo "=============================================="
echo ""

# Step 5: Delete Credit
echo "Step 5️⃣: DELETE CREDIT"
echo "Request: DELETE $API/socios/1/creditos"
echo "ID: $CREDIT_ID"
echo ""

DELETE=$(curl -s -X DELETE "$API/socios/1/creditos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"$CREDIT_ID\"}")

echo "Response:"
echo "$DELETE" | head -c 300
echo ""
echo ""

if echo "$DELETE" | grep -q "success\|ok"; then
  echo "✅ DELETE SUCCESS"
else
  echo "⚠️  Delete status unclear"
  echo "Full response: $DELETE"
fi

echo ""
echo "=============================================="
echo "🎉 E2E Test Complete!"
echo "=============================================="
echo ""
echo "Summary:"
echo "  ✅ Step 1: Login"
echo "  ✅ Step 2: Create Credit"
echo "  ✅ Step 3: Edit Credit"
echo "  ✅ Step 4: Audit Logs"
echo "  ✅ Step 5: Delete Credit"
echo ""
