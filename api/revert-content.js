// Vercel Serverless Function
// Reverts the live content to a specific historical version.
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
    res.setHeader('Allow', ['POST']);
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
  
  const { timestamp } = req.body;
  if (!timestamp) {
      return res.status(400).json({ error: 'Timestamp is required.' });
  }

  try {
    const kv = createClient({
      url: getSanitizedKvUrl(),
      token: process.env.KV_REST_API_TOKEN,
    });
    
    const historyKey = `history:${timestamp}`;
    const historicalContent = await kv.get(historyKey);

    if (!historicalContent) {
        return res.status(404).json({ error: 'Historical version not found.' });
    }

    const { pageContent, galleryImages } = historicalContent;
    
    // Overwrite the current content with the historical version
    await Promise.all([
        kv.set('pageContent', pageContent),
        kv.set('galleryImages', galleryImages),
    ]);

    // Note: We don't create a new history entry for a revert action to avoid clutter.
    // The user is simply rolling back to a previous state.

    return res.status(200).json({ success: true, message: `Content hersteld naar versie van ${timestamp}.` });

  } catch (error) {
    console.error('Error reverting content:', error);
    return res.status(500).json({ error: 'An internal server error occurred while reverting content.' });
  }
}