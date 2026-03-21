const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,        // ✅ change
  secure: true,     // ✅ change
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY
  }
});

/**
 * type:
 *  - "REGISTER"
 *  - "FORGOT_PASSWORD"
 *  - "ADMIN_LOGIN"
 */

const sendEmailOTP = async (email, otp, type) => {
  try {

    let subject = "";
    let heading = "";
    let message = "";
    let expiryText = "2 minutes";

    // 🔥 Dynamic content based on type
    if (type === "REGISTER") {
      subject = "GigSuraksha Email Verification Code";
      heading = "Email Verification";
      message = `
        Thank you for registering with <b>GigSuraksha</b>.
        Please verify your email using the code below.
      `;
    }

    else if (type === "FORGOT_PASSWORD") {
      subject = "GigSuraksha Password Reset Code";
      heading = "Reset Your Password";
      message = `
        We received a request to reset your password.
        Use the OTP below to proceed with resetting your password.
      `;
    }

    else if (type === "ADMIN_LOGIN") {
      subject = "GigSuraksha Admin Login OTP";
      heading = "Admin Secure Login";
      message = `
        A login attempt was made to the <b>Admin Dashboard</b>.
        Use the OTP below to securely access your account.
      `;
      expiryText = "1 minute"; // 🔐 more strict
    }

    const mailOptions = {
      from: `"GigSuraksha Security" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: subject,

      html: `
      <div style="background:#f4f6fb;padding:30px;font-family:Arial,Helvetica,sans-serif">

        <div style="max-width:600px;margin:auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.1)">

          <!-- HEADER -->
          <div style="background:#2563eb;padding:25px;text-align:center">
            <h1 style="color:white;margin:0;font-size:28px">GigSuraksha</h1>
            <p style="color:#dbeafe;margin:5px 0 0;font-size:14px">
              AI Powered Gig Worker Protection Platform
            </p>
          </div>

          <!-- BODY -->
          <div style="padding:35px">

            <h2 style="margin-top:0;color:#111">${heading}</h2>

            <p style="font-size:15px;color:#444">Hello,</p>

            <p style="font-size:15px;color:#444;line-height:1.6">
              ${message}
            </p>

            <!-- OTP BOX -->
            <div style="text-align:center;margin:35px 0">
              <span style="
                font-size:36px;
                font-weight:bold;
                letter-spacing:10px;
                background:#eef2ff;
                padding:18px 30px;
                border-radius:8px;
                display:inline-block;
                color:#2563eb
              ">
                ${otp}
              </span>
            </div>

            <p style="font-size:15px;color:#444">
              This OTP will expire in <b>${expiryText}</b>.
            </p>

            <p style="font-size:14px;color:#666;line-height:1.6">
              If you did not request this, please ignore this email.
            </p>

            <hr style="border:none;border-top:1px solid #eee;margin:30px 0">

            <p style="font-size:13px;color:#666;line-height:1.6">
              <b>About GigSuraksha</b><br>
              AI-powered platform protecting gig workers from income loss due to weather risks.
            </p>

          </div>

          <!-- FOOTER -->
          <div style="background:#f8fafc;padding:18px;text-align:center">
            <p style="font-size:12px;color:#888;margin:0">
              © ${new Date().getFullYear()} GigSuraksha
            </p>
            <p style="font-size:12px;color:#aaa;margin:5px 0 0">
              Secure Authentication System
            </p>
          </div>

        </div>
      </div>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`${type} OTP email sent successfully`);

  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = sendEmailOTP;