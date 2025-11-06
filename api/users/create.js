// Vercel Serverless Function
// Creates a new admin user.
import { createClient } from '@vercel/kv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

function getSanitizedKvUrl() {
  const url = process.env.KV_URL;
  if (url && url.startsWith('rediss://')) {
    try {
      const parsedUrl = new URL(url.replace('rediss://', 'https://'));
      return `https://${parsedUrl.hostname}`;
    } catch (e) { return url; }
  }
  return url;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Authentication check
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Gebruikersnaam en wachtwoord zijn verplicht.' });
  }
  if (username.length < 3) {
      return res.status(400).json({ error: 'Gebruikersnaam moet minimaal 3 tekens lang zijn.'})
  }
   if (password.length < 8) {
      return res.status(400).json({ error: 'Wachtwoord moet minimaal 8 tekens lang zijn.'})
  }

  try {
    const kv = createClient({
      url: getSanitizedKvUrl(),
      token: process.env.KV_REST_API_TOKEN,
    });
    
    const userExists = await kv.exists(`user:${username}`);
    if (userExists) {
        return res.status(409).json({ error: 'Gebruikersnaam is al in gebruik.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await kv.set(`user:${username}`, {
        username,
        hashedPassword,
    });

    return res.status(201).json({ success: true, message: `Gebruiker '${username}' succesvol aangemaakt.` });

  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}