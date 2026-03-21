const nodemailer = require("nodemailer");

/*
================================
CREATE TRANSPORTER (SAFE)
================================
*/

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY
  },

  connectionTimeout: 10000, // ✅ avoid long waiting
  greetingTimeout: 10000,
  socketTimeout: 10000
});

/*
================================
SEND EMAIL FUNCTION
================================
*/

const sendEmailOTP = async (email, otp, type) => {

  let subject = "";
  let heading = "";
  let message = "";
  let expiryText = "2 minutes";

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
    expiryText = "1 minute";
  }

  const mailOptions = {
    from: `"GigSuraksha Security" <${process.env.BREVO_SENDER_EMAIL}>`,
    to: email,
    subject: subject,

    html: `
    <div style="background:#f4f6fb;padding:30px;font-family:Arial">

      <div style="max-width:600px;margin:auto;background:white;border-radius:10px;overflow:hidden">

        <div style="background:#2563eb;padding:25px;text-align:center">
          <h1 style="color:white;margin:0">GigSuraksha</h1>
          <p style="color:#dbeafe;margin:5px 0 0;font-size:14px">
            AI Powered Gig Worker Protection Platform
          </p>
        </div>

        <div style="padding:35px">

          <h2>${heading}</h2>

          <p>Hello,</p>

          <p>${message}</p>

          <div style="text-align:center;margin:30px 0">
            <span style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              background:#eef2ff;
              padding:15px 25px;
              border-radius:8px;
              color:#2563eb
            ">
              ${otp}
            </span>
          </div>

          <p>This OTP will expire in <b>${expiryText}</b>.</p>

        </div>

        <div style="background:#f8fafc;padding:15px;text-align:center">
          <p style="font-size:12px;color:#888;margin:0">
            © ${new Date().getFullYear()} GigSuraksha
          </p>
        </div>

      </div>

    </div>
    `
  };

  try {

    await transporter.sendMail(mailOptions);

    console.log(`✅ ${type} OTP email sent`);

  } catch (error) {

    console.log("❌ Email failed (but not breaking app):", error.message);

    // ❗ DO NOT THROW → prevents 502 crash
  }

};

module.exports = sendEmailOTP;