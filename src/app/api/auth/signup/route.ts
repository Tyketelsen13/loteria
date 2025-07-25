import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb";

// Vercel-optimized signup endpoint
export async function POST(request: NextRequest) {
  // Set timeout for Vercel (8 seconds to stay under 10s limit)
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), 8000)
  );

  try {
    const signupPromise = handleSignup(request);
    const result = await Promise.race([signupPromise, timeoutPromise]);
    return result;
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again.',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function handleSignup(request: NextRequest) {
  console.log("Vercel signup attempt started...");
  
  const { name, email, password } = await request.json();
  console.log(`Signup request for email: ${email}`);
  
  if (!name || !email || !password) {
    console.log("Missing required fields");
    return NextResponse.json(
      { error: 'All fields are required' },
      { status: 400 }
    );
  }

  console.log("Connecting to MongoDB...");
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const users = db.collection('users');
  console.log(`Connected to database: ${process.env.MONGODB_DB}`);

  // Check if user exists
  console.log("Checking for existing user...");
  const existingUser = await users.findOne({ email });
  if (existingUser) {
    console.log(`User ${email} already exists`);
    return NextResponse.json(
      { error: 'User already exists' },
      { status: 400 }
    );
  }

  // Hash password (reduced rounds for Vercel performance)
  console.log("Hashing password...");
  const saltRounds = 10; // Reduced from 12 for faster processing
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  console.log("Creating new user...");
  const result = await users.insertOne({
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  });

  console.log(`User created successfully with ID: ${result.insertedId}`);

  return NextResponse.json(
    { 
      message: 'User created successfully', 
      userId: result.insertedId,
      email 
    },
    { status: 201 }
  );
}
