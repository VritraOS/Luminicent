import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import http from "http";
import { Server as socketIO } from "socket.io";
import DockerOrchestrator from "./utils/dockerOrchestrator.js";
import uploadRoutes from "./routes/upload.js";
import githubRoutes from "./routes/githubRoutes.js";
import passport from "passport";

// Load environment variables
dotenv.config();

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
      process.env.FRONTEND_URL
    ].filter(Boolean);

const checkOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (process.env.NODE_ENV === 'production' && process.env.CORS_ORIGIN) {
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
  return callback(null, true);
};

const server = http.createServer(app);
const io = new socketIO(server, {
  cors: {
    origin: checkOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const orchestrator = new DockerOrchestrator(io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: checkOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use(passport.initialize());

// Make io and orchestrator accessible to routes middleware
app.use((req, res, next) => {
  req.io = io;
  req.orchestrator = orchestrator;
  next();
});

// Upload routes
app.use('/api', uploadRoutes);

// GitHub Integration routes (supports both /api/github and /auth/github callback paths)
app.use('/api/github', githubRoutes);
app.use('/auth/github', githubRoutes);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinSession', ({ sessionId }) => {
    if (sessionId) {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined session ${sessionId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { app, io };
