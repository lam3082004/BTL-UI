#!/bin/bash
# NumSense Complete Deployment & Testing Guide
# This script serves as documentation for deploying and testing NumSense

cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                 NumSense Deployment Guide v1.0               ║
║         Complete Web App for Children with Dyscalculia       ║
╚═══════════════════════════════════════════════════════════════╝

## PART 1: PRE-DEPLOYMENT CHECKLIST

Before deploying, verify:
✓ Docker installed: docker --version
✓ Docker Compose installed: docker-compose --version  
✓ Git configured: git config --global user.name
✓ Node.js 18+ available (for local development): node --version

## PART 2: ENVIRONMENT SETUP

### Step 1: Configure Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit backend/.env and add:
- GOOGLE_CLIENT_ID: From Google Cloud Console OAuth app
- GOOGLE_CLIENT_SECRET: From Google Cloud Console OAuth app
- JWT_SECRET: Generate with: openssl rand -base64 32
- DATABASE_HOST: db (for Docker) or localhost (local)
- DATABASE_PORT: 5432
- DATABASE_USER: postgres
- DATABASE_PASSWORD: password
- DATABASE_NAME: numsense
- NODE_ENV: development
- FRONTEND_URL: http://localhost:5173

### Step 2: Configure Frontend Environment
```bash
cd ../frontend
cp .env.example .env
```

Verify frontend/.env contains:
- VITE_API_BASE_URL=http://localhost:3001

## PART 3: DEPLOYMENT OPTIONS

### Option A: Docker Deployment (RECOMMENDED)
```bash
# From project root
docker-compose up -d

# Wait 30 seconds for services to initialize
sleep 30

# Verify services are running
docker-compose ps
```

Expected output:
```
NAME                COMMAND                STATUS              PORTS
numsense_db         docker-entrypoint.s...  Up (healthy)  5432/tcp
numsense_backend    npm run start:dev       Up                 0.0.0.0:3001->3001/tcp
numsense_frontend   npm run dev             Up                 0.0.0.0:5173->5173/tcp
```

### Option B: Local Development
Terminal 1 (Database):
```bash
docker run --name numsense-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=numsense \
  -p 5432:5432 \
  postgres:15
```

Terminal 2 (Backend):
```bash
cd backend
npm install
npm run start:dev
```

Terminal 3 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

## PART 4: VERIFICATION

### Check Backend Health
```bash
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","message":"✨ NumSense Backend is running!"}
```

### Check Database Connection
```bash
psql postgresql://postgres:password@localhost:5432/numsense

# Should connect successfully. Type \q to exit.
```

### Check Frontend
Open browser: http://localhost:5173

## PART 5: TESTING THE APPLICATION

### Test Child Learning Flow
1. Visit http://localhost:5173
2. Click "👶 DÀNH CHO BÉ" (For Children)
3. Select child profile (Bé Minh or Bé Hùng)
4. Complete lesson:
   - Read question using speaker button
   - Drag fruits into basket
   - Complete 5 questions
   - See reward screen with stars
5. Navigate back and repeat

### Test Parent Dashboard Flow
1. Visit http://localhost:5173/parent-login
2. Click "Đăng nhập với Google"
3. Complete Google OAuth login
4. View parent dashboard with children
5. Click "📈 Báo cáo tiến độ" to see analytics
6. Click "⚙️ Cấu hình" to adjust lesson settings
7. Test report filtering (7/30/90 days)

### Test API Endpoints

Health Check:
```bash
curl http://localhost:3001/health
```

Start Lesson (requires valid childId):
```bash
curl -X POST http://localhost:3001/lessons/session \
  -H "Content-Type: application/json" \
  -d '{"childId":"test-child-id"}'
```

Generate Question:
```bash
curl -X POST http://localhost:3001/lessons/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "minNumber": 1,
    "maxNumber": 10,
    "allowedOperations": ["ADDITION"]
  }'
```

## PART 6: TROUBLESHOOTING

### Port Already in Use
```bash
# Kill process on specific port
lsof -ti:3001 | xargs kill -9   # Backend
lsof -ti:5173 | xargs kill -9   # Frontend
lsof -ti:5432 | xargs kill -9   # Database
```

### Database Connection Failed
```bash
# Check if database container is running
docker ps | grep postgres

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Frontend Can't Connect to Backend
```bash
# Verify backend is running
curl http://localhost:3001/health

