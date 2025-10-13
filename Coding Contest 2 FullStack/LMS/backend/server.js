const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");

require("dotenv").config();
const PORT = process.env.PORT || 5000;

// Init app
const app = express();

// Connect to db
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

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
app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});
