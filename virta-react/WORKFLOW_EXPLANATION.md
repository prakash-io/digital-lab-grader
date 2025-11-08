# Assignment & Auto-Grading Workflow Explanation

## 📋 Overview
This document explains the complete workflow from assignment creation by teachers to final grading of student submissions in the VirTA digital lab grader system.

---

## 🔄 Complete Workflow

### Phase 1: Assignment Creation (Teacher Side)

#### 1.1 Teacher Creates Assignment
- **Location**: Teacher Dashboard → Assignments
- **Actions**:
  - Teacher fills in assignment details:
    - **Title**: Assignment name
    - **Description**: Problem statement with examples
    - **Languages**: Allowed programming languages (Python, JavaScript, Java, C++, C)
    - **Time Limit**: Maximum execution time (default: 5000ms)
    - **Memory Limit**: Maximum memory usage (default: 256MB)
    - **Input/Output Format**: Specification for input/output format
    - **Constraints**: Problem constraints (e.g., 1 ≤ N ≤ 10^5)
    - **Due Date**: Submission deadline
  - **Test Cases**: Teacher creates two types:
    - **Public Test Cases**: Visible to students (used for initial testing)
    - **Hidden Test Cases**: Not visible to students (used for final grading)

#### 1.2 Test Case Structure
Each test case contains:
- **Input**: Test input data (as string)
- **Expected Output**: Expected output (as string)
- **Scale**: Input size (for complexity analysis)
- **isPublic**: Boolean flag (true for public, false for hidden)

**Example Test Case**:
```json
{
  "input": "4\n4 1 8 7\n2 3 6 5\n",
  "expectedOutput": "6",
  "isPublic": true,
  "scale": 4
}
```

#### 1.3 Assignment Storage
- Assignment is saved to `server/data/assignments.json`
- WebSocket notification sent to all students
- **Important**: Hidden test cases are **NOT** sent to students

---

### Phase 2: Student Views Assignment

#### 2.1 Student Sees Assignment
- **Location**: Student Dashboard → Assignments
- **What Students See**:
  - Assignment title and description
  - Input/output format specifications
  - Constraints
  - **Public test cases only** (hidden test cases are filtered out)
  - Allowed programming languages
  - Due date

#### 2.2 Student Opens Code Editor
- Student clicks "Open in Code Editor" button
- Assignment data is passed to Code Editor page
- Student can see:
  - Question panel with description and public test cases
  - Code editor with language selection
  - "Test Public" button
  - "Submit" button

---

### Phase 3: Student Develops Solution

#### 3.1 Student Writes Code
- Student writes code in the selected language
- Code is typed in the textarea editor

#### 3.2 Student Tests Code (Optional - Before Submission)
- **Action**: Student clicks "🧪 Test Public" button
- **What Happens**:
  1. Code is sent to `/api/run-public` endpoint
  2. **Rate Limiting**: Maximum 10 requests per minute per IP
  3. Only **public test cases** are executed
  4. Code runs in Piston API sandbox with:
     - Time limit enforcement
     - Memory limit enforcement
     - Input from test case
  5. Output is compared with expected output
  6. Results are displayed:
     - ✅ PASSED or ❌ FAILED for each test case
     - Actual output vs expected output
     - Execution time
     - Error messages (if any)

**Important**: 
- This is **NOT** the final grading
- Only public test cases are run
- No score is calculated
- Student can test multiple times (rate limited)

---

### Phase 4: Student Submits Code

#### 4.1 Submission Process
- **Action**: Student clicks "📤 Submit" button
- **What Happens**:
  1. Code is validated (assignment exists, language allowed)
  2. Submission is created with status: `pending`
  3. Submission is stored in `server/data/submissions.json`
  4. Two paths possible:
     - **Path A**: Redis available → Asynchronous processing (queue)
     - **Path B**: Redis unavailable → Synchronous processing (immediate)

---

### Phase 5: Auto-Grading Process

#### 5.1 Processing Mode: Asynchronous (Redis Available)

**Step 1: Job Enqueued**
- Submission is added to BullMQ queue
- Job ID = Submission ID
- Status: `processing`
- Progress tracking starts

**Step 2: Worker Processes Job**
- BullMQ worker picks up the job
- Progress: 10% - Job started

