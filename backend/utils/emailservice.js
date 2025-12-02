// ==================== utils/emailService.js ====================
const brevo = require('@getbrevo/brevo');
const { format } = require('date-fns');
require('dotenv').config();

// Validate env config
const validateEnvVars = () => {
  const required = ["BREVO_API_KEY", "BREVO_SENDER_EMAIL", "BREVO_SENDER_NAME"];
  const missing = required.filter(k => !process.env[k]);

  if (missing.length > 0) {
    console.error("❌ Missing Brevo environment variables:", missing.join(", "));
    return false;
  }
  return true;
};

/**
 * NEW Brevo client initializer
 * Fully compatible with @getbrevo/brevo latest SDK
 */
let brevoClient = null;

const initializeBrevoClient = () => {
  if (!validateEnvVars()) return null;

  try {
    const apiInstance = new brevo.TransactionalEmailsApi();

    // new SDK uses setApiKey()
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, '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');

    console.log("✅ Brevo client initialized successfully");
    return apiInstance;
  } catch (error) {
    console.error("❌ Failed to initialize Brevo client:", error.message);
    return null;
  }
};

brevoClient = initializeBrevoClient();

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

// Booking confirmation email template (unchanged)
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

// Contact notification email template (unchanged)
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

// Send email via Brevo SDK
const sendViaBrevo = async (emailConfig) => {
  if (!brevoClient) {
    console.error("❌ Brevo client not initialized");
    return false;
  }

  try {
    const email = new brevo.SendSmtpEmail();

    email.sender = {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL
    };

    email.to = emailConfig.to;
    email.subject = emailConfig.subject;
    email.htmlContent = emailConfig.htmlContent;

    if (emailConfig.replyTo) email.replyTo = emailConfig.replyTo;
    if (emailConfig.headers) email.headers = emailConfig.headers;
    if (emailConfig.params) email.params = emailConfig.params;

    const data = await brevoClient.sendTransacEmail(email);

    console.log("✅ Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("❌ Error sending email via Brevo:", error.message);

    if (error.response && error.response.body) {
      console.error("Brevo Error:", error);
    }

    return false;
  }
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

  const emailConfig = {
    to: [
      {
        email: booking.email,
        name: booking.name
      }
    ],
    subject: "Booking Confirmation - NOVUS Consultation",
    htmlContent: getBookingConfirmationHTML(booking),
    replyTo: {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME
    }
  };

  return await sendViaBrevo(emailConfig);
};

exports.sendContactNotification = async (contact) => {
  // Validate input
  if (!contact || !contact.email || !contact.name || !contact.message) {
    console.error("❌ Invalid contact data provided");
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL;
  if (!adminEmail) {
    console.error("❌ No admin email configured");
    return false;
  }

  const emailConfig = {
    to: [
      {
        email: adminEmail,
        name: "NOVUS Admin"
      }
    ],
    subject: `New Contact Message from ${contact.name}`,
    htmlContent: getContactNotificationHTML(contact),
    replyTo: {
      email: contact.email,
      name: contact.name
    }
  };

  return await sendViaBrevo(emailConfig);
};

// Test function for Brevo
exports.testEmailService = async () => {
  if (!brevoClient) {
    return { success: false, message: "Brevo client not initialized" };
  }

  const testEmailConfig = {
    to: [
      {
        email: process.env.BREVO_SENDER_EMAIL, // Send test to yourself
        name: "Test Recipient"
      }
    ],
    subject: "Brevo Email Service Test",
    htmlContent: `
      <html>
        <body>
          <h1>✅ Brevo Email Service Test</h1>
          <p>If you're reading this, Brevo is configured correctly!</p>
          <p><strong>Sender:</strong> ${process.env.BREVO_SENDER_NAME} &lt;${process.env.BREVO_SENDER_EMAIL}&gt;</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `
  };

  try {
    const result = await sendViaBrevo(testEmailConfig);
    return {
      success: result,
      message: result ? "Brevo email service is working" : "Failed to send test email"
    };
  } catch (error) {
    return {
      success: false,
      message: `Test failed: ${error.message}`
    };
  }
};

// Health check function
exports.isEmailServiceReady = () => {
  return brevoClient !== null && validateEnvVars();
};

// Optional: Reinitialize function if API key changes
exports.reinitializeClient = () => {
  brevoClient = initializeBrevoClient();
  return brevoClient !== null;
};

// Optional: Get sender info
exports.getSenderInfo = () => {
  return {
    sender: {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL
    },
    isConfigured: validateEnvVars(),
    clientInitialized: brevoClient !== null
  };
};