#!/bin/bash

# Test: Auto-generate email for socios

API_URL="http://localhost:3000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvSWQiOjEsInJvbCI6ImFkbWluIn0.test"

echo "=========================================="
echo "Testing Auto-Email Generation"
echo "=========================================="
echo ""

# Test 1: Create socio WITHOUT email
echo "Test 1: Create socio WITHOUT email"
echo "Expected: Email auto-generated as 'juan.garcia@contable.app'"
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/socios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "numero": "TEST001",
    "nombre": "Juan García",
    "telefono": "+56912345678"
  }')

echo "Response:"
echo "$RESPONSE" | jq .
echo ""

# Extract email
EMAIL=$(echo "$RESPONSE" | jq -r '.socio.email')
echo "Generated Email: $EMAIL"
echo ""

# Validate
if [[ "$EMAIL" == *"@contable.app"* ]]; then
  echo "✅ PASS: Email was generated"
else
  echo "❌ FAIL: Email was not generated"
fi

echo ""
echo "=========================================="
echo "Test 2: Create socio WITH email"
echo "Expected: Email preserved as provided"
echo ""

RESPONSE2=$(curl -s -X POST "$API_URL/socios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "numero": "TEST002",
    "nombre": "María López",
    "email": "maria.lopez@example.com",
    "telefono": "+56987654321"
  }')

echo "Response:"
echo "$RESPONSE2" | jq .
echo ""

EMAIL2=$(echo "$RESPONSE2" | jq -r '.socio.email')
echo "Email: $EMAIL2"
echo ""

if [[ "$EMAIL2" == "maria.lopez@example.com" ]]; then
  echo "✅ PASS: Email was preserved"
else
  echo "❌ FAIL: Email was not preserved"
fi

echo ""
echo "=========================================="
echo "Test 3: Email normalization (accents)"
echo "Expected: Accents removed, lowercase"
echo ""

RESPONSE3=$(curl -s -X POST "$API_URL/socios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "numero": "TEST003",
    "nombre": "José Rodríguez Pérez",
    "telefono": "+56999999999"
  }')

EMAIL3=$(echo "$RESPONSE3" | jq -r '.socio.email')
echo "Generated Email: $EMAIL3"
echo ""

if [[ "$EMAIL3" == "jose.rodriguez.perez@contable.app" ]]; then
  echo "✅ PASS: Accents normalized correctly"
else
  echo "❌ FAIL: Accents not normalized. Got: $EMAIL3"
fi

echo ""
echo "=========================================="
echo "All tests completed!"
echo "=========================================="
