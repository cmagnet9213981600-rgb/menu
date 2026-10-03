#!/bin/bash
# Setup script for YShop Drink
# Run: bash scripts/setup.sh

set -e

echo "☕ YShop Drink - Setup Script"
echo "=============================="

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ bun is not installed. Installing..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
fi

echo "📦 Installing dependencies..."
bun install

echo ""
echo "🗄️  Setting up database..."
cp -n .env.example .env 2>/dev/null || true
bun run db:push

echo ""
echo "🌱 Seeding database with demo data..."
bun run seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "   bun run dev"
echo ""
echo "🌐 Then open http://localhost:3000 in your browser"
echo ""
echo "📚 3 demo tenants will be available:"
echo "   - گروه کافه‌های تهران (3 branches, 20 products)"
echo "   - رستوران‌های زنجیره‌ای شیلا (2 branches, 16 products)"
echo "   - کافه آرت‌هاوس (1 branch, 8 products)"
