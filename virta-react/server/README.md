# VirTA Backend Server

Backend API server for the VirTA Digital Lab Grader platform.

## Features

- 🔐 JWT Authentication
- 📝 Assignment Management
- 💻 Code Execution & Auto-grading
- 📊 Submission Processing
- 🔔 Real-time Notifications (WebSocket)
- 📢 Announcements
- 📈 Grades Management

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - WebSocket server
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **BullMQ** - Job queue for auto-grading
- **Redis** - Job queue backend (optional)
- **Zod** - Schema validation
- **Piston API** - Code execution sandbox

## Installation

```bash
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=3001
JWT_SECRET=your-secret-key-here
REDIS_URL=redis://localhost:6379
```

### Redis Setup (Optional)

Redis is required for the auto-grading job queue. Install Redis:

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://redis.io/download
```

**Note:** The application will work without Redis, but auto-grading will be disabled.

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Assignments
- `GET /api/assignments?role=student` - Get all assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `POST /api/assignments` - Create assignment (instructor only)
- `PUT /api/assignments/:id` - Update assignment (instructor only)

### Submissions
- `POST /api/submissions` - Submit code for grading
- `GET /api/submissions/:id` - Get submission status
- `GET /api/submissions/assignment/:assignmentId` - Get submissions for assignment

### Public Tests
- `POST /api/run-public` - Run public test cases (rate-limited: 10 req/min)

### Announcements
- `POST /api/announcements` - Create announcement (instructor only)
- `GET /api/announcements` - Get all announcements

### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `PUT /api/notifications/:notificationId/read` - Mark as read
- `PUT /api/notifications/mark-all-read/:userId` - Mark all as read

### Grades
- `POST /api/grades` - Create/update grade
- `GET /api/grades/student/:studentId` - Get student grades
- `GET /api/grades/assignment/:assignmentId` - Get assignment grades

## WebSocket Events

### Client → Server
- `join-student-room` - Join student room
- `join-teacher-room` - Join teacher room
- `join-all-students` - Join all students room

### Server → Client
- `new-assignment` - New assignment created
- `assignment-updated` - Assignment updated
- `new-announcement` - New announcement
- `new-notification` - New notification

## Auto-Grading System

### Scoring Breakdown (0-10 points)

1. **Correctness (0-6 points)**
   - Formula: `6 * (0.3*publicPassRate + 0.7*hiddenPassRate)`
   - Based on public and hidden test case pass rates

2. **Efficiency (0-3 points)**
   - Complexity analysis: O(1)=3, O(log n)=2.7, O(n)=2.2, O(n log n)=1.6, O(n²)=0.8, O(n³)=0.3
   - Runtime factor: `clamp(0.6, 1.0, T_base/T_user)`
   - Capped at 50% if <80% tests pass

3. **Code Quality (0-1 points)**
   - Static analysis
   - Code structure
   - Naming conventions
   - Dead code detection

### Job Queue

Submissions are processed asynchronously using BullMQ:

1. Submission created → Job enqueued
2. Worker processes job:
   - Fetches assignment and test cases
   - Runs code in sandbox (Piston API)
   - Calculates scores
   - Updates submission status
3. Results available via polling or WebSocket

## Data Storage

Currently using JSON file storage:
- `data/users.json` - User accounts
- `data/assignments.json` - Assignments
- `data/submissions.json` - Submissions
- `data/grades.json` - Grades
- `data/announcements.json` - Announcements
- `data/notifications.json` - Notifications

**Note:** For production, consider using PostgreSQL or MongoDB.

## Error Handling

All errors are returned in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

## Rate Limiting

- Public test execution: 10 requests per minute per IP
- Other endpoints: No rate limiting (add in production)

## Security

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ CORS enabled
- ✅ Input validation with Zod
- ✅ Code execution in sandbox
- ⚠️ Add rate limiting for production
- ⚠️ Add HTTPS for production
- ⚠️ Add request logging
- ⚠️ Replace JSON storage with database

## Testing

```bash
# Run tests (when implemented)
npm test
```

## Troubleshooting

### Redis Connection Error
If Redis is not available, the job queue will be disabled. Submissions will show an error message.

### Port Already in Use
Change the PORT in `.env` or `server.js`

### CORS Errors
Ensure frontend is running on the correct port (default: 5173)

## License

MIT License
