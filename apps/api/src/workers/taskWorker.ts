import dotenv from 'dotenv';
// Load environment variables for the worker
dotenv.config();

import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { db, tasksTable } from '@repo/database';
import { eq } from 'drizzle-orm';
import { scrapeWebsite } from '../services/scraper.js';
import { generateAnswer } from '../services/ai.js';

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
    
    // Generate AI answer based on scraped content
    console.log(`🤖 Generating AI answer...`);
    const aiResponse = await generateAnswer(
      question,
      scrapedData.content,
      scrapedData.title,
      scrapedData.url
    );
    console.log(`✅ AI answer generated using ${aiResponse.model} (${aiResponse.tokensUsed} tokens)`);
    
    // Update with results
    await db
      .update(tasksTable)
      .set({
        status: 'completed',
        answer: aiResponse.answer,
        scrapedContent: {
          title: scrapedData.title,
          content: scrapedData.content,
          url: scrapedData.url,
          timestamp: scrapedData.timestamp.toISOString(),
          aiModel: aiResponse.model,
          tokensUsed: aiResponse.tokensUsed,
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
