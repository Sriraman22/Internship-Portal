const config = require('../config');
const nodemailer = require('nodemailer');

async function sendEmail(to, subject, html) {
  if (config.sendgridKey) {
    // implement SendGrid if provided (you can use @sendgrid/mail). For brevity, fallback to nodemailer below
  }
  // nodemailer fallback: you must set SMTP envs or it will log
  if (config.smtp && config.smtp.host) {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: Number(config.smtp.port) || 587,
      secure: false,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
    await transporter.sendMail({ from: config.smtp.user, to, subject, html });
    return;
  }
  console.log(`[email] to=${to} subject=${subject} html=${html}`);
}

module.exports = { sendEmail };
