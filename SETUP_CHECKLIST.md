# NumSense Setup Checklist

Before deploying NumSense, complete these steps:

## 1. Prerequisites ✓
- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed (`git --version`)

## 2. Google OAuth Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create a new project or select existing one
- [ ] Enable OAuth 2.0 API
- [ ] Create OAuth 2.0 credentials (Web application)
- [ ] Set Authorized redirect URIs:
  - `http://localhost:3001/auth/google/callback` (development)
  - `http://your-domain.com/auth/google/callback` (production)
- [ ] Copy Client ID
- [ ] Copy Client Secret

## 3. Environment Configuration
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Copy `frontend/.env.example` to `frontend/.env`
- [ ] Edit `backend/.env` with values:
  ```
  GOOGLE_CLIENT_ID=<your_client_id>
  GOOGLE_CLIENT_SECRET=<your_client_secret>
  JWT_SECRET=<generate with: openssl rand -base64 32>
  ```
- [ ] Edit `frontend/.env` (usually already correct):
  ```
  VITE_API_BASE_URL=http://localhost:3001
  ```

## 4. Deployment Options

### Option A: Docker (Recommended)
```bash
# From project root
docker-compose up -d

# Verify deployment
./deploy.sh
# or manually
./health-check.sh
```

### Option B: Local Development
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev

# Terminal 3 - Database (if not using Docker)
docker run --name numsense-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=numsense \
  -p 5432:5432 \
  postgres:15
```

## 5. Access Application
- [ ] Frontend: http://localhost:5173
- [ ] Backend API: http://localhost:3001
- [ ] API Docs: http://localhost:3001 (Swagger optional)
- [ ] Database: postgresql://postgres:password@localhost:5432/numsense

## 6. Test Flows

### Child Learning Flow
1. [ ] Visit http://localhost:5173
2. [ ] Click "👶 DÀNH CHO BÉ" (For Children)
3. [ ] Select child profile
4. [ ] Complete lesson (5 questions)
5. [ ] View reward screen with stars and confetti

### Parent Dashboard Flow
1. [ ] Visit http://localhost:5173/parent-login
2. [ ] Click "Google Login" button
3. [ ] Complete Google OAuth
4. [ ] View child profiles
5. [ ] View progress reports
6. [ ] Configure lesson settings

## 7. Troubleshooting

### Port Already in Use
```bash
# Kill processes on specific ports
lsof -ti:3001 | xargs kill -9   # Backend
lsof -ti:5173 | xargs kill -9   # Frontend
lsof -ti:5432 | xargs kill -9   # Database
```

### Database Connection Issues
```bash
# Verify database is running
docker ps | grep postgres

# Check database logs
docker-compose logs db

# Restart services
docker-compose down
docker-compose up -d
```

### Google OAuth Not Working
- [ ] Verify credentials in `backend/.env`
- [ ] Check authorized redirect URIs in Google Cloud Console
- [ ] Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- [ ] Check backend logs: `docker-compose logs backend`

### Frontend Can't Connect to Backend
- [ ] Verify backend is running: `curl http://localhost:3001/health`
- [ ] Check `VITE_API_BASE_URL` in `frontend/.env`
- [ ] Check browser console for CORS errors
- [ ] Verify frontend .env file is loaded: `cat frontend/.env`

## 8. Production Deployment
- [ ] Generate strong `JWT_SECRET`: `openssl rand -base64 32`
- [ ] Configure production `FRONTEND_URL` in backend
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use production database credentials
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure domain and DNS
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Set up CI/CD pipeline

## 9. Next Steps
- [ ] Read [README.md](./README.md) for full documentation
- [ ] Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- [ ] Review [QUICKSTART.md](./QUICKSTART.md) for detailed setup
- [ ] Explore feature roadmap in README.md

## Support
- Issues: Check troubleshooting section above
- Documentation: See README.md
- Contribution: See CONTRIBUTING.md
- License: MIT (see LICENSE file)

---

**Status**: ✅ All files created and ready for deployment
**Last Updated**: Auto-generated
**Version**: 1.0.0
