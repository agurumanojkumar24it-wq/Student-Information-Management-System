import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import markRoutes from "./routes/markRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "StudentHub backend is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", markRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `StudentHub backend running on http://localhost:${PORT}`
  );
});