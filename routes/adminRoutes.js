const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

/*
========================
VERIFY ADMIN OTP
========================
*/

router.post("/verify-otp", adminController.verifyAdminOTP);


/*
========================
ADMIN LOGOUT
========================
*/

router.post("/logout", adminController.adminLogout);

module.exports = router;