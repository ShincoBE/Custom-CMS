import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const { JWT_SECRET } = process.env;
const COOKIE_NAME = 'auth_token';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME];

    if (!token) {
      return res.status(200).json({ isAuthenticated: false });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET);
    
    // If verification is successful, the user is authenticated
    return res.status(200).json({ isAuthenticated: true });

  } catch (error) {
    // If the token is invalid or expired, jwt.verify will throw an error
    console.warn('Auth verification failed:', error.message);
    return res.status(200).json({ isAuthenticated: false });
  }
}