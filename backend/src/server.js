const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const express = require("express");
const cors = require("cors");

const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const studentsRoutes = require("./routes/studentsRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ==================================================
// BASIC ROUTE
// ==================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillVerify AI Backend is running",
  });
});


// ==================================================
// API HEALTH CHECK
// ==================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "SkillVerify AI",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});


// ==================================================
// RESUME ROUTES
// ==================================================

app.use(
  "/api/resume",
  resumeRoutes
);


// ==================================================
// INTERVIEW ROUTES
// ==================================================

app.use(
  "/api/interview",
  interviewRoutes
);


// ==================================================
// STUDENTS ROUTES
// ==================================================

app.use(
  "/api/students",
  studentsRoutes
);


// ==================================================
// 404 HANDLER
// ==================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});


// ==================================================
// GLOBAL ERROR HANDLER
// ==================================================

app.use((err, req, res, next) => {

  console.error("Server Error:", err);

  // ==================================================
  // MULTER FILE SIZE ERROR
  // ==================================================

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message:
        "Resume file size cannot exceed 5 MB.",
    });
  }


  // ==================================================
  // FILE TYPE ERROR
  // ==================================================

  if (
    err.message &&
    err.message.includes(
      "Only PDF, DOC and DOCX files are allowed"
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Only PDF, DOC and DOCX files are allowed.",
    });
  }


  // ==================================================
  // GENERAL ERROR
  // ==================================================

  return res.status(500).json({
    success: false,
    message:
      "Internal server error.",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : undefined,
  });
});


// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {

  console.log("");

  console.log(
    "=============================================="
  );

  console.log(
    "🚀 SkillVerify AI Backend Started"
  );

  console.log(
    "=============================================="
  );

  console.log(
    `🌐 Server: http://localhost:${PORT}`
  );

  console.log(
    `❤️  Health: http://localhost:${PORT}/api/health`
  );

  console.log(
    `📄 Resume: http://localhost:${PORT}/api/resume/status`
  );

  console.log(
    `🤖 Interview: http://localhost:${PORT}/api/interview`
  );

  console.log(
    "=============================================="
  );

  console.log("");
});