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
Allow React frontend
================================
*/

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


/*
================================
BODY PARSER
Increase limit for profile image upload
================================
*/

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


/*
================================
SESSION CONFIG
Used for Admin OTP verification
================================
*/

app.use(
  session({
    secret: "gigsuraksha_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,        // true only if HTTPS
      maxAge: 1000 * 60 * 30 // 30 minutes
    }
  })
);


/*
================================
ROUTES
================================
*/

// User authentication routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);


/*
================================
SERVER START
================================
*/

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});