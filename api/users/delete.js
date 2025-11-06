// Vercel Serverless Function
// Deletes an admin user.
import { createClient } from '@vercel/kv';
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
  
  let currentUser;
  // Authentication check
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    currentUser = decoded.username;
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Gebruikersnaam is verplicht.' });
  }
  
  // Safety check: prevent a user from deleting themselves
  if (username === currentUser) {
      return res.status(403).json({ error: 'U kunt uw eigen account niet verwijderen.' });
  }

  try {
    const kv = createClient({
      url: getSanitizedKvUrl(),
      token: process.env.KV_REST_API_TOKEN,
    });
    
    const result = await kv.del(`user:${username}`);

    if (result === 0) {
        return res.status(404).json({ error: `Gebruiker '${username}' niet gevonden.`})
    }
    
    return res.status(200).json({ success: true, message: `Gebruiker '${username}' succesvol verwijderd.` });

  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}