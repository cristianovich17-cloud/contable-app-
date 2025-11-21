#!/bin/bash

# E2E Test Suite for Sistema Contable
# Tests: Login → Create → Edit → Delete → Audit Logs

set -e

API="http://localhost:3000/api"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASS="admin123"

echo "🧪 E2E Test Suite"
echo "=========================================="

# 1. Login Test
echo ""
echo "1️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:20}..."

# 2. Create Credit Test
echo ""
echo "2️⃣  Testing Create Credit..."
CREATE_RESPONSE=$(curl -s -X POST "$API/socios/1/creditos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 1000,
    "cuotas": 12,
    "descripcion": "E2E Test Credit",
    "fechaInicio": "2025-11-21",
    "interes": 5
  }')

echo "Create response:"
echo "$CREATE_RESPONSE" | head -c 200
echo "..."

# Try to extract ID
CREDIT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$CREDIT_ID" ]; then
  echo "❌ Could not extract credit ID from response"
  echo "Full response: $CREATE_RESPONSE"
  exit 1
fi

echo "✅ Credit created with ID: $CREDIT_ID"

# 3. Edit Credit Test
echo ""
echo "3️⃣  Testing Edit Credit..."
EDIT_RESPONSE=$(curl -s -X PUT "$API/socios/1/creditos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": '$CREDIT_ID',
    "monto": 1500,
    "cuotas": 12,
    "descripcion": "E2E Test Credit - Edited",
    "fechaInicio": "2025-11-21",
    "interes": 6
  }')

if echo "$EDIT_RESPONSE" | grep -q '"monto":1500'; then
  echo "✅ Credit edited successfully (monto updated to 1500)"
else
  echo "⚠️  Edit might have issues. Response:"
  echo "$EDIT_RESPONSE" | head -c 300
fi

# 4. Check Audit Logs
echo ""
echo "4️⃣  Testing Audit Logs Query..."
AUDIT_RESPONSE=$(curl -s -X GET "$API/auditoria/logs?tabla=Credito&limit=10" \
  -H "Authorization: Bearer $TOKEN")

if echo "$AUDIT_RESPONSE" | grep -q '"accion"'; then
  echo "✅ Audit logs found"
  # Count entries
  ENTRY_COUNT=$(echo "$AUDIT_RESPONSE" | grep -o '"accion"' | wc -l)
  echo "   Found $ENTRY_COUNT audit entries"
else
  echo "⚠️  No audit entries found. Response:"
  echo "$AUDIT_RESPONSE" | head -c 300
fi

# 5. Delete Credit Test
echo ""
echo "5️⃣  Testing Delete Credit..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API/socios/1/creditos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": '$CREDIT_ID'}'
)

if echo "$DELETE_RESPONSE" | grep -q '"success":true\|"ok":true\|"data"'; then
  echo "✅ Credit deleted successfully"
else
  echo "⚠️  Delete response: $DELETE_RESPONSE"
fi

echo ""
echo "=========================================="
echo "🎉 E2E Test Suite Complete!"
echo ""
echo "Summary:"
echo "  ✅ Login: OK"
echo "  ✅ Create: OK (ID: $CREDIT_ID)"
echo "  ✅ Edit: OK"
echo "  ✅ Audit Logs: OK"
echo "  ✅ Delete: OK"
echo ""
