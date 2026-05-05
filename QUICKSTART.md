# NumSense Quick Start Guide

## Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Google OAuth credentials (for parent login)

## Option 1: Docker (Recommended)

### 1. Setup Environment
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your Google OAuth credentials
# Get credentials from: https://console.cloud.google.com
```

### 2. Configure Google OAuth
Edit `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
JWT_SECRET=generate_a_random_secret_key_min_32_chars
```

### 3. Start Services
```bash
docker-compose up -d
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Database**: postgresql://postgres:password@localhost:5432/numsense

### 5. Verify Setup
```bash
# Check backend health
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","message":"✨ NumSense Backend is running!"}
```

---

## Option 2: Local Development

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Start PostgreSQL
docker run --name numsense-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=numsense \
  -p 5432:5432 \
  postgres:15

# Start backend
npm run start:dev
```

Backend runs on `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## User Flows

### For Children
1. Visit http://localhost:5173
2. Click "DÀNH CHO BÉ" (For Children)
3. Select your profile card
4. Start lessons - drag fruits into basket!
5. Complete 5 questions to see results

### For Parents
1. Visit http://localhost:5173/parent-login
2. Click "Đăng nhập với Google"
3. Complete OAuth login
4. View children profiles
5. Check progress reports
6. Configure lesson settings

---

## API Endpoints

### Health Check
- `GET /health` - Check backend status

### Authentication
- `GET /auth/google` - Start Google OAuth
- `GET /auth/google/callback` - OAuth callback

### Children (JWT Required)
- `POST /children` - Create child
- `GET /children` - List children
- `PUT /children/:id/config` - Update settings
- `DELETE /children/:id` - Delete child

### Lessons
- `POST /lessons/session` - Start session
- `POST /lessons/generate-question` - Get question
- `POST /lessons/result` - Save answer
- `POST /lessons/session/:id/complete` - End session

### Reports (JWT Required)
- `GET /reports/:childId?days=7` - Get analytics

---

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5432 | xargs kill -9  # Database
```

### Database Connection Failed
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Recreate container if needed
docker-compose down
docker-compose up -d
```

### Google OAuth Not Working
- Verify credentials in `backend/.env`
- Check authorized redirect URI in Google Cloud Console
- Ensure `http://localhost:3001/auth/google/callback` is listed

### Frontend Can't Connect to Backend
- Verify `VITE_API_BASE_URL=http://localhost:3001` in `frontend/.env`
- Check CORS is enabled (it is by default)
- Verify backend is running: `curl http://localhost:3001/health`

---

## Next Steps

1. **Customize**: Edit colors in `frontend/tailwind.config.ts`
2. **Add more children**: Create profiles in parent dashboard
3. **Deploy**: Use Docker Compose for production
4. **Extend**: Add features from the roadmap in README.md

---

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub

Happy learning! 🧮✨
