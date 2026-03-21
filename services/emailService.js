const axios = require("axios");

const sendEmailOTP = async (email, otp, type) => {

  if (!process.env.BREVO_SMTP_KEY || !process.env.BREVO_SENDER_EMAIL) {
    console.log("❌ Brevo ENV variables missing");
    return;
  }

  let subject = "";
  let message = "";
  let expiryText = "2 minutes";

  if (type === "REGISTER") {
    subject = "GigSuraksha Email Verification Code";
    message = "Verify your email using the OTP below.";
  }

  else if (type === "FORGOT_PASSWORD") {
    subject = "GigSuraksha Password Reset Code";
    message = "Use this OTP to reset your password.";
  }

  else if (type === "ADMIN_LOGIN") {
    subject = "GigSuraksha Admin Login OTP";
    message = "Use this OTP for secure admin login.";
    expiryText = "1 minute";
  }

  const htmlContent = `
    <div style="font-family:Arial;padding:20px">
      <h2>${subject}</h2>
      <p>${message}</p>
      <h1 style="color:#2563eb;letter-spacing:5px">${otp}</h1>
      <p>Valid for ${expiryText}</p>
    </div>
  `;

  try {

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.BREVO_SENDER_EMAIL,
          name: "GigSuraksha"
        },
        to: [{ email }],
        subject: subject,
        htmlContent: htmlContent
      },
      {
        headers: {
          "api-key": process.env.BREVO_SMTP_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Email sent successfully:", response.data.messageId);

  } catch (error) {

    console.log("❌ Email failed:");
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    console.log("Message:", error.message);

  }

};

module.exports = sendEmailOTP;