import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET } = process.env;
const COOKIE_NAME = 'auth_token';
const MAX_AGE = 60 * 60 * 8; // 8 hours in seconds

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body;

  // 1. Validate credentials
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // 2. Create JWT
    const token = jwt.sign(
      { username }, // payload
      JWT_SECRET,   // secret key
      { expiresIn: MAX_AGE } // expiration
    );

    // 3. Set cookie
    const cookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: MAX_AGE,
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true, message: 'Logged in successfully' });
  }

  // 4. Handle failed login
  return res.status(401).json({ success: false, error: 'Invalid username or password' });
}