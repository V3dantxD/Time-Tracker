const nodemailer = require("nodemailer");

const sendPasskeyEmail = async (email, passkey) => {
  try {
    // If user has set ENV vars, use them, otherwise use a minimal mock/unconfigured transport
    // which just logs to the console for development testing.
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.warn("SMTP credentials not found! Using ethereal email for testing.");
      // Create a test account dynamically if no real config provided
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    }

    const mailOptions = {
      from: '"Time Tracker" <noreply@timetracker.com>',
      to: email,
      subject: "Password Reset Passkey",
      text: `Your password reset passkey is: ${passkey}\n\nIt expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Use the following 4-digit passkey to proceed:</p>
          <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #eee; width: 100px; border-radius: 8px;">
            ${passkey}
          </div>
          <p>This passkey will expire in 10 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully!");

    // If returning an Ethereal mail url, log it safely so dev can check
    if (!process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email.");
  }
};

module.exports = { sendPasskeyEmail };
