#!/bin/bash
# scripts/smart-test.sh
# BREADCRUMB: Pre-push quality gate
# Detects which zone changed and runs appropriate tests

CHANGED=$(git diff --name-only HEAD @{push} 2>/dev/null || git diff --name-only HEAD~1)

RED_CHANGED=$(echo "$CHANGED" | grep -E 'middleware|supabase|billing|api/billing|gdpr')
YELLOW_CHANGED=$(echo "$CHANGED" | grep -E 'hooks/|services/|lib/types|lib/utils|api/')
GREEN_CHANGED=$(echo "$CHANGED" | grep -E 'components/ui|styles|public')

echo "🔍 VecHorses Quality Gate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

echo "▶ Running type-check..."
npm run type-check || { echo "❌ Type errors found. Fix before pushing."; exit 1; }

echo "▶ Running lint..."
npm run lint || { echo "❌ Lint errors found. Fix before pushing."; exit 1; }

if [ -n "$RED_CHANGED" ]; then
  echo "🔴 RED ZONE files changed — running full test suite"
  npm run test:coverage || { echo "❌ Tests failed in Red Zone."; exit 1; }
  npm run test:integration || { echo "❌ Integration tests failed."; exit 1; }
  echo "⚠️  RED ZONE push — manual review required before merging to main"
elif [ -n "$YELLOW_CHANGED" ]; then
  echo "🟡 YELLOW ZONE files changed — running unit + integration tests"
  npm run test:changed || { echo "❌ Tests failed."; exit 1; }
  npm run test:integration || { echo "❌ Integration tests failed."; exit 1; }
else
  echo "🟢 GREEN ZONE only — running lint + snapshot tests"
  npm run test:changed || { echo "❌ Snapshot tests failed."; exit 1; }
fi

echo "✅ Quality gate passed. Pushing."
