#!/bin/bash
# API Health Check Script
# Tests all major API endpoints

API_URL="http://localhost:3001"
TIMEOUT=5

echo "🔍 NumSense API Health Check"
echo "================================"
echo ""

# Test health endpoint
echo "Testing: GET /health"
if response=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" "$API_URL/health"); then
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" = "200" ]; then
        echo "✅ Status: $http_code"
        echo "   Response: $body"
    else
        echo "❌ Status: $http_code"
    fi
else
    echo "❌ Connection failed - Backend may not be running"
    echo "   Start with: docker-compose up"
fi

echo ""
echo "Testing: GET /auth/google (should redirect to Google)"
if response=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" -L "$API_URL/auth/google"); then
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" = "200" ] || [ "$http_code" = "302" ] || [ "$http_code" = "301" ]; then
        echo "✅ Status: $http_code (OAuth flow ready)"
    else
        echo "⚠️  Status: $http_code"
    fi
else
    echo "❌ Connection failed"
fi

echo ""
echo "Note: Other endpoints require JWT authentication or POST data"
echo "Use the application at http://localhost:5173 to test fully"
