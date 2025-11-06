// Vercel Serverless Function
// Lists all admin users.
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
  if (req.method !== 'GET') {
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

  try {
    const kv = createClient({
      url: getSanitizedKvUrl(),
      token: process.env.KV_REST_API_TOKEN,
    });
    
    // Scan for all user keys
    const userKeys = await kv.keys('user:*');
    
    // Extract usernames from keys (e.g., 'user:admin' -> 'admin')
    const usernames = userKeys.map(key => key.split(':')[1]);

    return res.status(200).json({ users: usernames });

  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}