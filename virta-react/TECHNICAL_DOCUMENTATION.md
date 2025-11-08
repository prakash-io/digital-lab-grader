# Technical Documentation: Tech Stack & Implementation Logic

## 📚 Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [Core Algorithms & Logic](#core-algorithms--logic)
6. [API Design & Endpoints](#api-design--endpoints)
7. [Data Flow & State Management](#data-flow--state-management)
8. [Real-time Communication](#real-time-communication)
9. [Security Implementation](#security-implementation)
10. [Performance Optimizations](#performance-optimizations)

---

## 🛠️ Tech Stack Overview

### Frontend Stack

#### Core Framework
- **React 19.1.1**: UI library with hooks and functional components
- **React Router DOM 6.30.1**: Client-side routing and navigation
- **Vite 7.1.7**: Build tool and dev server (faster than Webpack)

#### State Management
- **React Context API**: Global state management (AuthContext)
- **useState/useEffect**: Local component state and side effects
- **localStorage**: Client-side persistence (tokens, user data, coins, avatars)

#### UI & Styling
- **Tailwind CSS 3.4.13**: Utility-first CSS framework
- **PostCSS 8.4.47**: CSS processing
- **Autoprefixer**: Automatic vendor prefixing
- **clsx**: Conditional className utility

#### Animation & UI Components
- **Motion (Framer Motion) 12.23.24**: Animation library for page transitions
- **Tabler Icons**: Icon library
- **shadcn/ui**: UI component library (Sidebar, Cards)

#### Real-time Communication
- **Socket.IO Client 4.8.1**: WebSocket client for real-time updates

#### Utilities
- **UUID**: Unique identifier generation (for submissions, assignments)

---

### Backend Stack

#### Core Framework
- **Node.js**: JavaScript runtime
- **Express.js 4.18.2**: Web framework and REST API server
- **HTTP Server**: HTTP server for Express and Socket.IO

#### Authentication & Security
- **JSON Web Token (JWT) 9.0.2**: Stateless authentication tokens
- **bcryptjs 2.4.3**: Password hashing (bcrypt algorithm)
- **express-rate-limit 8.2.1**: Rate limiting middleware

#### Validation & Data
- **Zod 4.1.12**: Schema validation library (TypeScript-first)
- **UUID 13.0.0**: Unique identifier generation

#### Job Queue & Processing
- **BullMQ 5.63.0**: Redis-based job queue manager
- **ioredis 5.8.2**: Redis client for Node.js
- **Redis 5.9.0**: In-memory data store (job queue backend)

#### Real-time Communication
- **Socket.IO 4.8.1**: WebSocket server for real-time bidirectional communication

#### External Services
- **Piston API**: Code execution sandbox (https://emkc.org/api/v2/piston/execute)
  - Supports: Python, JavaScript, Java, C++, C
  - Provides isolated code execution environment
  - Enforces time and memory limits

#### Data Storage
- **JSON Files**: File-based storage (for development)
  - `data/users.json`: User accounts
  - `data/assignments.json`: Assignments
  - `data/submissions.json`: Code submissions
  - `data/grades.json`: Student grades
  - `data/announcements.json`: Announcements
  - `data/notifications.json`: Notifications

---

## 🏗️ Architecture & Design Patterns

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │   Services   │     │
│  │              │  │              │  │              │     │
│  │ - Dashboard  │  │ - Sidebar    │  │ - API Calls  │     │
│  │ - CodeEditor │  │ - Cards      │  │ - Auth       │     │
│  │ - Assignments│  │ - Forms      │  │ - Socket.IO  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Context API   │                        │
│                    │  (Auth State)  │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   REST API      │
                    │   (Express)     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  Auth Routes   │  │ Assignment      │  │ Submission     │
│  - Signup      │  │ Routes          │  │ Routes         │
│  - Login       │  │ - CRUD          │  │ - Submit       │
│  - Verify      │  │ - Validation    │  │ - Poll Status  │
└────────────────┘  └────────┬────────┘  └────────┬────────┘
                             │                    │
                    ┌────────▼────────┐  ┌────────▼────────┐
                    │  Data Storage   │  │  Job Queue      │
                    │  (JSON Files)   │  │  (BullMQ/Redis) │
                    └─────────────────┘  └────────┬────────┘
                                                  │
                                          ┌───────▼────────┐
                                          │  Worker        │
                                          │  (Grading)     │
                                          └───────┬────────┘
                                                  │
                                          ┌───────▼────────┐
                                          │  Piston API    │
                                          │  (Sandbox)     │
                                          └────────────────┘
```

### Design Patterns Used

#### 1. **MVC (Model-View-Controller) Pattern**
- **Model**: Data storage (JSON files, Redis)
- **View**: React components (Pages, UI components)
- **Controller**: Express routes and handlers

#### 2. **Provider Pattern (Context API)**
- `AuthProvider`: Centralized authentication state
- Provides `user`, `token`, `login`, `logout` to all components

#### 3. **Service Layer Pattern**
- `authService.js`: Authentication API calls
- `apiService.js`: Assignment, submission, notification API calls
- `socketService.js`: WebSocket communication

#### 4. **Repository Pattern**
- `dataStorage.js`: Data access layer (CRUD operations)
- Abstracts file operations from business logic

#### 5. **Worker Pattern**
- `submissionWorker.js`: Background job processor
- Processes submissions asynchronously using BullMQ

#### 6. **Singleton Pattern**
- Redis connection: Single instance shared across application
- Job queue: Single queue instance

#### 7. **Strategy Pattern**
- Scoring algorithms: Different strategies for correctness, efficiency, code quality
- Fallback strategy: Synchronous processing when Redis unavailable

---

## 💻 Frontend Implementation

### Component Structure

#### Page Components
```javascript
// Route-based components
- Dashboard.jsx: Student dashboard
- InstructorDashboard.jsx: Teacher dashboard
- CodeEditor.jsx: Code editor with assignment
- StudentAssignments.jsx: Assignment list
- TeacherAssignments.jsx: Assignment management
- Leaderboard.jsx: Student rankings
- Profile.jsx: User profile
- Store.jsx: Avatar shop
```

#### UI Components
```javascript
// Reusable components
- Sidebar: Navigation sidebar
- Card: Hover effect cards
- NotificationButton: Notification bell
- ThemeToggle: Dark/light mode toggle
- LoginSignupForm: Authentication form
```

### State Management

#### Global State (Context API)
```javascript
// AuthContext.jsx
const AuthContext = createContext({
  user: User | null,
  token: string | null,
  loading: boolean,
  login: (userData, token) => void,
  logout: () => void,
  updateUser: (userData) => Promise<User>,
  isAuthenticated: boolean
});
```

#### Local State (useState)
```javascript
// CodeEditor.jsx
const [code, setCode] = useState("");
const [language, setLanguage] = useState("python");
const [output, setOutput] = useState("");
const [gradingResults, setGradingResults] = useState(null);
const [submissionStatus, setSubmissionStatus] = useState(null);
```

#### Persistent State (localStorage)
```javascript
// Stored in localStorage
- token: JWT authentication token
- userData_{userId}: User-specific data (coins, purchasedAvatars)
```

### Routing & Navigation

#### Route Configuration
```javascript
// App.jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/code-editor" element={<ProtectedRoute><CodeEditor /></ProtectedRoute>} />
  // ... more routes
</Routes>
```

#### Protected Routes
```javascript
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return isAuthenticated ? children : <Navigate to="/signup" />;
}
```

#### Page Transitions
```javascript
// AnimatedRoutes.jsx
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, x: -15 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 15 }}
    transition={{ duration: 0.2 }}
  >
    <Routes location={location}>
      {/* routes */}
    </Routes>
  </motion.div>
</AnimatePresence>
```

---

## 🔧 Backend Implementation

### Server Architecture

#### Express Server Setup
```javascript
// server.js
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173" } });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
// ... more routes

// WebSocket
io.on("connection", (socket) => {
  socket.on("join-student-room", (studentId) => {
    socket.join(`student-${studentId}`);
  });
});
```

### Route Handlers

#### Assignment Routes
```javascript
// routes/assignments.js
POST   /api/assignments          // Create assignment
GET    /api/assignments          // Get all assignments (role-aware)
GET    /api/assignments/:id      // Get assignment by ID
PUT    /api/assignments/:id      // Update assignment
```

#### Submission Routes
```javascript
// routes/submissions.js
POST   /api/submissions                    // Create submission
GET    /api/submissions/:id                // Get submission status
GET    /api/submissions/assignment/:id     // Get submissions for assignment
```

#### Public Test Routes
```javascript
// routes/runPublic.js
POST   /api/run-public          // Run public tests (rate-limited)
```

### Data Storage Layer

#### File-based Storage
```javascript
// utils/dataStorage.js
export function createAssignment(assignment) {
  const assignments = readAssignments();
  assignments.push(assignment);
  writeAssignments(assignments);
}

export function getAssignmentById(id) {
  const assignments = readAssignments();
  return assignments.find(a => a.id === id);
}

// Similar functions for:
// - createSubmission, getSubmissionById, updateSubmission
// - createGrade, getGradesByStudent
// - createAnnouncement, getAnnouncements
// - createNotification, getNotificationsByUserId
```

---

## 🧮 Core Algorithms & Logic

### 1. Complexity Analysis Algorithm

#### Algorithm: Runtime Complexity Detection
```javascript
// utils/scoring.js - analyzeComplexity()

function analyzeComplexity(testResults) {
  // 1. Filter and sort test results by input scale
  const sorted = testResults
    .filter(t => t.scale && t.executionTime)
    .sort((a, b) => a.scale - b.scale);

  // 2. Calculate growth ratios
  const scaleRatio = lastScale / firstScale;
  const timeRatio = lastTime / firstTime;

  // 3. Classify complexity based on ratios
  if (timeRatio < 1.2) return "O(1)";           // Constant
  if (timeRatio < Math.log(scaleRatio) * 1.5) return "O(log n)";  // Logarithmic
  if (timeRatio < scaleRatio * 1.5) return "O(n)";                // Linear
  if (timeRatio < scaleRatio * Math.log(scaleRatio) * 1.5) 
    return "O(n log n)";                        // Linearithmic
  if (timeRatio < scaleRatio * scaleRatio * 1.5) 
    return "O(n²)";                             // Quadratic
  return "O(n³)";                               // Cubic
}
```

**Logic**:
- Compares input size growth vs execution time growth
- Uses heuristic thresholds to classify complexity
- More sophisticated analysis could use regression analysis

---

### 2. Correctness Scoring Algorithm

#### Algorithm: Weighted Pass Rate Calculation
```javascript
// utils/scoring.js - calculateCorrectnessScore()

function calculateCorrectnessScore(publicResults, hiddenResults) {
  const publicCount = publicResults.length;
  const hiddenCount = hiddenResults.length;

  // Calculate pass rates
  const publicPassRate = publicCount > 0
    ? publicResults.filter(r => r.passed).length / publicCount
    : 0;

  const hiddenPassRate = hiddenCount > 0
    ? hiddenResults.filter(r => r.passed).length / hiddenCount
    : 0;

  // Weighted formula
  let weightedPassRate;
  if (publicCount === 0 && hiddenCount > 0) {
    weightedPassRate = hiddenPassRate;  // 100% hidden
  } else if (hiddenCount === 0 && publicCount > 0) {
    weightedPassRate = publicPassRate;  // 100% public
  } else {
    // 30% public, 70% hidden
    weightedPassRate = 0.3 * publicPassRate + 0.7 * hiddenPassRate;
  }

  return 6 * weightedPassRate;  // Scale to 0-6
}
```

**Logic**:
- Handles three scenarios: only public, only hidden, both
- Uses weighted average when both exist (30% public, 70% hidden)
- Scales to 0-6 points (60% of total score)

---

### 3. Efficiency Scoring Algorithm

#### Algorithm: Complexity-based Efficiency Score
```javascript
// utils/scoring.js - calculateEfficiencyScore()

const COMPLEXITY_BANDS = {
  "O(1)": 3.0,
  "O(log n)": 2.7,
  "O(n)": 2.2,
  "O(n log n)": 1.6,
  "O(n²)": 0.8,
  "O(n³)": 0.3,
};

function calculateEfficiencyScore(complexity, testResults, baseRuntime) {
  // 1. Get base points from complexity band
  const complexityPoints = COMPLEXITY_BANDS[complexity] || 0.5;

  // 2. Calculate runtime factor (if base runtime provided)
  let runtimeFactor = 1.0;
  if (baseRuntime && testResults.length > 0) {
    const avgRuntime = testResults.reduce((sum, t) => 
      sum + (t.executionTime || 0), 0) / testResults.length;
    const ratio = baseRuntime / avgRuntime;
    runtimeFactor = Math.max(0.6, Math.min(1.0, ratio));  // Clamp 0.6-1.0
  }

  // 3. Penalty: If <80% tests pass, cap efficiency at 50%
  const passRate = testResults.filter(r => r.passed).length / testResults.length;
  if (passRate < 0.8) {
    runtimeFactor = Math.min(runtimeFactor, 0.5);
  }

  // 4. Final score
  return complexityPoints * runtimeFactor;
}
```

**Logic**:
- Base score from complexity classification
- Runtime factor adjusts based on performance (compared to baseline)
- Penalty applied if correctness is low (<80% pass rate)
- Scales to 0-3 points (30% of total score)

---

### 4. Code Quality Analysis Algorithm

#### Algorithm: Static Code Analysis
```javascript
// utils/scoring.js - calculateCodeQualityScore()

function calculateCodeQualityScore(code, language) {
  let score = 1.0;
  const feedback = [];
  const codeLower = code.toLowerCase();

  // 1. Check for infinite loops
  if (language === "python") {
    if (codeLower.includes("while true:") && !codeLower.includes("break")) {
      score -= 0.3;
      feedback.push("Potential infinite loop detected");
    }
  }

  // 2. Check for busy-wait patterns
  if (codeLower.includes("while") && 
      codeLower.includes("time.sleep") && 
      !codeLower.includes("break")) {
    score -= 0.2;
    feedback.push("Potential busy-wait pattern");
  }

  // 3. Check code structure
  const lines = code.split("\n").filter(line => line.trim().length > 0);
  if (lines.length < 3) {
    score -= 0.2;
    feedback.push("Code seems too short");
  }

  // 4. Check naming conventions
  if (codeLower.includes("var1") || 
      codeLower.includes("temp") || 
      codeLower.includes("x =")) {
    score -= 0.1;
    feedback.push("Consider using more descriptive variable names");
  }

  // 5. Check for dead code
  if (codeLower.includes("def ") || codeLower.includes("function ")) {
    const functions = code.match(/(?:def|function)\s+(\w+)/g) || [];
    functions.forEach(func => {
      const funcName = func.match(/(?:def|function)\s+(\w+)/)[1];
      if (!code.includes(`${funcName}(`)) {
        score -= 0.1;
        feedback.push(`Function ${funcName} is defined but not called`);
      }
    });
  }

  return {
    score: Math.max(0, Math.min(1.0, score)),
    feedback: feedback.length > 0 ? feedback : ["Code quality looks good"]
  };
}
```

**Logic**:
- Starts with perfect score (1.0)
- Deducts points for detected issues
- Provides feedback for each issue
- Scales to 0-1 points (10% of total score)

---

### 5. Output Normalization Algorithm

#### Algorithm: Standardized Output Comparison
```javascript
// utils/sandbox.js - normalizeOutput()

function normalizeOutput(output) {
  if (!output) return "";
  
  return output
    .trim()                           // Remove leading/trailing whitespace
    .replace(/\r\n/g, "\n")           // Normalize Windows line endings
    .replace(/\r/g, "\n")             // Normalize Mac line endings
    .replace(/\n+/g, "\n")            // Collapse multiple newlines
    .trim();                          // Final trim
}

function compareOutputs(actual, expected) {
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);
  return normalizedActual === normalizedExpected;
}
```

**Logic**:
- Handles different line ending formats (Windows, Mac, Unix)
- Removes extra whitespace
- Collapses multiple blank lines
- Case-sensitive string comparison

---

### 6. Job Queue Processing Algorithm

#### Algorithm: Asynchronous Submission Processing
```javascript
// workers/submissionWorker.js

async function processSubmission(job) {
  const { submissionId, assignmentId, code, language } = job.data;

  // 1. Update progress: 10%
  job.updateProgress(10);

  // 2. Fetch assignment
  const assignment = getAssignmentById(assignmentId);
  job.updateProgress(20);

  // 3. Run public test cases (20% → 50%)
  const publicTestResults = [];
  for (let i = 0; i < assignment.publicTestCases.length; i++) {
    const result = await runCodeInSandbox({ code, language, ... });
    publicTestResults.push(result);
    job.updateProgress(20 + (i + 1) * (30 / assignment.publicTestCases.length));
  }

  // 4. Run hidden test cases (50% → 80%)
  const hiddenTestResults = [];
  for (let i = 0; i < assignment.hiddenTestCases.length; i++) {
    const result = await runCodeInSandbox({ code, language, ... });
    hiddenTestResults.push(result);
    job.updateProgress(50 + (i + 1) * (30 / assignment.hiddenTestCases.length));
  }

  // 5. Calculate scores (80% → 90%)
  const complexity = analyzeComplexity([...publicTestResults, ...hiddenTestResults]);
  const correctnessScore = calculateCorrectnessScore(publicTestResults, hiddenTestResults);
  const efficiencyScore = calculateEfficiencyScore(complexity, allTestResults);
  const codeQuality = calculateCodeQualityScore(code, language);
  const totalScore = calculateTotalScore(correctnessScore, efficiencyScore.score, codeQuality.score);
  job.updateProgress(90);

  // 6. Save results (90% → 100%)
  updateSubmission(submissionId, { status: "graded", results, ... });
  createOrUpdateGrade({ assignmentId, studentId, grade: totalScore * 10, ... });
  job.updateProgress(100);

  return results;
}
```

**Logic**:
- Processes test cases sequentially
- Updates progress incrementally
- Calculates scores after all tests complete
- Saves results atomically
- Handles errors gracefully

---

## 🌐 API Design & Endpoints

### REST API Structure

#### Authentication Endpoints
```http
POST   /api/auth/signup
Body: { username, email, password, userType }
Response: { user, token }

POST   /api/auth/login
Body: { username, password }
Response: { user, token }

GET    /api/auth/verify
Headers: { Authorization: "Bearer <token>" }
Response: { user }
```

#### Assignment Endpoints
```http
POST   /api/assignments
Body: { title, description, languages, timeLimit, memoryLimit, 
        publicTestCases, hiddenTestCases, dueDate, ... }
Response: { success, assignment }

GET    /api/assignments?role=student
Response: { success, assignments[] }

GET    /api/assignments/:id?role=student
Response: { success, assignment }

PUT    /api/assignments/:id
Body: { title, description, ... }
Response: { success, assignment }
```

#### Submission Endpoints
```http
POST   /api/submissions
Body: { assignmentId, studentId, studentName, code, language }
Response: { success, submission: { id, status, ... } }

GET    /api/submissions/:id
Response: { success, submission: { id, status, results, ... } }

GET    /api/submissions/assignment/:assignmentId
Response: { success, submissions[] }
```

#### Public Test Endpoints
```http
POST   /api/run-public
Body: { assignmentId, code, language }
Rate Limit: 10 requests/minute
Response: { success, results[], summary: { passed, total, passRate } }
```

### API Validation (Zod Schemas)

#### Assignment Schema
```javascript
// utils/validation.js
const assignmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  languages: z.array(z.enum(["python", "javascript", "java", "cpp", "c"])).min(1),
  timeLimit: z.number().int().positive().default(5000),
  memoryLimit: z.number().int().positive().default(256),
  publicTestCases: z.array(testCaseSchema).min(1),
  hiddenTestCases: z.array(testCaseSchema).min(0).default([]),
  dueDate: z.string().datetime().optional().nullable(),
});
```

#### Test Case Schema
```javascript
const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isPublic: z.boolean().optional().default(true),
  scale: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
});
```

---

## 🔄 Data Flow & State Management

### Authentication Flow

```
1. User enters credentials
   ↓
