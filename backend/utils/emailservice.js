// ==================== utils/emailService.js ====================
const nodemailer = require("nodemailer");
const { format } = require("date-fns");

require('dotenv').config();

// Validate environment variables
const validateEnvVars = () => {
  const required = ["EMAIL_USER", "EMAIL_PASSWORD"];
  const missing = required.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
    return false;
  }
  return true;
};

// Create reusable transporter with better configuration
const createTransporter = () => {
  if (!validateEnvVars()) {
    console.warn("⚠️ Email service running in limited mode");
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });


    
    // Verify connection
    transporter.verify((error) => {
      if (error) {
        console.error(
          "❌ Email transporter verification failed:",
          error.message
        );
      } else {
        console.log("✅ Email transporter ready");
      }
    });

    return transporter;
  } catch (error) {
    console.error("❌ Failed to create email transporter:", error.message);
    return null;
  }
};

const transporter = createTransporter();

// Helper function to format date
const formatBookingDate = (dateString) => {
  try {
    return format(new Date(dateString), "EEEE, MMMM dd, yyyy");
  } catch (error) {
    console.error("Date formatting error:", error);
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

// Booking confirmation email template
const getBookingConfirmationHTML = (booking) => {
  const formattedDate = formatBookingDate(booking.date);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 20px; 
          background-color: #f5f7fa; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0 0 10px 0; 
          font-size: 32px; 
          font-weight: 700; 
        }
        .header h2 { 
          margin: 0; 
          font-size: 22px; 
          font-weight: 400; 
          opacity: 0.95; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .details { 
          background: #f8f9ff; 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 8px; 
          border-left: 5px solid #667eea; 
        }
        .details h3 { 
          margin-top: 0; 
          color: #667eea; 
          font-size: 18px; 
          margin-bottom: 20px; 
        }
        .detail-row { 
          display: flex; 
          margin-bottom: 12px; 
          padding-bottom: 12px; 
          border-bottom: 1px solid #e8ecf1; 
        }
        .detail-row:last-child { 
          border-bottom: none; 
          margin-bottom: 0; 
          padding-bottom: 0; 
        }
        .detail-label { 
          font-weight: 600; 
          color: #555; 
          min-width: 100px; 
        }
        .detail-value { 
          color: #222; 
        }
        .instructions { 
          background: #fff9e6; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 25px 0; 
          border: 1px solid #ffe58f; 
        }
        .instructions h4 { 
          color: #d48806; 
          margin-top: 0; 
          margin-bottom: 10px; 
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          padding-top: 30px; 
          border-top: 1px solid #eee; 
          color: #666; 
          font-size: 14px; 
        }
        .contact-info { 
          margin-top: 15px; 
          color: #888; 
          font-size: 13px; 
        }
        @media (max-width: 600px) {
          .content { padding: 25px 20px; }
          .header { padding: 30px 20px; }
          .detail-row { flex-direction: column; }
          .detail-label { margin-bottom: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NOVUS</h1>
          <h2>Booking Confirmed!</h2>
        </div>
        <div class="content">
          <p>Dear ${booking.name},</p>
          <p>Thank you for scheduling a consultation with NOVUS. We're excited to speak with you!</p>
          
          <div class="details">
            <h3>📅 Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${booking.time_slot}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">30 minutes</span>
            </div>
            ${
              booking.company
                ? `
            <div class="detail-row">
              <span class="detail-label">Company:</span>
              <span class="detail-value">${booking.company}</span>
            </div>
            `
                : ""
            }
          </div>
          
          <div class="instructions">
            <h4>📋 Important Information</h4>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Please be available 5 minutes before your scheduled time</li>
              <li>You'll receive a meeting link shortly</li>
              <li>Test your audio/video setup in advance</li>
            </ul>
          </div>
          
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          
          <div class="footer">
            <p>Best regards,<br><strong>NOVUS Team</strong></p>
            <div class="contact-info">
              <p>3913 St Andrew's Road | +234 708 279 5914 | contact@novus.com</p>
              <p><a href="https://novus.com" style="color: #667eea; text-decoration: none;">novus.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Contact notification email template
const getContactNotificationHTML = (contact) => {
  const receivedTime = contact.created_at
    ? new Date(contact.created_at).toLocaleString()
    : new Date().toLocaleString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 20px; 
          background-color: #f5f7fa; 
        }
        .container { 
          max-width: 700px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 10px; 
          overflow: hidden; 
          box-shadow: 0 3px 10px rgba(0,0,0,0.1); 
        }
        .header { 
          background: #667eea; 
          color: white; 
          padding: 25px 30px; 
        }
        .header h2 { 
          margin: 0; 
          font-size: 22px; 
        }
        .content { 
          padding: 30px; 
        }
        .info { 
          background: #f8f9ff; 
          padding: 25px; 
          margin-bottom: 25px; 
          border-radius: 8px; 
          border-left: 5px solid #667eea; 
        }
        .field { 
          margin-bottom: 15px; 
          padding-bottom: 15px; 
          border-bottom: 1px solid #e8ecf1; 
        }
        .field:last-child { 
          border-bottom: none; 
          margin-bottom: 0; 
          padding-bottom: 0; 
        }
        .field-label { 
          font-weight: 600; 
          color: #555; 
          display: inline-block; 
          min-width: 80px; 
        }
        .message-content { 
          background: white; 
          border-radius: 6px; 
          padding: 20px; 
          margin-top: 10px; 
          border: 1px solid #e8ecf1; 
          white-space: pre-wrap; 
          word-wrap: break-word; 
        }
        .meta-info { 
          text-align: right; 
          font-size: 13px; 
          color: #888; 
          margin-top: 20px; 
          padding-top: 20px; 
          border-top: 1px solid #eee; 
        }
        .actions { 
          margin-top: 20px; 
        }
        .btn { 
          display: inline-block; 
          background: #667eea; 
          color: white; 
          padding: 10px 20px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin-right: 10px; 
        }
        @media (max-width: 600px) {
          .content { padding: 20px; }
          .field-label { display: block; margin-bottom: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Message</h2>
        </div>
        <div class="content">
          <div class="info">
            <div class="field">
              <span class="field-label">From:</span>
              <strong>${contact.name}</strong> &lt;${contact.email}&gt;
            </div>
            ${
              contact.subject
                ? `
            <div class="field">
              <span class="field-label">Subject:</span>
              ${contact.subject}
            </div>
            `
                : ""
            }
            <div class="field">
              <span class="field-label">Message:</span>
              <div class="message-content">${contact.message}</div>
            </div>
          </div>
          
          <div class="actions">
            <a href="mailto:${contact.email}" class="btn">Reply to ${
    contact.name
  }</a>
          </div>
          
          <div class="meta-info">
            Received: ${receivedTime}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Main email sending functions - KEEPING THE SAME EXPORT STRUCTURE
exports.sendBookingConfirmation = async (booking) => {
  // Validate input
  if (
    !booking ||
    !booking.email ||
    !booking.name ||
    !booking.date ||
    !booking.time_slot
  ) {
    console.error("❌ Invalid booking data provided");
    return false;
  }

  if (!transporter) {
    console.error("❌ Email transporter not available");
    return false;
  }

   validateEnvVars();

  const mailOptions = {
    from: `"NOVUS" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: "Booking Confirmation - NOVUS Consultation",
    html: getBookingConfirmationHTML(booking),

  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent to: ${booking.email}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // Log detailed error for debugging
    if (error.response) {
      console.error("SMTP Error:", error.response);
    }
    return false;
  }
};

exports.sendContactNotification = async (contact) => {
  // Validate input
  if (!contact || !contact.email || !contact.name || !contact.message) {
    console.error("❌ Invalid contact data provided");
    return false;
  }

  if (!transporter) {
    console.error("❌ Email transporter not available");
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (!adminEmail) {
    console.error("❌ No admin email configured");
    return false;
  }

  const mailOptions = {
    from: `"NOVUS Website" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Contact Message from ${contact.name}`,
    html: getContactNotificationHTML(contact),

  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Contact notification email sent");
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // Log detailed error for debugging
    if (error.response) {
      console.error("SMTP Error:", error.response);
    }
    return false;
  }
};

// Optional: Add a test function (won't break existing code)
exports.testEmailService = async () => {
  if (!transporter) {
    return { success: false, message: "Transporter not initialized" };
  }

  try {
    await transporter.verify();
    return { success: true, message: "Email service is ready" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Optional: Add a simple health check
exports.isEmailServiceReady = () => {
  return !!transporter;
};