**Step 3: Run Public Test Cases**
- For each public test case:
  1. Code is executed in Piston API sandbox
  2. Input from test case is provided via stdin
  3. Output is captured (stdout, stderr, exit code)
  4. Output is normalized (trim whitespace, handle newlines)
  5. Actual output is compared with expected output
  6. Test result recorded (passed/failed, execution time, etc.)
- Progress: 20% → 50% (incremental based on test count)

**Step 4: Run Hidden Test Cases**
- Same process as public tests
- **Important**: Students never see hidden test cases
- Progress: 50% → 80%

**Step 5: Complexity Analysis**
- Runtime data from all test cases is analyzed
- Complexity is determined based on:
  - Input scale vs execution time ratio
  - Growth rate analysis
- Possible complexities:
  - O(1) → 3.0 points
  - O(log n) → 2.7 points
  - O(n) → 2.2 points
  - O(n log n) → 1.6 points
  - O(n²) → 0.8 points
  - O(n³) → 0.3 points
- Progress: 80%

**Step 6: Score Calculation**
- Progress: 90%
- Three scores are calculated:

##### A. Correctness Score (0-6 points)
- Formula depends on test case availability:
  - **Only public tests**: `6 × publicPassRate`
  - **Only hidden tests**: `6 × hiddenPassRate`
  - **Both exist**: `6 × (0.3 × publicPassRate + 0.7 × hiddenPassRate)`
- Example:
  - Public: 2/2 passed (100%)
  - Hidden: 5/10 passed (50%)
  - Score: `6 × (0.3 × 1.0 + 0.7 × 0.5) = 6 × 0.65 = 3.9/6`

##### B. Efficiency Score (0-3 points)
- Base points from complexity band (see above)
- Runtime factor: `clamp(0.6, 1.0, baseRuntime / userRuntime)`
- Penalty: If <80% tests pass, efficiency capped at 50%
- Final: `complexityPoints × runtimeFactor`
- Example:
  - Complexity: O(n) → 2.2 points
  - Runtime factor: 1.0 (good performance)
  - Score: `2.2 × 1.0 = 2.2/3`

##### C. Code Quality Score (0-1 points)
- Static analysis checks:
  - ✅ No infinite loops detected
  - ✅ No busy-wait patterns
  - ✅ Reasonable code structure
  - ✅ Descriptive variable names
  - ✅ No dead code (unused functions)
- Starts at 1.0, deductions for issues
- Example:
  - No issues found → 1.0/1

##### D. Total Score (0-10 points)
- Sum of all three scores
- Example: `3.9 + 2.2 + 1.0 = 7.1/10`
- Converted to 0-100 scale: `7.1 × 10 = 71/100`

**Step 7: Save Results**
- Submission status updated to `graded`
- Results saved to submission record
- Grade record created/updated
- Progress: 100%

**Step 8: Student Polls for Results**
- Frontend polls `/api/submissions/:id` every 2 seconds
- When status becomes `graded`, results are displayed
- Polling stops

---

#### 5.2 Processing Mode: Synchronous (Redis Unavailable)

**Fallback Mechanism**:
- If Redis is not available, submission is processed immediately
- Same steps as asynchronous mode, but:
  - No job queue
  - No progress tracking
  - Results returned immediately in response
  - Student sees results right away (no polling needed)

---

### Phase 6: Results Display

#### 6.1 Grading Results Card
Student sees a purple card with:
- **Total Score**: X.XX/10 (converted to 0-100 scale)
- **Correctness**: X.XX/6
- **Efficiency**: X.XX/3
- **Code Quality**: X.XX/1
- **Complexity**: O(n), O(n²), etc.
- **Feedback**: Detailed feedback for each component

#### 6.2 What Students See
- ✅ **Public test results**: All public test cases (passed/failed)
- ❌ **Hidden test results**: Only pass/fail counts (no input/output)
- 📊 **Score breakdown**: Correctness, efficiency, code quality
- 💬 **Feedback**: Explanations for scores

#### 6.3 What Students DON'T See
- ❌ Hidden test case inputs
- ❌ Hidden test case expected outputs
- ❌ Hidden test case actual outputs
- ❌ Detailed hidden test results

---

## 🔍 Detailed Component Explanations

### Test Case Execution (Sandbox)

**Piston API Integration**:
```javascript
{
  language: "python",
  version: "*",
  files: [{ name: "main.py", content: code }],
  stdin: testCaseInput,
  compile_timeout: 10000,
  run_timeout: 5000,
  compile_memory_limit: 256 * 1024 * 1024,
  run_memory_limit: 256 * 1024 * 1024
}
```

