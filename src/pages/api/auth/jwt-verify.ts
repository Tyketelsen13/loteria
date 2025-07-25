import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;

    return res.status(200).json({
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        image: decoded.image
      }
    });

  } catch (error) {
    console.error('JWT Verify error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
