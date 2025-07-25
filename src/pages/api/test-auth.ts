import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const usersCollection = db.collection('users');

    if (req.method === 'GET') {
      // Check if test user exists
      const testUser = await usersCollection.findOne({ email: 'test@example.com' });
      const userCount = await usersCollection.countDocuments();
      
      return res.status(200).json({
        testUserExists: !!testUser,
        totalUsers: userCount,
        testUser: testUser ? { 
          id: testUser._id, 
          email: testUser.email, 
          name: testUser.name,
          hasPassword: !!testUser.password 
        } : null
      });
    }

    if (req.method === 'POST') {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: 'test@example.com' });
      if (existingUser) {
        return res.status(200).json({ message: 'Test user already exists', user: existingUser });
      }

      const newUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      
      return res.status(201).json({
        message: 'Test user created successfully',
        userId: result.insertedId,
        credentials: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
    }
  } catch (error) {
    console.error('Test auth error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
}
