#!/bin/bash

# Finance Tracker - Pre-Deployment Test Script
# This script helps verify everything is working before deploying to Render

echo "🚀 Finance Tracker - Pre-Deployment Tests"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
echo "📋 Checking environment setup..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file found"
else
    echo -e "${RED}✗${NC} .env file not found"
    echo -e "${YELLOW}⚠${NC}  Please create a .env file based on .env.example"
    exit 1
fi

# Check for required environment variables
echo ""
echo "🔐 Checking required environment variables..."
required_vars=("MONGO_URI" "JWT_SECRET" "NODE_ENV" "FRONTEND_URL")
for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env; then
        echo -e "${GREEN}✓${NC} $var is set"
    else
        echo -e "${RED}✗${NC} $var is missing"
    fi
done

# Check Node.js version
echo ""
echo "📦 Checking Node.js version..."
node_version=$(node -v)
echo -e "${GREEN}✓${NC} Node.js version: $node_version"

# Check if dependencies are installed
echo ""
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Root dependencies installed"
else
    echo -e "${YELLOW}⚠${NC}  Root dependencies not installed"
    echo "   Run: npm install"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC}  Frontend dependencies not installed"
    echo "   Run: cd frontend && npm install"
fi

# Build frontend
echo ""
echo "🔨 Testing frontend build..."
cd frontend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Frontend builds successfully"
else
    echo -e "${RED}✗${NC} Frontend build failed"
    echo "   Run: cd frontend && npm run build"
    exit 1
fi
cd ..

# Check for .gitignore
echo ""
echo "🔒 Checking .gitignore files..."
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓${NC} Root .gitignore exists"
else
    echo -e "${RED}✗${NC} Root .gitignore missing"
fi

if [ -f "frontend/.gitignore" ]; then
    echo -e "${GREEN}✓${NC} Frontend .gitignore exists"
else
    echo -e "${RED}✗${NC} Frontend .gitignore missing"
fi

if [ -f "api/.gitignore" ]; then
    echo -e "${GREEN}✓${NC} API .gitignore exists"
else
    echo -e "${RED}✗${NC} API .gitignore missing"
fi

# Check render.yaml
echo ""
echo "🎯 Checking Render configuration..."
if [ -f "render.yaml" ]; then
    echo -e "${GREEN}✓${NC} render.yaml exists"
else
    echo -e "${RED}✗${NC} render.yaml missing"
fi

# Git status
echo ""
echo "📝 Checking Git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}⚠${NC}  You have uncommitted changes:"
        git status -s
    else
        echo -e "${GREEN}✓${NC} No uncommitted changes"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Not a git repository"
    echo "   Initialize with: git init"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Pre-deployment checks complete!${NC}"
echo ""
echo "📋 Next steps for Render deployment:"
echo "   1. Create MongoDB Atlas cluster and get connection string"
echo "   2. Push code to GitHub"
echo "   3. Connect repository to Render"
echo "   4. Set environment variables in Render dashboard"
echo "   5. Deploy!"
echo ""
echo "📖 See RENDER_DEPLOY.md for detailed instructions"
echo ""
