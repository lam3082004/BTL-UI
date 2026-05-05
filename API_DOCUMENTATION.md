# NumSense API Documentation

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://api.numsense.com` (configure as needed)

## Authentication
Most endpoints require JWT authentication via `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

JWT tokens are obtained through Google OAuth login flow.

---

## Endpoints

### Health Check
**Public endpoint** - No authentication required

#### `GET /health`
Check if backend is running.

**Response (200 OK)**
```json
{
  "status": "ok",
  "message": "✨ NumSense Backend is running!"
}
```

---

### Authentication

#### `GET /auth/google`
Initiate Google OAuth login flow.

Redirects to Google login page.

#### `GET /auth/google/callback`
OAuth callback endpoint (called by Google after login).

**Query Parameters**
- `code`: Authorization code from Google

**Response**: Redirects to frontend with URL parameter:
```
http://localhost:5173/parent-dashboard?token=<jwt_token>
```

---

### Children Management
All endpoints require JWT authentication.

#### `POST /children`
Create a new child profile.

**Headers**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "Bé Minh",
  "avatar": "👧",
  "minNumber": 1,
  "maxNumber": 10,
  "allowedOperations": ["ADDITION"]
}
```

**Response (201 Created)**
```json
{
  "id": "uuid",
  "parentId": "uuid",
  "name": "Bé Minh",
  "avatar": "👧",
  "minNumber": 1,
  "maxNumber": 10,
  "allowedOperations": ["ADDITION"],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### `GET /children`
List all children for authenticated parent.

**Response (200 OK)**
```json
[
  {
    "id": "uuid",
    "name": "Bé Minh",
    "avatar": "👧",
    "minNumber": 1,
    "maxNumber": 10,
    "allowedOperations": ["ADDITION", "SUBTRACTION"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### `PUT /children/:id/config`
Update child lesson configuration.

**Request Body**
```json
{
  "minNumber": 5,
  "maxNumber": 20,
  "allowedOperations": ["ADDITION", "SUBTRACTION", "MULTIPLICATION"]
}
```

**Response (200 OK)**
```json
{
  "id": "uuid",
  "name": "Bé Minh",
  "minNumber": 5,
  "maxNumber": 20,
  "allowedOperations": ["ADDITION", "SUBTRACTION", "MULTIPLICATION"]
}
```

#### `DELETE /children/:id`
Delete a child profile (soft delete).

**Response (200 OK)**
```json
{
  "message": "Child deleted successfully"
}
```

---

### Lessons

#### `POST /lessons/session`
Start a new lesson session.

**Request Body**
```json
{
  "childId": "uuid"
}
```

**Response (201 Created)**
```json
{
  "sessionId": "uuid",
  "childId": "uuid",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### `POST /lessons/generate-question`
Generate a new math question.

**Request Body**
```json
{
  "sessionId": "uuid",
  "childId": "uuid"
}
```

**Response (200 OK)**
```json
{
  "question": {
    "expression": "5 + 3",
    "operand1": 5,
    "operand2": 3,
    "operator": "ADDITION",
    "answer": 8
  }
}
```

#### `POST /lessons/result`
Submit an answer to a question.

**Request Body**
```json
{
  "sessionId": "uuid",
  "expression": "5 + 3",
  "userAnswer": 8,
  "responseTimeMs": 2500
}
```

**Response (201 Created)**
```json
{
  "resultId": "uuid",
  "sessionId": "uuid",
  "isCorrect": true,
  "userAnswer": 8,
  "correctAnswer": 8,
  "expression": "5 + 3",
  "responseTimeMs": 2500,
  "createdAt": "2024-01-15T10:32:15Z"
}
```

#### `POST /lessons/session/:id/complete`
Mark a session as completed.

**Response (200 OK)**
```json
{
  "sessionId": "uuid",
  "totalQuestions": 5,
  "completedAt": "2024-01-15T10:35:00Z"
}
```

---

### Reports & Analytics
All endpoints require JWT authentication.

#### `GET /reports/:childId?days=7`
Get child progress report.

**Query Parameters**
- `days`: Filter by time period (7, 30, or 90 days, default: 7)

**Response (200 OK)**
```json
{
  "childId": "uuid",
  "childName": "Bé Minh",
  "period": "7days",
  "statistics": {
    "totalSessions": 5,
    "totalQuestions": 25,
    "correctAnswers": 20,
    "wrongAnswers": 5,
    "correctRate": 0.80,
    "avgResponseTimeMs": 3200
  },
  "responseTimeChart": [
    {
      "question": "Q1",
      "timeMs": 2500,
      "correct": true
    },
    {
      "question": "Q2",
      "timeMs": 3100,
      "correct": true
    }
  ],
  "donutChart": [
    {
      "name": "Correct",
      "value": 20
    },
    {
      "name": "Wrong",
      "value": 5
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid request data",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized - JWT token required or invalid",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied - Child does not belong to this parent",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limiting
- No rate limiting currently implemented (configure as needed for production)

## CORS
- Allowed origins: Configured in backend
- Allowed methods: GET, POST, PUT, DELETE, PATCH
- Allowed headers: Content-Type, Authorization

## Versioning
- Current API version: v1 (implicit)
- Future versions: `/api/v2/...` format

---

## Testing Endpoints

### Using cURL

**Health Check**
```bash
curl http://localhost:3001/health
```

**Google OAuth**
```bash
curl -L http://localhost:3001/auth/google
```

### Using Postman
1. Import endpoints from this documentation
2. Set `{{baseURL}}` to `http://localhost:3001`
3. Add JWT token to Authorization tab (Bearer token)
4. Test endpoints

### Using REST Client (VS Code)
Create a `.http` or `.rest` file with:
```
### Health Check
GET http://localhost:3001/health

### Get Children
GET http://localhost:3001/children
Authorization: Bearer <jwt_token>
```

---

## Database Schema
See [database documentation](./backend/DATABASE.md) for entity relationships and field definitions.

## TypeORM Entities
- `Parent`: User accounts (Google OAuth)
- `Child`: Child profiles with lesson settings
- `LessonSession`: Lesson session tracking
- `QuestionResult`: Individual question results

---

## Development Notes
- All endpoints return JSON responses
- Timestamps are in ISO 8601 format (UTC)
- IDs are UUID v4 format
- Numeric values use appropriate precision for math operations
