# Scale Field Explanation

## What is "Scale"?

The **Scale** field in test cases represents the **input size** or **problem size** (typically the value of `N` or the size of the input data). It's used for **complexity analysis** to automatically determine the Big O time complexity of a student's algorithm.

## How It Works

### 1. **Input Size Representation**
- **Scale = 4** means the input has size 4 (e.g., N=4, arrays of length 4)
- **Scale = 3** means the input has size 3 (e.g., N=3, arrays of length 3)
- **Scale = 1** is the default if not specified

### 2. **Complexity Analysis Process**

When a student submits their code:

1. **Test Execution**: The system runs all test cases and records:
   - Execution time for each test case
   - Scale (input size) for each test case

2. **Data Collection**: For each test case:
   ```javascript
   {
     scale: 4,           // Input size
     executionTime: 15,  // Time in milliseconds
     passed: true
   }
   ```

3. **Complexity Calculation**: The system analyzes how execution time scales with input size:
   - Sorts test results by scale (smallest to largest)
   - Calculates `scaleRatio = largestScale / smallestScale`
   - Calculates `timeRatio = largestTime / smallestTime`
   - Compares ratios to determine complexity

### 3. **Complexity Detection**

The system detects complexity based on how time grows with scale:

| Complexity | Condition | Example |
|------------|-----------|---------|
| **O(1)** | `timeRatio < 1.2` | Constant time - time doesn't grow |
| **O(log n)** | `timeRatio < log(scaleRatio) * 1.5` | Logarithmic growth |
| **O(n)** | `timeRatio < scaleRatio * 1.5` | Linear growth |
| **O(n log n)** | `timeRatio < scaleRatio * log(scaleRatio) * 1.5` | Linearithmic growth |
| **O(n²)** | `timeRatio < scaleRatio² * 1.5` | Quadratic growth |
| **O(n³)** | Otherwise | Cubic or worse |

### 4. **Efficiency Scoring**

Based on the detected complexity, students get efficiency points (0-3):

| Complexity | Points |
|------------|--------|
| O(1) | 3.0 |
| O(log n) | 2.7 |
| O(n) | 2.2 |
| O(n log n) | 1.6 |
| O(n²) | 0.8 |
| O(n³) | 0.3 |

## Example

### Test Cases for "Minimum Sum of Absolute Differences"

```json
{
  "publicTestCases": [
    {
      "input": "4\n4 1 8 7\n2 3 6 5\n",
      "expectedOutput": "6",
      "scale": 4  // Input size: N=4
    },
    {
      "input": "3\n4 1 2\n2 4 1\n",
      "expectedOutput": "0",
      "scale": 3  // Input size: N=3
    }
  ]
}
```

### How It Works

1. **Student submits code** that solves the problem
2. **System runs both test cases**:
   - Test 1 (scale=4): Takes 20ms
   - Test 2 (scale=3): Takes 15ms
3. **System analyzes**:
   - `scaleRatio = 4/3 = 1.33`
   - `timeRatio = 20/15 = 1.33`
   - Since `timeRatio ≈ scaleRatio`, complexity is **O(n)** (linear)
4. **Student gets efficiency score**: 2.2 points (for O(n) complexity)

## Best Practices

### When Creating Test Cases

1. **Use different scales**: Create test cases with varying input sizes
   - Small: scale=1, 2, 3
   - Medium: scale=10, 20, 50
   - Large: scale=100, 1000, 10000

2. **Scale should reflect input size**: 
   - For array problems: scale = array length
   - For matrix problems: scale = matrix dimensions
   - For graph problems: scale = number of nodes

3. **Include multiple scales**: At least 2-3 test cases with different scales are needed for accurate complexity analysis

### Example: Optimal Test Case Distribution

```json
{
  "publicTestCases": [
    { "input": "3\n...", "expectedOutput": "...", "scale": 3 },
    { "input": "10\n...", "expectedOutput": "...", "scale": 10 },
    { "input": "100\n...", "expectedOutput": "...", "scale": 100 }
  ],
  "hiddenTestCases": [
    { "input": "50\n...", "expectedOutput": "...", "scale": 50 },
    { "input": "1000\n...", "expectedOutput": "...", "scale": 1000 }
  ]
}
```

## Why It Matters

1. **Fair Grading**: Students with efficient algorithms (O(n)) get higher scores than those with inefficient ones (O(n²))

2. **Learning**: Students learn the importance of algorithm efficiency

3. **Automatic Analysis**: No manual code review needed - the system automatically detects complexity

4. **Accurate Assessment**: Provides objective measurement of code efficiency

## Limitations

- **Simplified Analysis**: The current implementation uses a simplified heuristic. For production, consider using more sophisticated analysis tools
- **Minimum 2 Test Cases**: Need at least 2 test cases with different scales for analysis
- **Execution Time Variation**: Actual execution time can vary due to system load, so results may not be 100% accurate

## Summary

**Scale = Input Size (N)**

- Used to analyze algorithm complexity
- Helps determine efficiency score (0-3 points)
- Should reflect the actual problem size
- Multiple test cases with different scales improve accuracy

