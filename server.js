require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/*
================================
CORS CONFIG
================================
*/
app.use(
  cors({
    origin: [
      "http://localhost:5173"
    ],
    credentials: true
  })
);

/*
================================
BODY PARSER
================================
*/
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/*
================================
SESSION CONFIG
================================
*/
app.use(
  session({
    secret: process.env.SESSION_SECRET || "gigsuraksha_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 30
    }
  })
);

/*
================================
ROOT ROUTE
================================
*/
app.get("/", (req, res) => {
  res.json({
    status: "Running",
    project: "GigSuraksha",
    message: "🚀 Backend deployed successfully"
  });
});

/*
================================
ROUTES
================================
*/
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

/*
================================
404 HANDLER
================================
*/
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

/*
================================
SERVER START
================================
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});