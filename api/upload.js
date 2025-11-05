// Vercel Serverless Function
// This endpoint handles file uploads to Vercel Blob.
import { put } from '@vercel/blob';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const { JWT_SECRET } = process.env;
const COOKIE_NAME = 'auth_token';

// Vercel Blob requires the raw request body, so we disable the default body parser.
export const config = {
  api: {
    bodyParser: false,
  },
};

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

  // 2. Handle Upload
  // The filename is passed via a custom header from the client.
  const filename = req.headers['x-vercel-filename'];
  if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Filename is missing or invalid.'});
  }

  try {
    // The `put` function from @vercel/blob handles the stream from the request.
    const blob = await put(filename, req, {
      access: 'public',
      // Add a cache control header to ensure browsers fetch the latest version
      // after an image is updated.
      cacheControl: 'public, max-age=0, must-revalidate'
    });
    
    return res.status(200).json(blob);

  } catch (error) {
    console.error('Error uploading file to Vercel Blob:', error);
    return res.status(500).json({ error: 'File upload failed.' });
  }
}
