// Vercel Serverless Function - API Router
// This single file consolidates all API logic to stay within the Vercel Hobby plan limits.
import { createClient } from '@vercel/kv';
import { put } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import nodemailer from 'nodemailer';
import sharp from 'sharp';
import { URL } from 'url';

// --- START: SHARED UTILITIES ---

// Initialize the Vercel KV client.
// For `@vercel/kv` v2+, this requires the KV_REST_API_URL and KV_REST_API_TOKEN
// environment variables to be correctly set in the Vercel project.
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Helper to authenticate requests using JWT from cookies
function authenticateRequest(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token;
  if (!token) {
    throw new Error('Authentication required.');
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
}

// Helper function to convert a readable stream to a buffer for file uploads
async function streamToBuffer(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// --- END: SHARED UTILITIES ---


// --- START: API HANDLERS (LOGIC FROM INDIVIDUAL FILES) ---

// From: api/contact.js
async function handleContact(req, res) {
  const { name, email, message, fax } = req.body;
  if (fax) return res.status(200).json({ success: true, message: 'Message sent successfully!' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !email || !message) return res.status(400).json({ error: 'Alle velden zijn verplicht.' });
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Voer een geldig emailadres in.' });
  if (message.length < 10 || message.length > 500) return res.status(400).json({ error: 'Bericht moet tussen 10 en 500 tekens lang zijn.' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const adminMailOptions = {
    from: `"Andries Service+ Website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `[Andries Service+] Nieuw bericht van ${name}`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2 style="color: #22c55e;">Nieuw bericht van ${name}</h2><p><strong>Email:</strong> ${email}</p><p><strong>Bericht:</strong></p><p style="white-space: pre-wrap;">${message}</p></div>`,
  };
  
  const confirmationMailOptions = {
      from: `"Andries Service+" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Bevestiging: Wij hebben uw bericht ontvangen!`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2 style="color: #22c55e;">Bedankt voor uw bericht, ${name}!</h2><p>We hebben uw bericht in goede orde ontvangen en nemen zo spoedig mogelijk contact met u op.</p></div>`
  }

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(confirmationMailOptions);
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Sorry, uw bericht kon niet worden verzonden.' });
  }
}

// From: api/content.js
async function handleGetContent(req, res) {
  try {
    const [pageContent, galleryImages] = await Promise.all([
      kv.get('pageContent'),
      kv.get('galleryImages'),
    ]);
    if (!pageContent || !galleryImages) return res.status(404).json({ error: 'Content not found.' });
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ pageContent, galleryImages });
  } catch (error) {
    console.error('Error fetching content from KV:', error);
    return res.status(500).json({ error: 'Failed to fetch content.' });
  }
}

// From: api/update-content.js
async function handleUpdateContent(req, res) {
  try {
    authenticateRequest(req);
    const { pageContent, galleryImages } = req.body;
    if (!pageContent || galleryImages === undefined) return res.status(400).json({ error: 'Invalid payload.' });
    
    // Versioning
    const [currentContent, currentGallery] = await Promise.all([kv.get('pageContent'), kv.get('galleryImages')]);
    if (currentContent && currentGallery) {
      const timestamp = new Date().toISOString();
      const historyEntryKey = `history:${timestamp}`;
      await kv.set(historyEntryKey, { pageContent: currentContent, galleryImages: currentGallery }, { ex: 60 * 60 * 24 * 30 });
      await kv.lpush('content_history', historyEntryKey);
      await kv.ltrim('content_history', 0, 9);
    }

    await Promise.all([kv.set('pageContent', pageContent), kv.set('galleryImages', galleryImages)]);
    return res.status(200).json({ success: true, message: 'Content succesvol opgeslagen!' });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// From: api/upload.js
async function handleUpload(req, res) {
    try {
        authenticateRequest(req);
        const filename = req.headers['x-vercel-filename'];
        if (!filename || typeof filename !== 'string') return res.status(400).json({ error: 'Filename is missing.' });

        const imageBuffer = await streamToBuffer(req);
        const optimizableTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        let finalBuffer = imageBuffer, finalFilename = filename, finalContentType = req.headers['content-type'];

        if (optimizableTypes.includes(finalContentType)) {
            finalBuffer = await sharp(imageBuffer).resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
            finalFilename = `${filename.split('.').slice(0, -1).join('.')}.webp`;
            finalContentType = 'image/webp';
        }

        const blob = await put(finalFilename, finalBuffer, { access: 'public', cacheControl: 'public, max-age=0, must-revalidate', contentType: finalContentType });
        return res.status(200).json(blob);
    } catch (error) {
        return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: 'Upload failed.' });
    }
}


// From: api/login.js
async function handleLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });
  try {
    const user = await kv.get(`user:${username}`);
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) return res.status(401).json({ error: 'Invalid username or password.' });
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', sameSite: 'strict', maxAge: 604800, path: '/' }));
    return res.status(200).json({ success: true, user: { username: user.username } });
  } catch (error) {
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}

// From: api/logout.js
async function handleLogout(req, res) {
  res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', { httpOnly: true, secure: process.env.NODE_ENV !== 'development', sameSite: 'strict', expires: new Date(0), path: '/' }));
  return res.status(200).json({ success: true, message: 'Logged out.' });
}

// From: api/verify-auth.js
async function handleVerifyAuth(req, res) {
  try {
    const decoded = authenticateRequest(req);
    return res.status(200).json({ user: { username: decoded.username } });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// From: api/users/index.js
async function handleListUsers(req, res) {
  try {
    authenticateRequest(req);
    const userKeys = await kv.keys('user:*');
    const usernames = userKeys.map(key => key.split(':')[1]);
    return res.status(200).json({ users: usernames });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// From: api/users/create.js
async function handleCreateUser(req, res) {
  try {
    authenticateRequest(req);
    const { username, password } = req.body;
    if (!username || !password || username.length < 3 || password.length < 8) return res.status(400).json({ error: 'Invalid username or password format.' });
    if (await kv.exists(`user:${username}`)) return res.status(409).json({ error: 'Username is already in use.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    await kv.set(`user:${username}`, { username, hashedPassword });
    return res.status(201).json({ success: true, message: `User '${username}' created.` });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// From: api/users/delete.js
async function handleDeleteUser(req, res) {
  try {
    const decoded = authenticateRequest(req);
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required.' });
    if (username === decoded.username) return res.status(403).json({ error: 'You cannot delete your own account.' });
    if ((await kv.del(`user:${username}`)) === 0) return res.status(404).json({ error: `User '${username}' not found.` });
    return res.status(200).json({ success: true, message: `User '${username}' deleted.` });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// From: api/content-history.js
async function handleGetHistory(req, res) {
  try {
    authenticateRequest(req);
    const historyKeys = await kv.lrange('content_history', 0, -1);
    const timestamps = historyKeys.map(key => key.replace('history:', ''));
    return res.status(200).json({ history: timestamps });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// From: api/revert-content.js
async function handleRevertContent(req, res) {
  try {
    authenticateRequest(req);
    const { timestamp } = req.body;
    if (!timestamp) return res.status(400).json({ error: 'Timestamp is required.' });
    const historicalContent = await kv.get(`history:${timestamp}`);
    if (!historicalContent) return res.status(404).json({ error: 'Historical version not found.' });
    await Promise.all([kv.set('pageContent', historicalContent.pageContent), kv.set('galleryImages', historicalContent.galleryImages)]);
    return res.status(200).json({ success: true, message: `Content restored to version from ${timestamp}.` });
  } catch (error) {
    return res.status(error.message === 'Authentication required.' ? 401 : 500).json({ error: error.message });
  }
}

// --- END: API HANDLERS ---


// --- MAIN ROUTER ---
export default async function handler(req, res) {
  // Vercel populates req.body for JSON requests by default.
  // The upload handler reads the raw stream, which is still available.
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  // Public routes (no auth needed)
  if (path === '/api/contact' && req.method === 'POST') return handleContact(req, res);
  if (path === '/api/content' && req.method === 'GET') return handleGetContent(req, res);
  if (path === '/api/login' && req.method === 'POST') return handleLogin(req, res);

  // Authenticated routes
  if (path === '/api/update-content' && req.method === 'POST') return handleUpdateContent(req, res);
  if (path === '/api/upload' && req.method === 'POST') return handleUpload(req, res);
  if (path === '/api/logout' && req.method === 'POST') return handleLogout(req, res);
  if (path === '/api/verify-auth' && req.method === 'GET') return handleVerifyAuth(req, res);
  if (path === '/api/users' && req.method === 'GET') return handleListUsers(req, res);
  if (path === '/api/users/create' && req.method === 'POST') return handleCreateUser(req, res);
  if (path === '/api/users/delete' && req.method === 'POST') return handleDeleteUser(req, res);
  if (path === '/api/content-history' && req.method === 'GET') return handleGetHistory(req, res);
  if (path === '/api/revert-content' && req.method === 'POST') return handleRevertContent(req, res);

  return res.status(404).json({ error: 'Not Found' });
}