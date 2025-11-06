// Vercel Serverless Function
// This endpoint updates the website content in the KV store.
import { createClient } from '@vercel/kv';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

// --- START: KV URL Sanitization ---
function getSanitizedKvUrl() {
  const url = process.env.KV_URL;
  if (url && url.startsWith('rediss://')) {
    try {
      const parsedUrl = new URL(url.replace('rediss://', 'https://'));
      return `https://${parsedUrl.hostname}`;
    } catch (e) {
      console.error("Failed to parse and sanitize KV_URL, using original value.", e);
      return url;
    }
  }
  return url;
}
// --- END: KV URL Sanitization ---

const HISTORY_KEY = 'content_history';
const MAX_HISTORY_LENGTH = 10;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  // 1. Verify Authentication with JWT from cookie
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET);
    // If verification is successful, proceed. If not, it will throw an error.

  } catch (error) {
    console.error('JWT verification failed:', error.message);
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
      url: getSanitizedKvUrl(),
      token: process.env.KV_REST_API_TOKEN,
    });

    // --- Start: Content Versioning ---
    const [currentContent, currentGallery] = await Promise.all([
      kv.get('pageContent'),
      kv.get('galleryImages')
    ]);

    if (currentContent && currentGallery) {
      const timestamp = new Date().toISOString();
      const historyEntryKey = `history:${timestamp}`;
      const historyEntry = { pageContent: currentContent, galleryImages: currentGallery };
      
      // Save the current state to a new history key
      await kv.set(historyEntryKey, historyEntry, { ex: 60 * 60 * 24 * 30 }); // Expire history after 30 days
      
      // Add the new history key to our list of versions
      await kv.lpush(HISTORY_KEY, historyEntryKey);
      
      // Trim the list to keep only the last MAX_HISTORY_LENGTH versions
      await kv.ltrim(HISTORY_KEY, 0, MAX_HISTORY_LENGTH - 1);
    }
    // --- End: Content Versioning ---
    
    // Save both new content sets in parallel
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