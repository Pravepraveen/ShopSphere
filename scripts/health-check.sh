#!/usr/bin/env bash
# ShopSphere Service Health Check Script
set -e

BACKEND_URL=${BACKEND_URL:-"http://localhost:8080/api/v1/products"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost"}

echo "=========================================="
echo " Running ShopSphere Service Health Checks "
echo "=========================================="

echo -n "Checking Spring Boot Backend ($BACKEND_URL)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" || echo "000")
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 401 ]; then
    echo "HEALTHY (HTTP $HTTP_CODE)"
else
    echo "UNHEALTHY (HTTP $HTTP_CODE)"
    exit 1
fi

echo -n "Checking Frontend Portal ($FRONTEND_URL)... "
FRONT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")
if [ "$FRONT_CODE" -eq 200 ] || [ "$FRONT_CODE" -eq 304 ]; then
    echo "HEALTHY (HTTP $FRONT_CODE)"
else
    echo "UNHEALTHY (HTTP $FRONT_CODE)"
    exit 1
fi

echo "All services are up and operational!"
exit 0

