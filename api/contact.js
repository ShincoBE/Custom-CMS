// Vercel Serverless Function
// This file exports a single function that acts as our API endpoint.

const nodemailer = require('nodemailer');

// The main handler function for the serverless endpoint.
// It receives the request (req) and response (res) objects.
export default async function handler(req, res) {
  // We only want to handle POST requests for this endpoint.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { name, email, message, fax } = req.body;

  // 1. Honeypot Anti-Spam Check
  // If the hidden 'fax' field is filled out, it's likely a bot.
  // We'll pretend it was successful to trick the bot, but we won't send an email.
  if (fax) {
    console.log('Honeypot field filled, likely spam. Silently succeeding.');
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  }

  // 2. Server-side Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Alle velden zijn verplicht.' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Voer een geldig emailadres in.' });
  }
  if (message.length < 10 || message.length > 500) {
      return res.status(400).json({ error: 'Bericht moet tussen 10 en 500 tekens lang zijn.' });
  }


  // 3. Nodemailer Transporter Setup
  // It's configured inside the handler to use the environment variables
  // provided by Vercel at runtime.
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 4. Email Content for Admin Notification
  const adminMailOptions = {
    from: `"Andries Service+ Website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `[Andries Service+] Nieuw bericht van ${name}`,
    // Plain text version for better deliverability
    text: `U heeft een nieuw bericht ontvangen via het contactformulier op de website.\n\nNaam: ${name}\nEmail: ${email}\n\nBericht:\n${message}`,
    // HTML version of the email
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;">
          <div style="background-color: #22c55e; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Andries Service+</h1>
            <p style="margin: 5px 0 0; font-size: 16px;">Nieuw Bericht via Contactformulier</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="font-size: 20px; color: #333; margin-top: 0;">Bericht van: ${name}</h2>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
            <p style="font-size: 16px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #22c55e; text-decoration: none;">${email}</a></p>
            <h3 style="font-size: 18px; margin-top: 30px; margin-bottom: 10px; color: #555;">Bericht:</h3>
            <div style="background-color: #f9f9f9; border-left: 4px solid #22c55e; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; white-space: pre-wrap; font-size: 16px;">${message}</p>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #999; background-color: #fafafa; border-top: 1px solid #eaeaea;">
            <p style="margin: 0;">Dit is een automatisch bericht van de Andries Service+ website.</p>
          </div>
        </div>
      </div>
    `,
  };

  // 5. Email Content for User Confirmation
  const confirmationMailOptions = {
    from: `"Andries Service+" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Bevestiging: Wij hebben uw bericht ontvangen!`,
    text: `Beste ${name},\n\nBedankt voor uw bericht. We hebben het in goede orde ontvangen en nemen zo spoedig mogelijk contact met u op.\n\nMet vriendelijke groeten,\nHet team van Andries Service+`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;">
          <div style="background-color: #22c55e; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Andries Service+</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="font-size: 20px; color: #333; margin-top: 0;">Bedankt voor uw bericht, ${name}!</h2>
            <p style="font-size: 16px;">We hebben uw bericht in goede orde ontvangen en nemen zo spoedig mogelijk contact met u op.</p>
            <p style="font-size: 16px;">U hoeft niet op deze e-mail te reageren.</p>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
            <p style="font-size: 14px; color: #777;">Een kopie van uw bericht:</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #ddd; padding: 15px; border-radius: 4px; font-style: italic;">
              <p style="margin: 0; white-space: pre-wrap; font-size: 15px;">${message}</p>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #999; background-color: #fafafa; border-top: 1px solid #eaeaea;">
            <p style="margin: 0;">Andries Service+ | Hazenstraat 65, 2500 Lier</p>
          </div>
        </div>
      </div>
    `,
  };


  // 6. Send the Emails
  try {
    // First, send the notification to the admin.
    await transporter.sendMail(adminMailOptions);
    console.log('Admin notification sent successfully!');

    // If the admin email was sent, send the confirmation to the user.
    try {
      await transporter.sendMail(confirmationMailOptions);
      console.log('User confirmation sent successfully!');
    } catch (confirmationError) {
      // If only the confirmation fails, log it but don't fail the overall request.
      // The primary goal (contacting the admin) was successful.
      console.error('Failed to send confirmation email to user:', confirmationError);
    }
    
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return res.status(500).json({ error: 'Sorry, uw bericht kon niet worden verzonden. Probeer het later opnieuw.' });
  }
}
