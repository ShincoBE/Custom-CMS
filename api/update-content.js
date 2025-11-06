// Vercel Serverless Function
// This endpoint updates the website content in the KV store.
import { createClient } from '@vercel/kv';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const { JWT_SECRET } = process.env;
const COOKIE_NAME = 'auth_token';

// --- START: KV URL Sanitization ---
// This helper function automatically corrects a common misconfiguration where the
// Redis connection string (rediss://) is used instead of the REST API URL (https://).
function getSanitizedKvUrl() {
  const url = process.env.KV_URL;
  if (url && url.startsWith('rediss://')) {
    try {
      // The URL constructor can parse the components of the redis string if we temporarily replace the protocol
      const parsedUrl = new URL(url.replace('rediss://', 'https://'));
      // We only need the hostname for the REST API URL
      return `https://${parsedUrl.hostname}`;
    } catch (e) {
      console.error("Failed to parse and sanitize KV_URL, using original value.", e);
      return url; // Fallback to original URL on parsing error
    }
  }
  return url;
}
// --- END: KV URL Sanitization ---

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  // 1. Verify Authentication
  try {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured on the server.');
    }
    const cookies = parse(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // 2. Get and validate content from body
  const { pageContent, galleryImages } = req.body;
  if (!pageContent || galleryImages === undefined) {
    return res.status(400).json({ error: 'Invalid payload. Missing pageContent or galleryImages.' });
  }
  
  // 3. Save to KV Store
  try {
    if (!process.env.KV_URL || !process.env.KV_REST_API_TOKEN) {
      console.error('Missing KV environment variables on the server.');
      return res.status(500).json({ error: 'Server configuration error: KV store credentials are not set.' });
    }
    
    const kv = createClient({
      url: getSanitizedKvUrl(), // Use the sanitized URL
      token: process.env.KV_REST_API_TOKEN,
    });
    
    // Save both content sets in parallel
    await Promise.all([
      kv.set('pageContent', pageContent),
      kv.set('galleryImages', galleryImages),
    ]);
    
    return res.status(200).json({ success: true, message: 'Content succesvol opgeslagen!' });

  } catch (error) {
    console.error('Error updating content in KV:', error);
    return res.status(500).json({ error: 'Kon content niet opslaan op de server.' });
  }
}