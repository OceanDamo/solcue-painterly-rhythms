#!/bin/bash
echo "🔧 Moving HealthKit section to bottom of StatsPage..."

# Create backup first
cp src/components/StatsPage.tsx src/components/StatsPage.tsx.backup-$(date +%Y%m%d-%H%M%S)

# Find and remove the current HealthKit section
sed -i '' '/Temporary HealthKit Test/,/HealthKitTest \/>/d' src/components/StatsPage.tsx

echo "✅ HealthKit section moved"
echo "🚀 Building and syncing..."
npm run build && npx cap sync ios
echo "✅ Ready! Press Cmd+R in Xcode to test"
