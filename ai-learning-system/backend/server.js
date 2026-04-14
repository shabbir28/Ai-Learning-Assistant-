const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/api/flashcards", require("./routes/flashcardRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "AI Learning Assistant API is running" });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
