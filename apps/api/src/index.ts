import dotenv from "dotenv";
// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";
import { db, tasksTable, type NewTask } from "@repo/database";
import { desc, eq } from "drizzle-orm";
import { taskQueue } from "./queue/taskQueue.js";
import "./workers/taskWorker.js"; // Start the worker
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import validator from "validator";

const app = express();
const PORT = process.env.PORT || 3001;

// Trust Railway's reverse proxy (for X-Forwarded-For header in rate limiting)
app.set('trust proxy', 1);

// Security: Helmet adds various HTTP headers for security
app.use(helmet());

// Security: CORS - Only allow requests from your frontend
// Remove trailing slash from FRONTEND_URL to avoid CORS mismatch
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security: Request size limits to prevent DoS
app.use(express.json({ limit: '10mb' }));

// Security: Global rate limiter (100 requests per 15 minutes per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { ok: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security: Strict rate limiter for task creation (10 per hour per IP)
const taskCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { ok: false, error: 'Too many task submissions. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use(clerkMiddleware());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString() 
  });
});

// Debug endpoint - only available in development
if (process.env.NODE_ENV !== 'production') {
  app.get("/debug/user", clerkMiddleware, async (req: express.Request, res: express.Response) => {
    const { userId } = getAuth(req);
    res.json({ 
      userId,
      hasAuth: !!userId,
      authHeader: req.headers.authorization ? 'present' : 'missing'
    });
  });
}

// Basic test endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Website Q&A API Server",
    version: "1.0.0"
  });
});

// Get all tasks endpoint (requires authentication)
app.get("/api/tasks", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized - No user ID"
      });
    }
    
    // Filter tasks by authenticated user
    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.userId, userId))
      .orderBy(desc(tasksTable.createdAt));
    
    console.log(`📋 Fetched ${tasks.length} tasks for user: ${userId}`);
    
    res.json({ 
      ok: true, 
      data: tasks 
    });
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(500).json({
      ok: false,
      error: "Failed to fetch tasks",
      ...(isDevelopment && error instanceof Error && { details: error.message })
    });
  }
});

// Task submission endpoint (requires authentication + rate limiting)
app.post("/api/tasks", requireAuth(), taskCreationLimiter, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized - No user ID"
      });
    }
    
    console.log("📥 Received task submission:", req.body);
    
    let { url, question } = req.body;
    
    // Security: Validate inputs exist
    if (!url || !question) {
      return res.status(400).json({ 
        ok: false, 
        error: "URL and question are required" 
      });
    }
    
    // Security: Trim whitespace
    url = url.trim();
    question = question.trim();
    
    // Security: Validate URL length
    if (url.length > 200) {
      return res.status(400).json({
        ok: false,
        error: "URL is too long (max 200 characters)"
      });
    }
    
    // Security: Validate question length
    if (question.length > 1000) {
      return res.status(400).json({
        ok: false,
        error: "Question is too long (max 1000 characters)"
      });
    }
    
    // Security: Validate URL format and protocol
    if (!validator.isURL(url, { 
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      allow_underscores: false,
    })) {
      return res.status(400).json({
        ok: false,
        error: "Invalid URL format. Must be a valid HTTP or HTTPS URL"
      });
    }
    
    // Security: Block private/internal IP addresses (SSRF protection)
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Block localhost and private IPs
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
    ];
    
    const privateIPRanges = [
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^169\.254\./, // 169.254.0.0/16 (link-local)
    ];
    
    if (blockedHosts.includes(hostname) || privateIPRanges.some(regex => regex.test(hostname))) {
      return res.status(400).json({
        ok: false,
        error: "Cannot access private or local network addresses"
      });
    }
    
    // Security: Sanitize question (escape HTML)
    question = validator.escape(question);
    
    // Save task to database with authenticated userId
    const newTask: NewTask = {
      userId,
      url,
      question,
      status: 'pending',
    };
    
    const [task] = await db.insert(tasksTable).values(newTask).returning();
    
    if (!task) {
      return res.status(500).json({
        ok: false,
        error: "Failed to create task"
      });
    }
    
    console.log("✅ Task saved to database:", task);
    
    // Add to BullMQ queue for processing
    await taskQueue.add('process-task', {
      taskId: task.id,
      url: task.url,
      question: task.question,
    });
    
    console.log("📤 Task added to queue:", task.id);
    
    res.status(201).json({ 
      ok: true, 
      data: task 
    });
  } catch (error) {
    console.error("❌ Error creating task:", error);
    
    // Security: Don't leak internal error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(500).json({
      ok: false,
      error: "Failed to create task",
      ...(isDevelopment && error instanceof Error && { details: error.message })
    });
  }
});

// Delete task endpoint (requires authentication)
app.delete("/api/tasks/:id", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized"
      });
    }
    
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        ok: false,
        error: "Task ID is required"
      });
    }
    
    // Verify task belongs to user before deleting
    const [task] = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, id));
    
    if (!task) {
      return res.status(404).json({
        ok: false,
        error: "Task not found"
      });
    }
    
    if (task.userId !== userId) {
      return res.status(403).json({
        ok: false,
        error: "Forbidden - Not your task"
      });
    }
    
    // Delete the task
    await db.delete(tasksTable).where(eq(tasksTable.id, id));
    
    console.log(`🗑️ Deleted task ${id} for user ${userId}`);
    
    res.json({
      ok: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(500).json({
      ok: false,
      error: "Failed to delete task",
      ...(isDevelopment && error instanceof Error && { details: error.message })
    });
  }
});

// Retry task endpoint (requires authentication)
app.post("/api/tasks/:id/retry", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized"
      });
    }
    
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        ok: false,
        error: "Task ID is required"
      });
    }
    
    // Verify task belongs to user
    const [task] = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, id));
    
    if (!task) {
      return res.status(404).json({
        ok: false,
        error: "Task not found"
      });
    }
    
    if (task.userId !== userId) {
      return res.status(403).json({
        ok: false,
        error: "Forbidden - Not your task"
      });
    }
    
    // Reset task status
    await db
      .update(tasksTable)
      .set({ 
        status: 'pending',
        error: null,
        answer: null,
        updatedAt: new Date()
      })
      .where(eq(tasksTable.id, id));
    
    // Re-add to queue
    await taskQueue.add('process-task', {
      taskId: task.id,
      url: task.url,
      question: task.question,
    });
    
    console.log(`🔄 Retrying task ${id} for user ${userId}`);
    
    res.json({
      ok: true,
      message: "Task queued for retry"
    });
  } catch (error) {
    console.error("❌ Error retrying task:", error);
    
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(500).json({
      ok: false,
      error: "Failed to retry task",
      ...(isDevelopment && error instanceof Error && { details: error.message })
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
