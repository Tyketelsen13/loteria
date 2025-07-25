import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb";

// Ultra-simple Vercel signup endpoint with comprehensive error handling
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== SIGNUP START ===");
    
    // Parse request with timeout
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), 4000)
    );

    const signupPromise = handleSignupSimple(request, startTime);
    const result = await Promise.race([signupPromise, timeoutPromise]);
    
    console.log(`=== SIGNUP SUCCESS in ${Date.now() - startTime}ms ===`);
    return result;
    
  } catch (error: any) {
    const errorTime = Date.now() - startTime;
    console.error(`=== SIGNUP ERROR after ${errorTime}ms ===`, {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack?.substring(0, 500)
    });
    
    // Return simple JSON response for all errors
    return NextResponse.json({
      error: error.message === 'TIMEOUT' ? 'Request timeout' : 'Signup failed',
      details: error.message,
      time: errorTime
    }, { 
      status: error.message === 'TIMEOUT' ? 408 : 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

async function handleSignupSimple(request: NextRequest, startTime: number) {
  // Step 1: Parse JSON
  console.log("Step 1: Parsing request...");
  let body;
  try {
    body = await request.json();
  } catch (e) {
    throw new Error('Invalid JSON in request');
  }
  
  const { name, email, password } = body;
  console.log(`Step 1 complete: ${Date.now() - startTime}ms`);

  // Step 2: Validate input
  console.log("Step 2: Validating input...");
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password too short' }, { status: 400 });
  }
  console.log(`Step 2 complete: ${Date.now() - startTime}ms`);

  // Step 3: Hash password (fast)
  console.log("Step 3: Hashing password...");
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 6); // Very fast hashing
  } catch (e) {
    throw new Error('Password hashing failed');
  }
  console.log(`Step 3 complete: ${Date.now() - startTime}ms`);

  // Step 4: Database operation
  console.log("Step 4: Database operation...");
  let client, db, users;
  try {
    client = await clientPromise;
    db = client.db(process.env.MONGODB_DB);
    users = db.collection('users');
  } catch (e: any) {
    throw new Error(`Database connection failed: ${e.message}`);
  }
  console.log(`Step 4a (connect) complete: ${Date.now() - startTime}ms`);

  // Step 5: Insert user
  console.log("Step 5: Inserting user...");
  try {
    const result = await users.insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
    });
    
    console.log(`Step 5 complete: ${Date.now() - startTime}ms`);
    
    return NextResponse.json({ 
      success: true,
      userId: result.insertedId.toString(),
      message: 'User created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate email
      return NextResponse.json({ 
        error: 'Email already exists' 
      }, { status: 409 });
    }
    throw new Error(`Database insert failed: ${error.message}`);
  }
}
