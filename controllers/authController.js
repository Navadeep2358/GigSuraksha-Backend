/*
Auth Controller

Handles:
1. Send Email OTP
2. Verify Email OTP & Register
3. Login (User + Admin)
4. Send Forgot Password OTP
5. Verify Password OTP
6. Reset Password
7. Get Profile
8. Update Profile
9. Change Password
*/

const generateOTP = require("../utils/otpGenerator");
const db = require("../config/db");
const sendEmailOTP = require("../services/emailService");
const bcrypt = require("bcrypt");


/* ========================================
1️⃣ SEND EMAIL OTP
======================================== */

exports.sendEmailOTP = async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 2 * 60 * 1000);

    await sendEmailOTP(email, otp, "REGISTER");

    db.query(
      "INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?,?,?)",
      [email, otp, expiry],
      (err) => {

        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Database error"
          });
        }

        res.json({
          message: "OTP sent to email"
        });

      }
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error sending OTP"
    });

  }

};



/* ========================================
2️⃣ VERIFY EMAIL OTP & REGISTER USER
======================================== */

exports.verifyEmailOTP = async (req, res) => {

  try {

    const { email, otp, name, mobile, password } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP required"
      });
    }

    db.query(
      "SELECT * FROM otp_verifications WHERE email=? AND otp=?",
      [email, otp],
      async (err, result) => {

        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Database error"
          });
        }

        if (result.length === 0) {
          return res.json({
            message: "Invalid OTP"
          });
        }

        const record = result[0];

        if (new Date() > record.expires_at) {
          return res.json({
            message: "OTP expired"
          });
        }

        db.query(
          "SELECT * FROM users WHERE email=?",
          [email],
          async (err, user) => {

            if (user.length > 0) {
              return res.json({
                message: "User already registered. Please login."
              });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
              "INSERT INTO users (name,email,mobile,password) VALUES (?,?,?,?)",
              [name, email, mobile, hashedPassword],
              (err) => {

                if (err) {
                  console.log(err);
                  return res.status(500).json({
                    message: "User registration failed"
                  });
                }

                db.query(
                  "DELETE FROM otp_verifications WHERE email=?",
                  [email]
                );

                res.json({
                  message: "Email verified successfully"
                });

              }
            );

          }
        );

      }
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};



/* ========================================
3️⃣ LOGIN (USER + ADMIN)
======================================== */

exports.loginUser = (req, res) => {

  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      message: "All fields required"
    });
  }


  /* ========================================
  ADMIN LOGIN
  ======================================== */

  if (identifier === "admin") {

    db.query(
      "SELECT * FROM admins WHERE admin_id='gigsuraksha_admin'",
      async (err, result) => {

        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Database error"
          });
        }

        if (result.length === 0) {
          return res.json({
            message: "Admin not found"
          });
        }

        const admin = result[0];

        const match = await bcrypt.compare(password, admin.password_hash);

        if (!match) {
          return res.json({
            message: "Invalid Admin Password"
          });
        }

        const otp = generateOTP();

        req.session.adminOTP = otp;
        req.session.adminID = admin.id;

        await sendEmailOTP(admin.email, otp);

        return res.json({
          message: "Admin OTP sent",
          role: "admin"
        });

      }
    );

    return;
  }


  /* ========================================
  USER LOGIN
  ======================================== */

  db.query(
    "SELECT * FROM users WHERE email=? OR mobile=?",
    [identifier, identifier],
    async (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Database error"
        });
      }

      if (result.length === 0) {
        return res.json({
          message: "Invalid credentials"
        });
      }

      const user = result[0];

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.json({
          message: "Invalid credentials"
        });
      }

      res.json({
        message: "Login successful",
        role: "user",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile
        }
      });

    }
  );

};



/* ========================================
4️⃣ SEND FORGOT PASSWORD OTP
======================================== */

exports.sendPasswordResetOTP = async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err, result) => {

        if (result.length === 0) {
          return res.json({
            message: "Email not registered"
          });
        }

        const otp = generateOTP();
        const expiry = new Date(Date.now() + 2 * 60 * 1000);

        await sendEmailOTP(email, otp, "FORGOT_PASSWORD");

        db.query(
          "INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?,?,?)",
          [email, otp, expiry],
          () => {

            res.json({
              message: "OTP sent to email"
            });

          }
        );

      }
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};



/* ========================================
5️⃣ VERIFY PASSWORD OTP
======================================== */

exports.verifyPasswordOTP = (req, res) => {

  const { email, otp } = req.body;

  db.query(
    "SELECT * FROM otp_verifications WHERE email=? AND otp=?",
    [email, otp],
    (err, result) => {

      if (result.length === 0) {
        return res.json({
          message: "Invalid OTP"
        });
      }

      const record = result[0];

      if (new Date() > record.expires_at) {
        return res.json({
          message: "OTP expired"
        });
      }

      res.json({
        message: "OTP verified"
      });

    }
  );

};



/* ========================================
6️⃣ RESET PASSWORD
======================================== */

exports.resetPassword = async (req, res) => {

  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "UPDATE users SET password=? WHERE email=?",
    [hashedPassword, email],
    () => {

      db.query(
        "DELETE FROM otp_verifications WHERE email=?",
        [email]
      );

      res.json({
        message: "Password updated successfully"
      });

    }
  );

};



/* ========================================
7️⃣ GET PROFILE
======================================== */

exports.getProfile = (req, res) => {

  const { email } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    (err, result) => {

      if (result.length === 0) {
        return res.json({
          message: "User not found"
        });
      }

      res.json(result[0]);

    }
  );

};



/* ========================================
8️⃣ UPDATE PROFILE
======================================== */

exports.updateProfile = (req, res) => {

  let {
    name,
    mobile,
    email,
    dob,
    address,
    city,
    state,
    pincode,
    vehicle_type,
    vehicle_model,
    vehicle_number,
    platform,
    profile_pic
  } = req.body;

  if (dob) {
    dob = dob.substring(0, 10);
  }

  db.query(
    `UPDATE users SET
      name=?,
      mobile=?,
      dob=?,
      address=?,
      city=?,
      state=?,
      pincode=?,
      vehicle_type=?,
      vehicle_model=?,
      vehicle_number=?,
      platform=?,
      profile_pic=?
      WHERE email=?`,
    [
      name,
      mobile,
      dob,
      address,
      city,
      state,
      pincode,
      vehicle_type,
      vehicle_model,
      vehicle_number,
      platform,
      profile_pic,
      email
    ],
    () => {

      res.json({
        message: "Profile updated successfully"
      });

    }
  );

};



/* ========================================
9️⃣ CHANGE PASSWORD
======================================== */

exports.changePassword = (req, res) => {

  const { email, currentPassword, newPassword } = req.body;

  db.query(
    "SELECT password FROM users WHERE email=?",
    [email],
    async (err, result) => {

      const user = result[0];

      const match = await bcrypt.compare(currentPassword, user.password);

      if (!match) {
        return res.json({
          message: "Current password incorrect"
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE users SET password=? WHERE email=?",
        [hashedPassword, email],
        () => {

          res.json({
            message: "Password updated successfully"
          });

        }
      );

    }
  );

};