require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/auth.routes.js");
const projectRoutes = require("./routes/project.routes.js");
const taskRoutes = require("./routes/task.routes.js");
const timeLogRoutes = require("./routes/timeLog.routes.js");
const screenshotRoutes = require("./routes/screenshot.routes.js");
const attendanceRoutes = require("./routes/attendance.routes.js");

const { errorHandler } = require("./middlewares/error.middleware.js");

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" })); // screenshots are base64 encoded
app.use(morgan("dev"));

// Serve uploaded screenshots as static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/timelogs", timeLogRoutes);
app.use("/api/screenshots", screenshotRoutes);
app.use("/api/attendance", attendanceRoutes);

// Error Middleware
app.use(errorHandler);

module.exports = app;
