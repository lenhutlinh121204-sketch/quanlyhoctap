#!/bin/bash

# 🚀 QUICK PRODUCTION DEPLOYMENT SCRIPT
# This script helps deploy to Railway in 5 minutes

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║    EXAM MASTER - PRODUCTION DEPLOYMENT SETUP                  ║"
echo "║    Socket.IO Server + React Frontend                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Git Setup
echo "📝 Step 1/5: Git Repository Setup"
echo "─────────────────────────────────────────────────────────────────"

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✓ Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Socket.IO chat + React frontend"
else
    echo "✓ Git repository already initialized"
    git add .
    git commit -m "Update: Production deployment ready" || true
fi

echo ""
echo "📌 Instructions:"
echo "  1. Create a new repository at https://github.com/new"
echo "  2. Run:"
echo "     git remote add origin https://github.com/YOUR_USERNAME/exam-master.git"
echo "     git branch -M main"
echo "     git push -u origin main"
echo ""
read -p "Press Enter once GitHub repo is created and code is pushed..."

echo ""
echo "✅ Git setup complete"
echo ""

# Step 2: Railway Setup
echo "🚄 Step 2/5: Railway.app Setup"
echo "─────────────────────────────────────────────────────────────────"
echo "✓ Go to: https://railway.app"
echo "✓ Sign up with GitHub"
echo "✓ Create New Project → Deploy from GitHub repo"
echo "✓ Select your exam-master repo"
echo ""
read -p "Press Enter once you've created the Railway project..."

echo ""

# Step 3: Environment Variables
echo "🔐 Step 3/5: Set Production Environment Variables"
echo "─────────────────────────────────────────────────────────────────"
echo "✓ In Railway Dashboard:"
echo "  1. Go to Variables tab"
echo "  2. Add these variables:"
echo ""
echo "    PORT=3000"
echo "    NODE_ENV=production"
echo "    CLIENT_URL=https://mangoteamapphoctap.web.app"
echo ""
echo "✓ Click Deploy to save"
echo ""
read -p "Press Enter once environment variables are set..."

echo ""

# Step 4: Get Server URL
echo "🔗 Step 4/5: Get Your Server URL"
echo "─────────────────────────────────────────────────────────────────"
echo "✓ In Railway Dashboard:"
echo "  1. Click on your server deployment"
echo "  2. Go to Settings → Domain"
echo "  3. Copy the public domain (e.g., chat-server-xxxx.railway.app)"
echo "  4. You'll need this for the frontend config"
echo ""
read -p "Enter your Railway server URL (e.g., https://chat-server-xxxx.railway.app): " RAILWAY_URL

echo ""

# Step 5: Update Frontend Config
echo "⚙️  Step 5/5: Update Frontend Configuration"
echo "─────────────────────────────────────────────────────────────────"
echo "✓ Updating .env.production..."

cat > .env.production << EOF
# Production Frontend Configuration
VITE_SOCKET_URL=$RAILWAY_URL
EOF

echo "✓ File updated: .env.production"
echo ""
echo "Now build and deploy:"
echo "  npm run build"
echo "  firebase deploy"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              ✅ DEPLOYMENT SETUP COMPLETE!                    ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Server URL: $RAILWAY_URL"
echo "║  Frontend URL: https://mangoteamapphoctap.web.app              ║"
echo "║                                                                ║"
echo "║  Next steps:                                                   ║"
echo "║  1. npm run build                                              ║"
echo "║  2. firebase deploy                                            ║"
echo "║  3. Visit https://mangoteamapphoctap.web.app                   ║"
echo "║  4. Chat should work in real-time!                             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
