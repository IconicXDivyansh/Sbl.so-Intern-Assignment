import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

// Support both REDIS_URL (production) and REDIS_HOST/PORT (local development)
const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    });

export const taskQueue = new Queue('website-tasks', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      count: 50, // Keep last 50 failed jobs
    },
  },
});

console.log('📦 Task queue initialized');
