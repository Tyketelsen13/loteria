import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const usersCollection = db.collection('users');

    // Delete existing test user
    await usersCollection.deleteMany({ email: 'test@example.com' });

    // Create new test user with fresh password hash
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const newUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Verify the password works
    const testVerification = await bcrypt.compare('password123', hashedPassword);
    
    return res.status(200).json({
      message: 'Test user recreated successfully',
      userId: result.insertedId,
      passwordVerification: testVerification,
      credentials: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

  } catch (error) {
    console.error('Recreate user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