2. Frontend: authService.login(username, password)
   ↓
3. Backend: POST /api/auth/login
   - Validate credentials
   - Hash password with bcrypt
   - Generate JWT token
   ↓
4. Response: { user, token }
   ↓
5. Frontend: AuthContext.login(user, token)
   - Store token in localStorage
   - Store user in context state
   ↓
6. Navigate to dashboard
```

### Assignment Creation Flow

```
1. Teacher fills form
   ↓
2. Frontend: assignmentService.createAssignment(data)
   ↓
3. Backend: POST /api/assignments
   - Validate with Zod schema
   - Create assignment object
   - Save to assignments.json
   ↓
4. WebSocket: io.to("all-students").emit("new-assignment", assignment)
   ↓
5. Students receive real-time notification
   ↓
6. Frontend: Update assignments list
```

### Submission Flow

```
1. Student clicks "Submit"
   ↓
2. Frontend: submissionService.createSubmission(data)
   ↓
3. Backend: POST /api/submissions
   - Validate submission data
   - Create submission record
   - Check Redis availability
   ↓
4a. If Redis available:
    - Enqueue job to BullMQ
    - Return submission ID
    - Worker processes asynchronously
   ↓
4b. If Redis unavailable:
    - Process synchronously
    - Calculate scores immediately
    - Return results in response
   ↓