# Check browser console (F12) for CORS errors
# Ensure VITE_API_BASE_URL is correct in frontend/.env
```

### Google OAuth Not Working
- Verify credentials in backend/.env
- Check authorized redirect URIs in Google Cloud Console
- Must include: http://localhost:3001/auth/google/callback
- Ensure backend is restarted after env changes

### Application Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild images
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## PART 7: DATA MANAGEMENT

### Accessing PostgreSQL Directly
```bash
# Connect to database
docker exec -it numsense_db psql -U postgres -d numsense

# List tables
\dt

# Query children
SELECT * FROM children;

# Exit
\q
```

### Clearing All Data
```bash
# WARNING: This deletes all data!
docker-compose down -v

# Restart fresh
docker-compose up -d
```

### Database Backup
```bash
# Backup database
docker exec numsense_db pg_dump -U postgres numsense > backup.sql

# Restore from backup
docker exec -i numsense_db psql -U postgres numsense < backup.sql
```

## PART 8: PRODUCTION DEPLOYMENT

For production, before deploying:
1. Generate strong JWT_SECRET: openssl rand -base64 32
2. Set NODE_ENV=production
3. Configure production database credentials
4. Use environment-specific .env files
5. Set up HTTPS/SSL certificates
6. Configure proper domain names
7. Set up CI/CD pipeline (GitHub Actions)
8. Enable database backups
9. Set up monitoring and logging
10. Review and update security headers

Production docker-compose changes:
```yaml
# Change NODE_ENV to production
NODE_ENV: production

# Use production database credentials
DATABASE_PASSWORD: <strong-password>

# Update frontend URL
FRONTEND_URL: https://yourdomain.com

# Update API URL
VITE_API_BASE_URL: https://api.yourdomain.com
```

## PART 9: MONITORING

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Last N lines
docker-compose logs --tail=100 backend
```

### Check Resource Usage
```bash
docker stats
```

### Database Metrics
```bash
# Connect and check stats
docker exec -it numsense_db psql -U postgres -d numsense -c "SELECT * FROM pg_stat_user_tables;"
```

## PART 10: SUPPORT & DOCUMENTATION

- Full Documentation: README.md
- Quick Start: QUICKSTART.md
- API Reference: API_DOCUMENTATION.md
- Setup Checklist: SETUP_CHECKLIST.md
- Contributing Guide: CONTRIBUTING.md
- Architecture: See README.md Architecture section

## KEY FEATURES IMPLEMENTED

✅ Google OAuth 2.0 authentication for parents
✅ Child profile management with customizable lesson difficulty
✅ Interactive drag-and-drop math lessons
✅ 4 math operations: Addition, Subtraction, Multiplication, Division
✅ Real-time lesson session tracking
✅ Detailed analytics with charts (bar chart, pie chart)
✅ 7/30/90-day progress filtering
✅ Web Speech API for audio question reading
✅ Audio feedback for correct/incorrect answers
✅ Responsive design for mobile and tablet
✅ PWA support for offline use
✅ Smooth animations with framer-motion
✅ Touch-friendly interface (64px+ targets)
✅ Vietnamese localization

## TECHNOLOGY STACK

Backend:
- NestJS 10.2.8 (Node.js framework)
- TypeORM 0.3.17 (Database ORM)
- PostgreSQL 15 (Database)
- Passport.js (Authentication)
- JWT (Token management)
- Docker (Containerization)

Frontend:
- React 18.2.0 (UI framework)
- Vite 5.0.8 (Build tool)
- TypeScript 5.2.2 (Type safety)
- Tailwind CSS 3.4.1 (Styling)
- @dnd-kit (Drag and drop)
- recharts (Data visualization)
- framer-motion (Animations)
- Axios (HTTP client)
- React Router (Navigation)

## NEXT STEPS

1. Complete environment setup (see Part 2)
2. Deploy application (see Part 3)
3. Verify deployment (see Part 4)
4. Test application flows (see Part 5)
5. Review logs for any issues (see Part 9)
6. Add real children profiles via parent dashboard
7. Test lesson flows with actual children
8. Configure production settings for public use

## SUPPORT CONTACT

For issues or questions:
- Check TROUBLESHOOTING section (Part 6)
- Review logs with: docker-compose logs
- See CONTRIBUTING.md for development guidelines
- Check API_DOCUMENTATION.md for API details

═══════════════════════════════════════════════════════════════
NumSense Application - Ready for Deployment ✓
═══════════════════════════════════════════════════════════════

EOF
