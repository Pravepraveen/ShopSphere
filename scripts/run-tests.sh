#!/usr/bin/env bash
# ShopSphere Automated Test Suite Runner (Backend + Frontend)
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================="
echo " 1. Running Backend Unit & Integration Tests "
echo "=========================================="
cd "$DIR/backend"
mvn test

echo "=========================================="
echo " 2. Running Frontend Vitest Automated Tests "
echo "=========================================="
cd "$DIR/frontend"
npm run test:run

echo "=========================================="
echo " ALL TESTS PASSED SUCCESSFULLY! "
echo "=========================================="
exit 0

