// Load environment variables from .env file at the very top
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3333;

// --- MIDDLEWARE ---
// 1. CORS Middleware: Allows your frontend (running on a different port) to talk to this backend.
//    The VITE proxy handles this in development, but this is essential for production.
app.use(cors());

// 2. JSON Parsing Middleware: This teaches Express to read JSON from request bodies.
app.use(express.json());


// --- NODEMAILER TRANSPORTER SETUP ---
// This is the object that will send the email.
// We configure it to use Gmail and securely pull the credentials from our .env file.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email from .env
    pass: process.env.EMAIL_PASS, // Your App Password from .env
  },
});


// --- API ENDPOINT ---
// The handler is now an 'async' function to allow for 'await'ing the email sending.
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // 1. Server-side Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // 2. Email Sending Logic
  console.log('Received form submission. Attempting to send email...');

  // Define the email content. Using HTML for a nicer format.
  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`, // Sender's name and your email
    to: process.env.EMAIL_TO, // The recipient from your .env file
    replyTo: email, // Set the reply-to to the user's actual email
    subject: `New Contact Form Message from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #22c55e;">New Message from Andries Service+ Website</h2>
        <p>You have received a new message through your website's contact form.</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f9f9f9; border-left: 4px solid #22c55e; padding: 10px 15px; margin-top: 10px;">
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `,
  };

  try {
    // Attempt to send the email
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    // Send a success response back to the frontend
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    // If an error occurs, log it and send a server error response
    console.error('❌ Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
});


// --- START THE SERVER ---
app.listen(PORT, () => {
  console.log(`✅ Backend server is running and listening on http://localhost:${PORT}`);
});
