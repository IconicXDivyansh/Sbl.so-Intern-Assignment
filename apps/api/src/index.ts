import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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
app.post("/api/tasks", (req, res) => {
  console.log("📥 Received task submission:", req.body);
  
  const { url, question } = req.body;
  
  if (!url || !question) {
    return res.status(400).json({ 
      ok: false, 
      error: "URL and question are required" 
    });
  }
  
  // TODO: Add to BullMQ queue, save to database
  const task = {
    id: Date.now().toString(),
    url,
    question,
    status: "queued",
    createdAt: new Date().toISOString(),
  };
  
  console.log("✅ Task created:", task);
  
  res.status(201).json({ 
    ok: true, 
    data: task 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
