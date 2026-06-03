# NumSense

NumSense is a full-stack math learning web app for children, focused on friendly visual interaction, child profiles, parent controls, lesson progress, and gamified practice.

The app is built for a UI/UX coursework context: mobile-first screens, large touch targets, soft colors, simple interactions, page transitions, and child-friendly animations.

## Main Features

- Child profile selection with default demo profiles:
  - Be Bo
  - Be Tho
  - Be Bi
  - Be Sao
- Parent Google OAuth login.
- Parent dashboard with child profile CRUD:
  - create child profile
  - view child profiles
  - edit name/avatar
  - update learning configuration
  - delete local/demo/server profiles
- Learning configuration per child:
  - minimum and maximum number range
  - enabled lessons and operations
- Interactive child lessons:
  - counting
  - addition
  - subtraction
  - multiplication groups
  - division
  - fractions
  - clock/time
  - measurement
  - subitizing
  - balance scale
  - monster challenge
- Lesson tracking and result saving.
- Parent progress reports with charts.
- PWA support.
- Frontend animations and responsive layout.
- Render + Vercel deployment support.

## Tech Stack

### Frontend

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- @dnd-kit
- Recharts
- Axios
- vite-plugin-pwa

### Backend

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Passport Google OAuth
- JWT authentication

## Project Structure

```text
BTL-UI/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── children/
│   │   ├── lessons/
│   │   ├── reports/
│   │   ├── entities/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── docker-compose.yml
├── render.yaml
└── README.md
```

## Local Development

### Prerequisites

- Node.js 18 to 22
- npm
- Docker, if using local PostgreSQL
- Google OAuth credentials, if testing Google login

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

Backend runs at:

```text
http://localhost:3001
```

Health check:

```bash
curl http://localhost:3001/health
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

If Linux file watcher limit causes `ENOSPC`, run:

```bash
CHOKIDAR_USEPOLLING=true npm run dev -- --host 0.0.0.0
```

## Environment Variables

### Backend `.env`

For local PostgreSQL:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=numsense

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

JWT_SECRET=your_long_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173
FRONTEND_PUBLIC_URL=http://localhost:5173

PORT=3001
NODE_ENV=development
SEED_DEMO_DATA=true
```

For Render PostgreSQL external connection, also set:

```env
DATABASE_URL=postgresql://user:password@host/database
DATABASE_SSL=true
```

### Frontend `.env`

Local:

```env
VITE_API_BASE_URL=http://localhost:3001
```

Production:

```env
VITE_API_BASE_URL=https://numsense.onrender.com
```

## Google OAuth Setup

In Google Cloud Console, configure the OAuth web client.

Authorized JavaScript origins:

```text
http://localhost:5173
https://numsense-seven.vercel.app
```

Authorized redirect URIs:

```text
http://localhost:3001/auth/google/callback
https://numsense.onrender.com/auth/google/callback
```

If Google shows `Error 401: invalid_client`, check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are real credentials and that the callback URL matches exactly.

## API Endpoints

### Auth

```text
GET  /auth/google
GET  /auth/google/callback
GET  /auth/profile
PUT  /auth/settings
```

### Children

JWT protected except demo endpoint.

```text
GET    /children/demo
POST   /children
GET    /children
GET    /children/:id
PUT    /children/:id
PUT    /children/:id/config
DELETE /children/:id
```

### Lessons

```text
POST /lessons/session
POST /lessons/generate-question
POST /lessons/result
GET  /lessons/session/:id/results
POST /lessons/session/:id/complete
```

### Reports

```text
GET /reports/:childId?days=7
GET /reports/session/:sessionId/stats
```

## Default Demo Children

When no local child profile has been saved, the frontend shows these default profiles:

```text
Be Bo
Be Tho
Be Bi
Be Sao
```

These are local demo profiles with ids like `demo-bo`. They are useful for UI demos and child-flow testing without login.

Server-created child profiles use UUID ids from PostgreSQL.

## Build And Test

### Frontend

```bash
cd frontend
npm run type-check
npm run build
```

### Backend

```bash
cd backend
npm run build
```

Optional backend test scripts:

```bash
npm run test
npm run test:cov
```

## Deployment

### Backend On Render

The repository includes `render.yaml`.

Recommended Render environment variables:

```env
NODE_ENV=production
DATABASE_SYNCHRONIZE=true
DATABASE_URL=your_render_postgres_url
DATABASE_SSL=true
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://numsense.onrender.com/auth/google/callback
JWT_SECRET=your_long_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://numsense-seven.vercel.app
FRONTEND_URLS=https://numsense-seven.vercel.app
FRONTEND_PUBLIC_URL=https://numsense-seven.vercel.app
SEED_DEMO_DATA=true
```

After the schema is created successfully, set this to safer value:

```env
DATABASE_SYNCHRONIZE=false
```

### Frontend On Vercel

Set this Vercel environment variable:

```env
VITE_API_BASE_URL=https://numsense.onrender.com
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

## Common Production Issues

### `POST /children` returns 500

Make sure the deployed backend includes the latest fix that ignores client-provided `id` values during child creation. Server child ids must be generated as PostgreSQL UUID values.

### Child delete returns 401 for `demo-*`

Demo profiles are local-only profiles. The frontend deletes `demo-*` and `local-*` profiles from local storage instead of calling the backend.

### Frontend calls `localhost:3001` in production

Set `VITE_API_BASE_URL` on Vercel:

```env
VITE_API_BASE_URL=https://numsense.onrender.com
```

### Vietnamese name displays as mojibake

The frontend includes UTF-8 JWT payload decoding and mojibake repair for parent profile names.

## UI Notes

- The app is mobile-first but has a wider desktop container for presentation.
- Buttons, cards, child chips, and route transitions include animation.
- `prefers-reduced-motion` is respected.
- Touch targets are designed to be large enough for children.

## Security Notes

- Do not commit real `.env` secrets.
- Rotate secrets if they are exposed.
- JWT is currently stored in localStorage for simplicity.
- Production systems should prefer secure HTTP-only cookies.

## License

MIT
