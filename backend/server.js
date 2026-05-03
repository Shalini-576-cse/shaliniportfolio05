const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

function normalizeOrigin(origin) {
  if (!origin) {
    return "";
  }

  try {
    return new URL(origin).origin;
  } catch (error) {
    return origin.trim().replace(/\/$/, "");
  }
}

function getRequestOrigin(req) {
  return `${req.protocol}://${req.get("host")}`;
}

function isAllowedOrigin(req) {
  const origin = normalizeOrigin(req.header("Origin"));

  if (!origin) {
    return true;
  }

  return origin === getRequestOrigin(req) || allowedOrigins.includes(origin);
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
mongoose.set("sanitizeFilter", true);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
  );
  next();
});

app.use("/api", (req, res, next) => {
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ success: false, message: "Origin not allowed." });
  }

  next();
});

app.use(cors((req, callback) => {
  callback(null, {
    origin: isAllowedOrigin(req),
    optionsSuccessStatus: 204
  });
}));
app.use(express.json({ limit: "20kb" }));

// MongoDB connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err.message));
} else {
  console.warn("MONGO_URI is not set. Database-backed API routes will return 503.");
}

mongoose.connection.on("error", err => {
  console.error("MongoDB runtime error:", err.message);
});

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend"), {
  etag: true,
  maxAge: "1h",
  setHeaders(res, filePath) {
    if (filePath.endsWith("index.html")) {
      res.setHeader("Cache-Control", "no-store");
    }
  }
}));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/health", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "unavailable"
  });
});

// API routes
app.use("/api/contact", require("./routes/contact"));
app.use("/api/projects", require("./routes/projects"));

app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON body." });
  }

  console.error(err.message);
  res.status(500).json({ success: false, message: "Server error." });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function shutdown() {
  console.log("Shutting down server...");

  const forceExit = setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);

  server.close(() => {
    mongoose.connection.close(false).finally(() => {
      clearTimeout(forceExit);
      process.exit(0);
    });
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
