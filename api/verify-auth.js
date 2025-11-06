import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Send back user information from the token
    return res.status(200).json({ user: { username: decoded.username } });

  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
