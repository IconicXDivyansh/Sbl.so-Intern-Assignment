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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString() 
  });
});

// Debug endpoint to check user ID
app.get("/debug/user", clerkMiddleware, async (req: express.Request, res: express.Response) => {
  const { userId } = getAuth(req);
  res.json({ 
    userId,
    hasAuth: !!userId,
    authHeader: req.headers.authorization ? 'present' : 'missing'
  });
});

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
    res.status(500).json({
      ok: false,
      error: "Failed to fetch tasks"
    });
  }
});

// Task submission endpoint (requires authentication)
app.post("/api/tasks", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized - No user ID"
      });
    }
    
    console.log("📥 Received task submission:", req.body);
    
    const { url, question } = req.body;
    
    if (!url || !question) {
      return res.status(400).json({ 
        ok: false, 
        error: "URL and question are required" 
      });
    }
    
    // Save task to database with authenticated userId
    const newTask: NewTask = {
      userId,
      url,
      question,
      status: 'pending',
    };
    
    const [task] = await db.insert(tasksTable).values(newTask).returning();
    
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
    res.status(500).json({
      ok: false,
      error: "Failed to create task"
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
    res.status(500).json({
      ok: false,
      error: "Failed to delete task"
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
    res.status(500).json({
      ok: false,
      error: "Failed to retry task"
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
