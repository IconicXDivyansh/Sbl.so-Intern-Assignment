import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db, tasksTable, type NewTask } from "@repo/database";
import { taskQueue } from "./queue/taskQueue.js";
import "./workers/taskWorker.js"; // Start the worker

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString() 
  });
});

// Basic test endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Website Q&A API Server",
    version: "1.0.0"
  });
});

// Task submission endpoint
app.post("/api/tasks", async (req, res) => {
  try {
    console.log("📥 Received task submission:", req.body);
    
    const { url, question, userId } = req.body;
    
    if (!url || !question) {
      return res.status(400).json({ 
        ok: false, 
        error: "URL and question are required" 
      });
    }
    
    // Save task to database
    const newTask: NewTask = {
      userId: userId || 'anonymous',
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

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
