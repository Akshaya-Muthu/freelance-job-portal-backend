import nodemailer from 'nodemailer';

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // Brevo SMTP server
  port: 587,                     // Brevo SMTP port                // false for port 587, true for port 465
  auth: {
    user: process.env.SMTP_USER, // Use environment variable for SMTP user
    pass: process.env.SMTP_PASS,  // Use environment variable for SMTP password
  },
});

export default transporter;