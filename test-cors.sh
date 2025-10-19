#!/bin/bash

# CORS Test Script for Nobean API
# This script tests CORS configuration

echo "🧪 Testing CORS Configuration for Nobean API"
echo "=============================================="

API_URL="https://api.nobean.ir"
FRONTEND_URL="https://www.nobean.ir"

echo "📡 Testing preflight request..."
echo "Origin: $FRONTEND_URL"
echo "Method: OPTIONS"
echo "Endpoint: /api/v1/users/send-otp"
echo ""

# Test preflight request
curl -X OPTIONS \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v \
  "$API_URL/api/v1/users/send-otp" \
  2>&1 | grep -E "(< HTTP|< Access-Control|Origin|Method|Header)"

echo ""
echo "📡 Testing actual request..."
echo "Origin: $FRONTEND_URL"
echo "Method: POST"
echo "Endpoint: /api/v1/users/send-otp"
echo ""

# Test actual request
curl -X POST \
  -H "Origin: $FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"phone":"09123456789"}' \
  -v \
  "$API_URL/api/v1/users/send-otp" \
  2>&1 | grep -E "(< HTTP|< Access-Control|Origin|Method|Header)"

echo ""
echo "✅ CORS test completed!"
echo ""
echo "🔍 If you see CORS errors, check:"
echo "1. Server CORS configuration"
echo "2. Allowed origins list"
echo "3. Server logs for blocked origins"
echo "4. Network tab in browser dev tools"
