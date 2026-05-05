# 🧮 NumSense — Math Learning App for Children with Dyscalculia

A full-stack progressive web app supporting children with dyscalculia through interactive, gamified math lessons with drag-and-drop interfaces, audio feedback, and comprehensive parent dashboards.

## 🚀 Quick Start

### Prerequisites
- **Docker** & **Docker Compose**
- **Node.js 18+** (for local development without Docker)
- **Google OAuth Credentials** ([Create here](https://console.cloud.google.com))

### Setup with Docker (Recommended)

1. **Clone & Enter Repository**
   ```bash
   cd /path/to/BTL-UI
   ```

2. **Configure Environment**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your Google OAuth credentials and JWT secret
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. **Update Google OAuth Settings**
   In `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

4. **Start All Services**
   ```bash
   docker-compose up -d
   ```

5. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Database: postgresql://postgres:password@localhost:5432/numsense

### Setup for Local Development

#### Backend (NestJS)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run start:dev
```

Backend runs on `http://localhost:3001`

#### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

#### Database (PostgreSQL)

```bash
# Using Docker
docker run --name numsense-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=numsense \
  -p 5432:5432 \
  postgres:15
```

---

## 📱 User Flows

### Flow 1: Child Learning Session
1. **SplashPage** → Choose "Dành Cho Bé" (For Children)
2. **ChildSelectPage** → Tap profile card (e.g., "Bé Minh")
3. **LessonPage** → Drag fruits into basket matching the answer
   - 🎯 5 questions per session
   - 🔊 Speaker button reads question aloud
   - 🎵 Audio feedback: success/wrong sounds
4. **RewardPage** → Celebration with ⭐ rating

### Flow 2: Parent Dashboard
1. **ParentLoginPage** → Google OAuth login
2. **ParentDashboard** → View all children, expand each profile
3. **ProgressReport** → View 7/30/90-day reports
   - Bar chart: response times
   - Donut chart: correct vs wrong ratio
   - Key metrics: accuracy, avg response time
4. **ChildConfig** → Set number range, allowed operations

---

## 🏗️ Project Structure

```
numsense/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # Google OAuth + JWT
│   │   ├── children/          # Child CRUD + config
│   │   ├── lessons/           # Question generation + session management
│   │   ├── reports/           # Analytics & data aggregation
│   │   ├── entities/          # TypeORM entities
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                   # React + Vite PWA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SplashPage.tsx
│   │   │   ├── ChildSelectPage.tsx
│   │   │   ├── LessonPage.tsx
│   │   │   ├── RewardPage.tsx
│   │   │   ├── ParentLoginPage.tsx
│   │   │   ├── ParentDashboard.tsx
│   │   │   ├── ProgressReport.tsx
│   │   │   └── ChildConfig.tsx
│   │   ├── components/
│   │   │   ├── DraggableFruit.tsx
│   │   │   └── FruitBasket.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useLesson.ts
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.html
│   └── Dockerfile
│
├── docker-compose.yml         # Orchestration
├── .env.example              # Template
└── README.md                 # This file
```

---

## 🔌 API Endpoints

### Authentication
- `GET /auth/google` — Initiate Google OAuth
- `GET /auth/google/callback` — OAuth callback (returns JWT)

### Children Management (JWT Protected)
- `POST /children` — Create child profile
- `GET /children` — List children of logged-in parent
- `GET /children/:id` — Get child details
- `PUT /children/:id/config` — Update learning config
- `DELETE /children/:id` — Delete child profile

### Lessons
- `POST /lessons/session` — Start new session
- `POST /lessons/generate-question` — Generate math question
- `POST /lessons/result` — Save question result
- `GET /lessons/session/:id/results` — Get session results
- `POST /lessons/session/:id/complete` — Mark session complete

### Reports (JWT Protected)
- `GET /reports/:childId?days=7` — Get child report (7/30/90 days)
- `GET /reports/session/:sessionId/stats` — Get session statistics

---

## 🎨 Design System

### Color Palette
```css
Primary:     #5BBFB5  /* Soft Teal */
Secondary:  #FFD89B  /* Warm Peach */
Accent:     #FFF5D6  /* Pale Yellow */
Success:    #95D5B2  /* Soft Green */
Warning:    #FFB4B4  /* Soft Red */
```

### Fonts
- **Display**: Nunito, Baloo 2 (Google Fonts)
- **Body**: Nunito (sans-serif)

### Touch Targets
- Minimum: **64×64px** (all interactive elements)
- Enhanced hover/tap feedback with framer-motion

---

## 🔧 Technologies

### Backend
- **NestJS** — TypeScript Node framework
- **PostgreSQL** — Relational database
- **TypeORM** — ORM
- **Passport.js** — Authentication (Google OAuth, JWT)
- **Docker** — Containerization

### Frontend
- **React 18** — UI library
- **Vite** — Build tool
- **Tailwind CSS** — Utility-first styling
- **@dnd-kit** — Touch-friendly drag & drop
- **recharts** — Charts (Bar, Pie)
- **framer-motion** — Animations
- **@tanstack/react-query** — Data fetching
- **axios** — HTTP client
- **vite-plugin-pwa** — PWA support

### Database
- **PostgreSQL 15** — Primary database
- **TypeORM** — Schema management

---

## 📊 Database Schema

### Parents
```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY,
  googleId VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Children
```sql
CREATE TABLE children (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  avatar VARCHAR,
  parentId UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  minNumber INT DEFAULT 1,
  maxNumber INT DEFAULT 10,
  allowedOperations VARCHAR[] DEFAULT '{ADDITION}',
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Lesson Sessions
```sql
CREATE TABLE lesson_sessions (
  id UUID PRIMARY KEY,
  childId UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  startedAt TIMESTAMP DEFAULT NOW(),
  completedAt TIMESTAMP
);
```

### Question Results
```sql
CREATE TABLE question_results (
  id UUID PRIMARY KEY,
  sessionId UUID NOT NULL REFERENCES lesson_sessions(id) ON DELETE CASCADE,
  expression VARCHAR NOT NULL,
  correct BOOLEAN NOT NULL,
  responseTimeMs INT,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing

### Backend
```bash
npm run test
npm run test:cov
```

### Frontend
```bash
npm run lint
npm run type-check
```

---

## 📱 PWA Features

- **Offline-First**: Service worker caching
- **Installable**: Add to home screen
- **Responsive**: Mobile-first (375px–430px target)
- **App Manifest**: `NumSense` branding, theme color #5BBFB5
- **Icons**: 192×192px & 512×512px

---

## 🔐 Security

- ✅ JWT tokens stored in localStorage (production: use httpOnly cookies)
- ✅ Google OAuth 2.0 for parent authentication
- ✅ Children sessions stored in sessionStorage (per-browser)
- ✅ CORS enabled for frontend
- ✅ Input validation with class-validator

---

## 🐛 Troubleshooting

### Google OAuth Not Working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Check redirect URI matches: `http://localhost:3001/auth/google/callback`
- Add `http://localhost:5173` to authorized origins in Google Cloud Console

### Database Connection Error
- Ensure PostgreSQL is running: `docker ps`
- Check `DATABASE_URL` in `.env`
- Verify password matches: `password`

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5432 | xargs kill -9  # Database
```

---

## 🚀 Deployment

### Docker Compose (Production)
```bash
# Build images
docker-compose build

# Run with environment
docker-compose up -d

# View logs
docker-compose logs -f
```

### Environment Variables for Production
Update `backend/.env`:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db:5432/numsense
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_secret
JWT_SECRET=long_random_secret_key_min_32_chars
FRONTEND_URL=https://yourdomain.com
```

---

## 📝 License

MIT

---

## 👥 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

---

## 🎯 Roadmap

- [ ] Mobile app (React Native / Flutter)
- [ ] Gamification: leaderboards, achievements
- [ ] Multi-language support (English, Chinese, etc.)
- [ ] Teacher dashboard for classroom use
- [ ] Advanced analytics & ML-based difficulty adjustment
- [ ] Video tutorials & guided lessons
- [ ] Social features: family challenges

---

**NumSense** — Helping children with dyscalculia love mathematics! 🧮✨
