// utils/emailService.js
import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

/**
 * Send email function
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name (welcome, facilityApproved, facilityRejected, requestProcessed)
 * @param {Object} options.data - Data to populate template
 */
export const sendEmail = async (options) => {
  try {
    const { email, subject, template, data } = options;

    // Generate HTML content based on template
    const html = generateTemplate(template, data);

    const mailOptions = {
      from: `"BloodConnect" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Generate HTML template based on template name
 * @param {string} template - Template name
 * @param {Object} data - Template data
 * @returns {string} HTML content
 */
const generateTemplate = (template, data) => {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
      .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
    </style>
  `;

  switch (template) {
    case "welcome":
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to BloodConnect! 🩸</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name || "there"},</h2>
              <p>Thank you for joining BloodConnect as a <strong>${data.role || "member"}</strong>!</p>
              <p>Your account has been successfully created. Here's what you can do:</p>
              <ul>
                <li>✅ Access your personalized dashboard</li>
                <li>✅ Browse and register for blood donation camps</li>
                <li>✅ Track your donation history</li>
                <li>✅ Connect with blood banks and hospitals</li>
              </ul>
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login" class="button">Login to Your Account</a>
              <p style="margin-top: 30px;">If you have any questions, feel free to contact our support team.</p>
              <p>Best regards,<br>The BloodConnect Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BloodConnect. All rights reserved.</p>
              <p>This email was sent to ${data.email || "you"}. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "facilityApproved":
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Approved! ✅</h1>
            </div>
            <div class="content">
              <h2>Congratulations ${data.name || "Facility"}!</h2>
              <p>Your facility account has been <strong style="color: #059669;">approved</strong> by our admin team.</p>
              <p>You can now:</p>
              <ul>
                <li>🔐 Log in to your account</li>
                <li>📊 Access your facility dashboard</li>
                <li>🏥 Manage blood inventory</li>
                <li>📅 Create and manage blood camps</li>
                <li>🔄 Process blood requests</li>
              </ul>
              <a href="${data.loginUrl || process.env.CLIENT_URL + "/login"}" class="button">Login Now</a>
              <p style="margin-top: 30px;">Welcome aboard! We're excited to have you as part of our blood donation network.</p>
              <p>Best regards,<br>The BloodConnect Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BloodConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "facilityRejected":
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Status Update 📋</h1>
            </div>
            <div class="content">
              <h2>Dear ${data.name || "Facility"},</h2>
              <p>We regret to inform you that your facility registration has been <strong style="color: #dc2626;">rejected</strong>.</p>
              <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Reason for rejection:</p>
                <p style="margin: 10px 0 0;">${data.reason || "Verification documents did not meet our requirements."}</p>
              </div>
              <p>You can reapply after addressing the above issues. If you believe this is a mistake or need clarification, please contact our support team:</p>
              <p>📧 <a href="mailto:${data.supportEmail || "support@bloodconnect.org"}">${data.supportEmail || "support@bloodconnect.org"}</a></p>
              <p>We appreciate your interest in joining BloodConnect and hope to work with you in the future.</p>
              <p>Best regards,<br>The BloodConnect Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BloodConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "requestProcessed":
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Blood Request ${data.status === "accepted" ? "Accepted ✅" : "Update 📋"}</h1>
            </div>
            <div class="content">
              <h2>Dear ${data.hospitalName || "Hospital"},</h2>
              <p>Your blood request has been processed:</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Request Details:</strong></p>
                <ul style="list-style: none; padding: 0;">
                  <li>📦 Blood Type: <strong>${data.bloodGroup || "N/A"}</strong></li>
                  <li>📊 Units: <strong>${data.units || 0}</strong></li>
                  <li>📋 Status: <strong style="color: ${data.status === "accepted" ? "#059669" : "#dc2626"};">${data.status || "processed"}</strong></li>
                  <li>🏥 Processed By: <strong>${data.labName || "Blood Lab"}</strong></li>
                </ul>
              </div>
              ${
                data.status === "accepted"
                  ? "<p>Your request has been fulfilled. You can check your inventory for the updated stock.</p>"
                  : "<p>Your request has been rejected. Please try requesting from another blood lab.</p>"
              }
              <a href="${process.env.CLIENT_URL}/dashboard/requests" class="button">View Request Details</a>
              <p style="margin-top: 30px;">Thank you for using BloodConnect!</p>
              <p>Best regards,<br>The BloodConnect Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BloodConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "donationReminder":
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Time to Donate Again! 🩸</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name || "Donor"},</h2>
              <p>It's been 90 days since your last blood donation, and you're now eligible to donate again!</p>
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Your Donation Stats:</strong></p>
                <ul style="list-style: none; padding: 0;">
                  <li>📅 Last Donation: <strong>${data.lastDonation || "N/A"}</strong></li>
                  <li>🩸 Blood Group: <strong>${data.bloodGroup || "N/A"}</strong></li>
                  <li>📊 Total Donations: <strong>${data.totalDonations || 0}</strong></li>
                </ul>
              </div>
              <p>Find a blood donation camp near you and save lives!</p>
              <a href="${process.env.CLIENT_URL}/donor/camps" class="button">Find Camps Near Me</a>
              <p style="margin-top: 30px;">Thank you for being a lifesaver! 🏆</p>
              <p>Best regards,<br>The BloodConnect Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BloodConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      // Default template
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BloodConnect Notification</h1>
            </div>
            <div class="content">
              <h2>Hello,</h2>
              <p>${data.message || "This is an automated notification from BloodConnect."}</p>
              <p>Best regards,<br>The BloodConnect Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BloodConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
  }
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} True if email configuration is valid
 */
export const testEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("❌ Email configuration test failed:", error);
    return false;
  }
};
