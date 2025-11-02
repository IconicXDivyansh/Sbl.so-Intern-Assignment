import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { db, tasksTable } from '@repo/database';
import { eq } from 'drizzle-orm';
import { scrapeWebsite } from '../services/scraper.js';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

interface TaskJobData {
  taskId: string;
  url: string;
  question: string;
}

async function processTask(job: Job<TaskJobData>) {
  const { taskId, url, question } = job.data;
  
  console.log(`🔄 Processing task ${taskId}: ${url}`);
  
  try {
    // Update status to processing
    await db
      .update(tasksTable)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(tasksTable.id, taskId));
    
    // Scrape the website
    console.log(`📝 Scraping ${url}...`);
    const scrapedData = await scrapeWebsite(url);
    console.log(`✅ Scraped ${scrapedData.content.length} characters from ${scrapedData.title}`);
    
    // TODO: Add AI processing logic here
    console.log(`🤖 Processing with AI...`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing
    
    const mockAnswer = `This is a mock answer for: "${question}". The website "${scrapedData.title}" at ${url} has been analyzed. Content preview: ${scrapedData.content.substring(0, 200)}...`;
    
    // Update with results
    await db
      .update(tasksTable)
      .set({
        status: 'completed',
        answer: mockAnswer,
        scrapedContent: {
          title: scrapedData.title,
          content: scrapedData.content,
          url: scrapedData.url,
          timestamp: scrapedData.timestamp.toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(tasksTable.id, taskId));
    
    console.log(`✅ Task ${taskId} completed`);
    return { success: true, taskId };
  } catch (error) {
    console.error(`❌ Task ${taskId} failed:`, error);
    
    // Update with error
    await db
      .update(tasksTable)
      .set({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date(),
      })
      .where(eq(tasksTable.id, taskId));
    
    throw error;
  }
}

export const taskWorker = new Worker<TaskJobData>('website-tasks', processTask, {
  connection,
  concurrency: 5, // Process up to 5 jobs concurrently
});

taskWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

taskWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log('👷 Task worker started');
