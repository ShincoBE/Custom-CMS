// Vercel Serverless Function
// This endpoint fetches all dynamic content for the website from the KV store.
import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
  // We only want to handle GET requests for this endpoint.
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // --- START: Environment Variable Validation ---
  // A 500 error here is often caused by missing environment variables on Vercel.
  // This check ensures both required KV variables are present.
  if (!process.env.KV_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('Missing KV environment variables on the server.');
    return res.status(500).json({ error: 'Server configuration error: KV store credentials are not set.' });
  }
  // --- END: Environment Variable Validation ---

  try {
    const kv = createClient({
      url: process.env.KV_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    
    // Fetch both content sets in parallel for efficiency
    const [pageContent, galleryImages] = await Promise.all([
      kv.get('pageContent'),
      kv.get('galleryImages'),
    ]);

    if (!pageContent || !galleryImages) {
        return res.status(404).json({ error: 'Content not found. Have you seeded the database? Run `pnpm seed`.' });
    }

    // Combine into a single payload
    const payload = {
      pageContent,
      galleryImages,
    };

    // Set cache headers to optimize performance
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(payload);

  } catch (error) {
    console.error('Error fetching content from KV:', error);
    return res.status(500).json({ error: 'Failed to fetch content from the server.' });
  }
}