**Output Normalization**:
- Trim leading/trailing whitespace
- Normalize line endings (CRLF → LF)
- Remove extra blank lines
- Compare normalized strings

---

### Scoring Formula Breakdown

#### Correctness Score
```
IF only public tests:
  score = 6 × (publicPassed / publicTotal)
ELSE IF only hidden tests:
  score = 6 × (hiddenPassed / hiddenTotal)
ELSE:
  score = 6 × (0.3 × publicPassRate + 0.7 × hiddenPassRate)
```

#### Efficiency Score
```
complexityPoints = COMPLEXITY_BANDS[complexity]
runtimeFactor = clamp(0.6, 1.0, baseRuntime / userRuntime)
IF passRate < 0.8:
  runtimeFactor = min(runtimeFactor, 0.5)
score = complexityPoints × runtimeFactor
```

#### Code Quality Score
```
score = 1.0
IF infinite loop detected:
  score -= 0.3
IF busy-wait pattern:
  score -= 0.2
IF code too short:
  score -= 0.2
IF poor naming:
  score -= 0.1
IF dead code:
  score -= 0.1
score = clamp(0, 1, score)
```

---

## 📊 Example Flow

### Example: Minimum Sum of Absolute Differences

**1. Teacher Creates Assignment**:
- Title: "Minimum Sum of Absolute Differences"
- Languages: Python, C++
- Public Test Cases: 2
- Hidden Test Cases: 5

**2. Student Views Assignment**:
- Sees description and 2 public test cases
- Doesn't see 5 hidden test cases

**3. Student Tests Code**:
- Clicks "Test Public"
- Both public tests pass ✅
- Student is confident

**4. Student Submits Code**:
- Clicks "Submit"
- Submission created
- Auto-grading starts

**5. Auto-Grading**:
- Public tests: 2/2 passed ✅
- Hidden tests: 3/5 passed ❌
- Complexity: O(n log n) → 1.6 points
- Code quality: Good → 1.0 points

**6. Score Calculation**:
- Correctness: `6 × (0.3 × 1.0 + 0.7 × 0.6) = 6 × 0.72 = 4.32/6`
- Efficiency: `1.6 × 1.0 = 1.6/3`
- Code Quality: `1.0/1`
- **Total: `4.32 + 1.6 + 1.0 = 6.92/10` (69.2/100)**

**7. Results Display**:
- Student sees: 6.92/10
- Public tests: 2/2 passed
- Hidden tests: 3/5 passed (count only, no details)
- Feedback: "Passed 2/2 public tests and 3/5 hidden tests"

---

## 🔐 Security Features

1. **Hidden Test Cases**: Never exposed to students
2. **Rate Limiting**: 10 public test runs per minute
3. **Sandbox Execution**: Code runs in isolated Piston API
4. **Time/Memory Limits**: Enforced on every execution
5. **Input Validation**: All inputs validated with Zod schemas
6. **Role-Based Access**: Students can't see hidden tests

---

## 🚀 Performance Considerations

1. **Asynchronous Processing**: Uses BullMQ for background jobs
2. **Concurrency**: Up to 3 submissions processed simultaneously
3. **Fallback**: Synchronous processing if Redis unavailable
4. **Progress Tracking**: Real-time progress updates
5. **Polling**: Frontend polls every 2 seconds for results

---

## 📝 Key Files

- **Assignment Creation**: `server/routes/assignments.js`
- **Submission Handling**: `server/routes/submissions.js`
- **Public Test Execution**: `server/routes/runPublic.js`
- **Auto-Grading Worker**: `server/workers/submissionWorker.js`
- **Scoring Logic**: `server/utils/scoring.js`
- **Sandbox Execution**: `server/utils/sandbox.js`
- **Validation**: `server/utils/validation.js`

---

## 🎯 Summary

1. **Teacher** creates assignment with public + hidden test cases
2. **Student** sees only public test cases
3. **Student** can test code with public tests (rate limited)
4. **Student** submits code for final grading
5. **System** runs both public and hidden test cases
6. **System** calculates correctness, efficiency, and code quality scores
7. **System** displays results (hidden test details hidden from students)
8. **Teacher** can view all submissions and grades

---

This workflow ensures fair grading while maintaining test case security and providing immediate feedback to students.