5. Frontend: Poll GET /api/submissions/:id (every 2 seconds)
   ↓
6. Backend: Return submission status
   ↓
7. Frontend: When status === "graded", display results
```

### Grading Flow (Worker)

```
1. Worker receives job from queue
   ↓
2. Fetch assignment and test cases
   ↓
3. For each public test case:
   - Execute code in Piston API sandbox
   - Compare output with expected output
   - Record result
   ↓
4. For each hidden test case:
   - Execute code in Piston API sandbox
   - Compare output with expected output
   - Record result (hidden from student)
   ↓
5. Analyze complexity from runtime data
   ↓
6. Calculate scores:
   - Correctness: 0-6 points
   - Efficiency: 0-3 points
   - Code Quality: 0-1 points
   ↓
7. Save results to submission
   ↓
8. Create/update grade record
   ↓
9. Update job progress to 100%
```

---

## 📡 Real-time Communication

### WebSocket Implementation

#### Server Side (Socket.IO)
```javascript
// server.js
io.on("connection", (socket) => {
  // Student joins their personal room
  socket.on("join-student-room", (studentId) => {
    socket.join(`student-${studentId}`);
  });

  // Teacher joins their room
  socket.on("join-teacher-room", (teacherId) => {
    socket.join(`teacher-${teacherId}`);
  });

  // Join all students room (for announcements)
  socket.on("join-all-students", () => {
    socket.join("all-students");
  });
});

