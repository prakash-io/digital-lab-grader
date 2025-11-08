import { Queue } from "bullmq";
import Redis from "ioredis";

// Create Redis connection with error handling
let redisConnection;
let queueInstance;

try {
  redisConnection = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn("Redis connection failed after 3 attempts. Job queue will not work without Redis.");
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redisConnection.on("error", (err) => {
    console.warn("Redis connection error:", err.message);
    console.warn("Note: Auto-grading requires Redis. Install Redis for full functionality.");
  });

  redisConnection.on("connect", () => {
    console.log("✅ Redis connected");
  });

  // Create submission queue
  queueInstance = new Queue("submissions", {
    connection: redisConnection,
  });

  // Try to connect
  redisConnection.connect().catch(() => {
    // Connection will fail if Redis is not running, that's ok
  });
} catch (error) {
  console.warn("Failed to initialize Redis connection:", error.message);
  console.warn("Note: Auto-grading requires Redis. Install Redis for full functionality.");
}

// Export queue with fallback - return null if Redis is not available
export const submissionQueue = queueInstance || null;

// Job status storage (in production, use Redis or database)
const jobStatuses = new Map();

export function setJobStatus(jobId, status) {
  jobStatuses.set(jobId, status);
}

export function getJobStatus(jobId) {
  return jobStatuses.get(jobId) || { status: "unknown" };
}

// Export Redis connection for worker
export { redisConnection };

// Check if Redis is available
export function isRedisAvailable() {
  try {
    return redisConnection !== undefined && queueInstance !== undefined && redisConnection.status === "ready";
  } catch (error) {
    return false;
  }
}

