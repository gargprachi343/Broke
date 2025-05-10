require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: `"BrokeBro" <${process.env.EMAIL_USER}>`,
  to: 'lavanya.varshney2104@gmail.com', // Replace with a valid .edu.in or .ac.in email
  subject: 'Test Email from BrokeBro',
  text: 'This is a test email to verify Nodemailer configuration.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});