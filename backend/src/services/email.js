const config = require('../utils/config');
const logger = require('../utils/logger');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!config.email.user || !config.email.pass) return null;
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: { user: config.email.user, pass: config.email.pass },
    });
    return transporter;
  } catch (err) {
    logger.warn({ err }, 'Email transport not available');
    return null;
  }
}

async function sendEmail({ to, subject, body, html }) {
  const t = getTransporter();
  if (!t) {
    logger.warn({ to, subject }, 'Email not configured — logged only');
    return { success: true, message: `Email queued for ${to}`, mock: true };
  }
  try {
    const info = await t.sendMail({
      from: config.email.user,
      to, subject,
      text: body,
      html: html || body?.replace(/\n/g, '<br>'),
    });
    logger.info({ messageId: info.messageId }, 'Email sent');
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error({ err }, 'Email send failed');
    return { success: false, error: err.message };
  }
}

async function sendOutlookEmail({ to, subject, body }) {
  // Outlook Graph API - requires OAuth token
  // Placeholder for Graph API integration
  return sendEmail({ to, subject, body });
}

module.exports = { sendEmail, sendOutlookEmail };
