import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email = 'test@example.com' } = req.query;

    // Connect to database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found', email });
    }

    // Test password verification
    const testPassword = 'password123';
    const isPasswordValid = user.password ? await bcrypt.compare(testPassword, user.password) : false;

    return res.status(200).json({
      userExists: true,
      email: user.email,
      name: user.name,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordTestResult: isPasswordValid,
      createdAt: user.createdAt,
      passwordHash: user.password ? user.password.substring(0, 20) + '...' : null
    });

  } catch (error) {
    console.error('Debug user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