// Emit events
io.to("all-students").emit("new-assignment", assignment);
io.to("all-students").emit("new-notification", notification);
```

#### Client Side (Socket.IO Client)
```javascript
// services/socketService.js
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export function joinStudentRoom(studentId) {
  socket.emit("join-student-room", studentId);
}

export function on(event, callback) {
  socket.on(event, callback);
}

// Usage in components
useEffect(() => {
  joinStudentRoom(user.id);
  on("new-assignment", (assignment) => {
    setAssignments(prev => [assignment, ...prev]);
  });
}, [user.id]);
```

### Real-time Events

#### Assignment Events
- `new-assignment`: New assignment created (sent to all students)
- `assignment-updated`: Assignment updated (sent to all students)

#### Notification Events
- `new-notification`: New notification created (sent to specific student)
- `new-announcement`: New announcement (sent to all students)

---

## 🔒 Security Implementation

### Authentication Security

#### JWT Token
```javascript
// Backend: Generate token
const token = jwt.sign(
  { userId: user.id, username: user.username, userType: user.userType },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// Backend: Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### Password Hashing
```javascript
// Backend: Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Backend: Verify password
const isValid = await bcrypt.compare(password, user.password);
```

### API Security

#### Rate Limiting
```javascript
// routes/runPublic.js
const runPublicLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,               // 10 requests
  message: "Too many requests"
});

router.post("/", runPublicLimiter, handler);
```

#### Input Validation
```javascript
// All inputs validated with Zod
const validationResult = schema.safeParse(req.body);
if (!validationResult.success) {
  return res.status(400).json({ errors: validationResult.error.errors });
}
```

#### Role-based Access
```javascript
// Students don't see hidden test cases
if (userRole === "student") {
  assignment.hiddenTestCases = [];  // Filter out hidden tests
}
```

### Sandbox Security

#### Code Execution Isolation
- Code runs in Piston API sandbox (isolated environment)
- Time limits enforced (prevents infinite loops)
- Memory limits enforced (prevents memory exhaustion)
- Network access restricted
- File system access restricted

#### Timeout Handling
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeout);

