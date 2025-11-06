// Vercel Serverless Function
// This endpoint handles file uploads to Vercel Blob and optimizes images.
import { put } from '@vercel/blob';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import sharp from 'sharp';

// Vercel Blob requires the raw request body, so we disable the default body parser.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to convert a readable stream to a buffer
async function streamToBuffer(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

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

  // 2. Handle Upload & Optimization
  const filename = req.headers['x-vercel-filename'];
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Filename is missing or invalid.' });
  }

  const contentType = req.headers['content-type'];

  try {
    const imageBuffer = await streamToBuffer(req);

    let finalBuffer = imageBuffer;
    let finalFilename = filename;
    let finalContentType = contentType;
    
    const optimizableTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    // Optimize common image types, but leave SVGs and other files alone.
    if (optimizableTypes.includes(contentType)) {
      console.log(`Optimizing image: ${filename}`);
      
      finalBuffer = await sharp(imageBuffer)
        .resize({
          width: 1920,
          height: 1920,
          fit: 'inside',
          withoutEnlargement: true, // Don't enlarge smaller images
        })
        .webp({ quality: 80 }) // Convert to WebP with 80% quality
        .toBuffer();
      
      // Change filename extension to .webp
      const nameWithoutExtension = filename.split('.').slice(0, -1).join('.');
      finalFilename = `${nameWithoutExtension}.webp`;
      finalContentType = 'image/webp';
    }

    // The `put` function from @vercel/blob handles the stream from the request.
    const blob = await put(finalFilename, finalBuffer, {
      access: 'public',
      // Add a cache control header to ensure browsers fetch the latest version
      // after an image is updated.
      cacheControl: 'public, max-age=0, must-revalidate',
      contentType: finalContentType
    });
    
    return res.status(200).json(blob);

  } catch (error) {
    console.error('Error processing or uploading file:', error);
    return res.status(500).json({ error: 'File upload and optimization failed.' });
  }
}