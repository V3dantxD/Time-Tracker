const nodemailer = require("nodemailer");

// ── shared transporter factory ───────────────────────────────────────────────
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  console.warn("SMTP credentials not found! Using ethereal email for testing.");
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

// ── password reset passkey ───────────────────────────────────────────────────
const sendPasskeyEmail = async (email, passkey) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
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
    });

    console.log("Mail sent successfully!");
    if (!process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email.");
  }
};

// ── low-productivity admin alert ─────────────────────────────────────────────
const sendLowProductivityAlert = async (
  adminEmail,
  memberName,
  memberEmail,
  productivityPct,
) => {
  try {
    const transporter = await createTransporter();

    const scoreColor =
      productivityPct < 15
        ? "#ef4444"
        : productivityPct < 25
        ? "#f97316"
        : "#eab308";

    const info = await transporter.sendMail({
      from: '"Time Tracker" <noreply@timetracker.com>',
      to: adminEmail,
      subject: `\u26a0 Low Productivity Alert \u2014 ${memberName}`,
      text: `ALERT: ${memberName} (${memberEmail}) has a productivity score of ${productivityPct}% today \u2014 below the 30% threshold.`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">

        <!-- header -->
        <tr>
          <td style="background:linear-gradient(135deg,#ef444420,#f9731610);
                     border-bottom:1px solid #ef444430;padding:24px 32px;">
            <p style="margin:0 0 10px;font-size:26px;">&#9888;</p>
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#f8fafc;">
              Low Productivity Alert
            </h1>
            <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">
              Time Tracker Monitoring System
            </p>
          </td>
        </tr>

        <!-- body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;font-size:15px;color:#cbd5e1;line-height:1.6;">
              An employee's productivity has fallen below the
              <strong style="color:#f8fafc;">30% threshold</strong>
              for today's workday.
            </p>

            <!-- member card -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#0f172a;border-radius:12px;border:1px solid #334155;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:44px;height:44px;background:#1e3a5f;border:1px solid #3b82f630;
                                 border-radius:10px;text-align:center;vertical-align:middle;
                                 font-size:20px;font-weight:700;color:#60a5fa;">
                        ${memberName.charAt(0).toUpperCase()}
                      </td>
                      <td style="padding-left:14px;vertical-align:middle;">
                        <p style="margin:0;font-size:15px;font-weight:600;color:#f8fafc;">${memberName}</p>
                        <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${memberEmail}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- score block -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center"
                  style="background:#0f172a;border-radius:12px;border:1px solid #334155;padding:24px 16px;">
                  <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;
                             letter-spacing:0.1em;color:#64748b;">
                    Today's Productivity Score
                  </p>
                  <p style="margin:0;font-size:52px;font-weight:800;color:${scoreColor};">
                    ${productivityPct}%
                  </p>
                  <p style="margin:6px 0 16px;font-size:12px;color:#475569;">
                    Threshold: 30% of 8-hour workday
                  </p>
                  <!-- progress bar -->
                  <table width="260" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      <td style="background:#1e293b;border-radius:99px;height:8px;overflow:hidden;">
                        <div style="width:${Math.min(productivityPct, 100)}%;min-width:4px;height:8px;
                                    background:${scoreColor};border-radius:99px;"></div>
                      </td>
                    </tr>
                  </table>
                  <table width="260" cellpadding="0" cellspacing="0" style="margin:4px auto 0;">
                    <tr>
                      <td style="font-size:10px;color:#475569;">0%</td>
                      <td align="center" style="font-size:10px;color:#ef4444;">
                        30% &#8592; threshold
                      </td>
                      <td align="right" style="font-size:10px;color:#475569;">100%</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
              This alert fires when keyboard/mouse active time is below
              <strong style="color:#94a3b8;">2 hours 24 minutes</strong>
              (30% of 8 hours) for the day.
              Review the <strong style="color:#94a3b8;">Monitoring</strong> tab
              in your admin dashboard for full details.
            </p>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="padding:14px 32px;border-top:1px solid #1e293b;">
            <p style="margin:0;font-size:11px;color:#334155;text-align:center;">
              Time Tracker &mdash; Automated Monitoring Alert &middot;
              Do not reply to this email
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });

    console.log(
      `Low-productivity alert sent to ${adminEmail} about ${memberName}`,
    );
    if (!process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error("Error sending low-productivity alert:", error);
    throw error;
  }
};

module.exports = { sendPasskeyEmail, sendLowProductivityAlert };