const response = await fetch(url, {
  signal: controller.signal,
  // ... other options
});
```

---

## ⚡ Performance Optimizations

### Frontend Optimizations

#### Code Splitting
- React Router lazy loading (potential optimization)
- Component-level code splitting

#### State Management
- Context API for global state (minimal re-renders)
- Local state for component-specific data
- Memoization for expensive calculations

#### Caching
- localStorage for user data and tokens
- API response caching (potential optimization)

### Backend Optimizations

#### Asynchronous Processing
- BullMQ job queue for background processing
- Non-blocking I/O with async/await
- Concurrent job processing (up to 3 jobs simultaneously)

#### Connection Pooling
- Redis connection pooling
- Database connection reuse (if using database)

#### Error Handling
- Graceful degradation (fallback to synchronous processing)
- Retry logic for transient errors
- Circuit breaker pattern (potential optimization)

### Algorithm Optimizations

#### Complexity Analysis
- Efficient O(n) sorting for test results
- Single-pass analysis for complexity detection
- Cached complexity results (potential optimization)

#### Output Comparison
- Efficient string normalization (O(n) time complexity)
- Early exit on mismatch
- Optimized regex patterns

---

## 📊 Data Structures

### Assignment Data Structure
```javascript
{
  id: "uuid",
  title: "string",
  description: "string",
  languages: ["python", "javascript", ...],
  timeLimit: 5000,
  memoryLimit: 256,
  ioSpec: {
    inputFormat: "string",
    outputFormat: "string",
    constraints: "string"
  },
  publicTestCases: [
    {
      input: "string",
      expectedOutput: "string",
      isPublic: true,
      scale: 4
    }
  ],
  hiddenTestCases: [...],
  teacherId: "string",
  dueDate: "ISO string",
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

### Submission Data Structure
```javascript
{
  id: "uuid",
  assignmentId: "uuid",
  studentId: "string",
  studentName: "string",
  code: "string",
  language: "python",
  status: "pending" | "processing" | "graded" | "error",
  submittedAt: "ISO string",
  results: {
    publicTestResults: [...],
    hiddenTestResults: [...],
    complexity: "O(n)",
    scores: {
      correctness: 4.32,
      efficiency: { score: 2.2, complexity: "O(n)", runtimeFactor: 1.0 },
      codeQuality: 1.0,
      total: 7.52
    },
    feedback: {...}
  },
  runtime: 927,
  grade: 75.2
}
```

---

## 🧪 Testing & Validation

### Validation Layers

#### 1. Client-side Validation
- Form validation (required fields, min/max length)
- Type checking (numbers, strings, etc.)

#### 2. API Validation (Zod)
- Schema validation for all inputs
- Type coercion (string to number for scale)
- Custom error messages

#### 3. Business Logic Validation
- Assignment exists
- Language allowed
- Test cases present
- Time/memory limits valid

### Error Handling

#### Frontend Error Handling
```javascript
try {
  const response = await apiService.createSubmission(data);
  // Handle success
} catch (error) {
  // Display user-friendly error message
  setError(error.message || "An error occurred");
}
```

#### Backend Error Handling
```javascript
try {
  // Process request
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message
  });
}
```

---

## 🚀 Deployment Considerations

### Environment Variables
```env
PORT=3001
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=production
```

### Production Optimizations
- Use database instead of JSON files (PostgreSQL, MongoDB)
- Redis cluster for high availability
- Load balancing for API server
- CDN for static assets
- Monitoring and logging (Winston, Sentry)
- Docker containerization
- Kubernetes orchestration (optional)

---

## 📝 Summary

### Tech Stack Summary
- **Frontend**: React 19 + Vite + Tailwind CSS + Motion
- **Backend**: Node.js + Express + Socket.IO
- **Authentication**: JWT + bcrypt
- **Job Queue**: BullMQ + Redis
- **Code Execution**: Piston API
- **Validation**: Zod
- **Storage**: JSON files (development) / Database (production)

### Key Algorithms
1. **Complexity Analysis**: Runtime vs input size ratio analysis
2. **Correctness Scoring**: Weighted pass rate calculation
3. **Efficiency Scoring**: Complexity band × runtime factor
4. **Code Quality**: Static analysis with heuristic checks
5. **Output Normalization**: String normalization for comparison

### Architecture Patterns
- MVC (Model-View-Controller)
- Provider Pattern (Context API)
- Service Layer Pattern
- Repository Pattern
- Worker Pattern
- Strategy Pattern (fallback mechanisms)

This technical documentation provides a comprehensive overview of the system's implementation, algorithms, and architecture.

