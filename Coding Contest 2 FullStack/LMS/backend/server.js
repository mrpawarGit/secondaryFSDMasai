const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const commentRoutes = require("./routes/commentRoutes");
const progressRoutes = require("./routes/progressRoutes");
const activityRoutes = require("./routes/activityRoutes");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a course room
  socket.on("join-course", (courseId) => {
    socket.join(`course-${courseId}`);
    console.log(`Socket ${socket.id} joined course-${courseId}`);
  });

  // Leave a course room
  socket.on("leave-course", (courseId) => {
    socket.leave(`course-${courseId}`);
    console.log(`Socket ${socket.id} left course-${courseId}`);
  });

  // Join a lesson room
  socket.on("join-lesson", (lessonId) => {
    socket.join(`lesson-${lessonId}`);
    console.log(`Socket ${socket.id} joined lesson-${lessonId}`);
  });

  // Leave a lesson room
  socket.on("leave-lesson", (lessonId) => {
    socket.leave(`lesson-${lessonId}`);
    console.log(`Socket ${socket.id} left lesson-${lessonId}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", lessonRoutes);
app.use("/api", commentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/activities", activityRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Collaborative LMS API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io };
