#!/bin/bash
# Complete NumSense Setup Validation & Deployment Script
# This script verifies all components are in place for deployment

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          NumSense Complete Setup Validation v1.0          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check functions
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} MISSING: $1"
        ERRORS=$((ERRORS+1))
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} MISSING: $1/"
        ERRORS=$((ERRORS+1))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. CHECKING ROOT FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "docker-compose.yml"
check_file ".nvmrc"
check_file ".gitignore"
check_file "README.md"
check_file "QUICKSTART.md"
check_file "API_DOCUMENTATION.md"
check_file "SETUP_CHECKLIST.md"
check_file "CONTRIBUTING.md"
check_file "LICENSE"
check_file "BUILD_REPORT.md"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. CHECKING BACKEND STRUCTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_dir "backend"
check_file "backend/package.json"
check_file "backend/tsconfig.json"
check_file "backend/tsconfig.build.json"
check_file "backend/nest-cli.json"
check_file "backend/.env.example"
check_file "backend/Dockerfile"
check_dir "backend/src"
check_file "backend/src/main.ts"
check_file "backend/src/app.module.ts"
check_file "backend/src/data-source.ts"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. CHECKING BACKEND MODULES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_dir "backend/src/auth"
check_file "backend/src/auth/auth.module.ts"
check_file "backend/src/auth/auth.service.ts"
check_file "backend/src/auth/auth.controller.ts"
check_file "backend/src/auth/strategies/google.strategy.ts"
check_file "backend/src/auth/strategies/jwt.strategy.ts"
check_file "backend/src/auth/guards/jwt-auth.guard.ts"

check_dir "backend/src/children"
check_file "backend/src/children/children.module.ts"
check_file "backend/src/children/children.service.ts"
check_file "backend/src/children/children.controller.ts"

check_dir "backend/src/lessons"
check_file "backend/src/lessons/lessons.module.ts"
check_file "backend/src/lessons/lessons.service.ts"
check_file "backend/src/lessons/lessons.controller.ts"

check_dir "backend/src/reports"
check_file "backend/src/reports/reports.module.ts"
check_file "backend/src/reports/reports.service.ts"
check_file "backend/src/reports/reports.controller.ts"

check_dir "backend/src/entities"
check_file "backend/src/entities/parent.entity.ts"
check_file "backend/src/entities/child.entity.ts"
check_file "backend/src/entities/lesson-session.entity.ts"
check_file "backend/src/entities/question-result.entity.ts"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. CHECKING FRONTEND STRUCTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_dir "frontend"
check_file "frontend/package.json"
check_file "frontend/tsconfig.json"
check_file "frontend/vite.config.ts"
check_file "frontend/tailwind.config.ts"
check_file "frontend/postcss.config.js"
check_file "frontend/.env.example"
check_file "frontend/index.html"
check_file "frontend/Dockerfile"
check_dir "frontend/src"
check_file "frontend/src/main.tsx"
check_file "frontend/src/App.tsx"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. CHECKING FRONTEND PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_dir "frontend/src/pages"
check_file "frontend/src/pages/SplashPage.tsx"
check_file "frontend/src/pages/ChildSelectPage.tsx"
check_file "frontend/src/pages/LessonPage.tsx"
check_file "frontend/src/pages/RewardPage.tsx"
check_file "frontend/src/pages/ParentLoginPage.tsx"
check_file "frontend/src/pages/ParentDashboard.tsx"
check_file "frontend/src/pages/ProgressReport.tsx"
check_file "frontend/src/pages/ChildConfig.tsx"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. CHECKING FRONTEND COMPONENTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_dir "frontend/src/components"
check_file "frontend/src/components/DraggableFruit.tsx"
check_file "frontend/src/components/FruitBasket.tsx"

check_dir "frontend/src/hooks"
check_file "frontend/src/hooks/useAuth.ts"
check_file "frontend/src/hooks/useLesson.ts"

check_dir "frontend/src/api"
check_file "frontend/src/api/client.ts"

check_dir "frontend/src/types"
check_file "frontend/src/types/index.ts"

check_dir "frontend/src/styles"
check_file "frontend/src/styles/globals.css"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. CHECKING PUBLIC ASSETS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_dir "frontend/public"
check_file "frontend/public/favicon.svg"
check_dir "frontend/public/sounds"
check_dir "frontend/public/icons"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. CHECKING SCRIPTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "deploy.sh"
check_file "health-check.sh"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All files present and accounted for!${NC}"
    echo ""
    echo "Your NumSense application is ready for deployment."
    echo ""
    echo "Next steps:"
    echo "1. Configure environment variables:"
    echo "   cp backend/.env.example backend/.env"
    echo "   # Edit with Google OAuth credentials"
    echo ""
    echo "2. Start the application:"
    echo "   docker-compose up -d"
    echo ""
    echo "3. Verify deployment:"
    echo "   ./deploy.sh"
    echo ""
    echo "4. Access the application:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend API: http://localhost:3001"
    echo ""
else
    echo -e "${RED}✗ Found $ERRORS missing file(s)${NC}"
    echo ""
    echo "Please ensure all files are created before deployment."
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "NumSense Setup Validation Complete ✓"
echo "═══════════════════════════════════════════════════════════"
