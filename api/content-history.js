// Vercel Serverless Function
// Fetches the list of content history keys.
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

const HISTORY_KEY = 'content_history';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
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
    
    // Fetch the list of history keys
    const historyKeys = await kv.lrange(HISTORY_KEY, 0, -1);
    
    // Extract just the timestamps for the client
    const timestamps = historyKeys.map(key => key.replace('history:', ''));

    return res.status(200).json({ history: timestamps });

  } catch (error) {
    console.error('Error fetching content history:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}