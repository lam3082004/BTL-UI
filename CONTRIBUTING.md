# Contributing to NumSense

Thank you for considering contributing to NumSense! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/BTL-UI.git
   cd BTL-UI
   ```

2. **Set up environment**
   ```bash
   # Copy environment templates
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit with your credentials
   vim backend/.env
   vim frontend/.env
   ```

3. **Install dependencies & start**
   ```bash
   docker-compose up -d
   ```

## Development Workflow

### Backend Development

```bash
cd backend
npm install
npm run start:dev
```

The API will be available at `http://localhost:3001`

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Database Migrations

```bash
cd backend
npm run typeorm:migration:generate -- -n MigrationName
npm run typeorm:migration:run
```

## Code Standards

### TypeScript
- All code must be typed (no `any` unless absolutely necessary)
- Use interfaces for data structures
- Follow NestJS module patterns for backend
- Follow React hooks patterns for frontend

### Naming Conventions
- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Components**: PascalCase (e.g., `UserProfile`)
- **Functions/Variables**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Commits
Use conventional commits:
```
feat: Add feature X
fix: Fix bug in Y
docs: Update README
refactor: Refactor Z
test: Add tests for X
```

## Testing

### Backend
```bash
npm run test
npm run test:cov
npm run test:e2e
```

### Frontend
```bash
npm run lint
npm run type-check
```

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'feat: description'`
3. Push to fork: `git push origin feature/your-feature`
4. Open PR with description of changes
5. Ensure all tests pass
6. Request review from maintainers

## Feature Development Areas

### High Priority
- [ ] Teacher dashboard
- [ ] Leaderboards & achievements
- [ ] Multi-language support
- [ ] Mobile app (React Native)

### Medium Priority
- [ ] Advanced analytics
- [ ] ML-based difficulty adjustment
- [ ] Video tutorials
- [ ] Family challenges

### Low Priority
- [ ] Social features
- [ ] Community forums
- [ ] Merchandise store

## Bug Reporting

Please include:
- Step to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs
- Environment (OS, browser, etc.)

## Questions?

Open an issue or contact the team via GitHub Discussions.

Thank you for contributing! 🎉
