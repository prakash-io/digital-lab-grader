# VirTA Auto-Grading System

## Features

- **Code Assignment Creation**: Teachers can create assignments with:
  - Multiple programming languages (Python, JavaScript, Java, C++, C)
  - Time and memory limits
  - Public and hidden test cases
  - I/O specifications and constraints
  - Due dates

- **Auto-Grading System**:
  - Correctness scoring (0-6): Based on public and hidden test cases
  - Efficiency scoring (0-3): Based on algorithm complexity analysis
  - Code quality scoring (0-1): Static analysis for code quality
  - Total score: 0-10 scale

- **Student Features**:
  - Run code with custom input
  - Run public tests before submission
  - Submit code for auto-grading
  - View real-time grading progress
  - View detailed grading results with feedback

## Setup

### Prerequisites

- Node.js (v16+)
- Redis (required for auto-grading)

### Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Install and start Redis:

**macOS:**
```bash
brew install redis
redis-server
```

**Linux:**
```bash
sudo apt-get install redis-server
redis-server
```

**Windows:**
Download and install Redis from https://redis.io/download

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

### Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-here
```

## API Endpoints

### Assignments

- `POST /api/assignments` - Create assignment (Teacher only)
- `GET /api/assignments?role=student` - Get assignments (role-aware)
- `GET /api/assignments/:id?role=student` - Get assignment by ID
- `GET /api/assignments/teacher/:teacherId` - Get teacher's assignments

### Submissions

- `POST /api/submissions` - Submit code for grading
- `GET /api/submissions/:id` - Get submission status and results
- `GET /api/submissions/assignment/:assignmentId` - Get submissions for an assignment
- `GET /api/submissions/student/:studentId` - Get student's submissions

### Run Public Tests

- `POST /api/run-public` - Run public tests only (rate-limited: 10 requests/minute)

### Grades

- `POST /api/grades` - Create or update grade
- `GET /api/grades/assignment/:assignmentId` - Get grades for an assignment
- `GET /api/grades/student/:studentId` - Get student's grades

## Scoring System

### Correctness (0-6 points)
- Formula: `6 * (0.3 * publicPassRate + 0.7 * hiddenPassRate)`
- Based on percentage of test cases passed
- Weighted: 30% public tests, 70% hidden tests

### Efficiency (0-3 points)
- Complexity bands:
  - O(1): 3.0 points
  - O(log n): 2.7 points
  - O(n): 2.2 points
  - O(n log n): 1.6 points
  - O(n²): 0.8 points
  - O(n³): 0.3 points
- Runtime factor: `clamp(0.6, 1.0, T_base / T_user)`
- If <80% tests pass, efficiency is capped at 50%

### Code Quality (0-1 points)
- Static analysis checks:
  - No obvious infinite loops
  - No busy-wait patterns
  - Reasonable code structure
  - Descriptive variable names
  - No dead code

## Architecture

### Backend
- **Express.js** - REST API server
- **BullMQ** - Job queue for async grading
- **Redis** - Job queue backend
- **Piston API** - Code execution sandbox
- **Zod** - Input validation
- **Socket.IO** - Real-time updates

### Worker
- Processes submissions asynchronously
- Runs code in sandbox with time/memory limits
- Executes test cases
- Calculates scores
- Stores results

### Data Storage
- JSON files for development (can be replaced with database)
- Stores: assignments, submissions, grades, announcements, notifications

## Notes

- Redis is required for auto-grading. If Redis is not available, submissions will fail with an error message.
- The system uses Piston API for code execution. For production, consider using a more secure sandbox solution.
- Complexity analysis is simplified. For production, use more sophisticated analysis tools.
- Code quality checks are basic. For production, use static analysis tools like ESLint, Pylint, etc.
