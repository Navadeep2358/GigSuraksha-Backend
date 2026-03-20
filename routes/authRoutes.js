const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

/* ========================================
AUTH ROUTES
======================================== */

// Send OTP to email (Registration)
router.post("/send-email-otp", authController.sendEmailOTP);

// Verify OTP and register user
router.post("/verify-email-otp", authController.verifyEmailOTP);

// Login (User + Admin)
router.post("/login", authController.loginUser);


/* ========================================
FORGOT PASSWORD ROUTES
======================================== */

// Send forgot password OTP
router.post("/forgot-password-otp", authController.sendPasswordResetOTP);

// Verify forgot password OTP
router.post("/verify-password-otp", authController.verifyPasswordOTP);

// Reset password
router.post("/reset-password", authController.resetPassword);


/* ========================================
PROFILE ROUTES
======================================== */

// Fetch user profile
router.post("/profile", authController.getProfile);

// Update user profile
router.put("/update-profile", authController.updateProfile);

// Change password
router.put("/change-password", authController.changePassword);


module.exports = router;