import { createClient } from '@vercel/kv';
import bcrypt from 'bcryptjs';

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

  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables.' });
  }

  try {
    const kv = createClient({
      url: getSanitizedKvUrl(),
      token: process.env.KV_REST_API_TOKEN,
    });

    const userExists = await kv.get(`user:${ADMIN_USERNAME}`);

    if (userExists) {
      return res.status(409).json({ message: `User '${ADMIN_USERNAME}' already exists. Setup has already been run.` });
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await kv.set(`user:${ADMIN_USERNAME}`, {
      username: ADMIN_USERNAME,
      hashedPassword: hashedPassword,
    });

    return res.status(200).json({ success: true, message: `Admin user '${ADMIN_USERNAME}' created successfully.` });

  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({ error: 'An internal server error occurred during setup.' });
  }
}
