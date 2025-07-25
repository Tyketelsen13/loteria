import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb";

// Simple signup endpoint using the WORKING minimal MongoDB connection
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("=== SIMPLE SIGNUP START ===");
    
    // Parse request
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    
    console.log(`Parsed input in ${Date.now() - startTime}ms`);
    
    // Hash password with minimal rounds
    const hashedPassword = await bcrypt.hash(password, 6);
    console.log(`Hashed password in ${Date.now() - startTime}ms`);
    
    // Get MongoDB client using the WORKING minimal connection
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "loteria");
    const users = db.collection('users');
    console.log(`Got DB connection in ${Date.now() - startTime}ms`);
    
    // Insert user
    const result = await users.insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
    });
    
    console.log(`=== SIMPLE SIGNUP SUCCESS in ${Date.now() - startTime}ms ===`);
    
    return NextResponse.json({
      success: true,
      userId: result.insertedId.toString(),
      time: Date.now() - startTime
    }, { status: 201 });
    
  } catch (error: any) {
    console.error(`=== SIMPLE SIGNUP ERROR after ${Date.now() - startTime}ms ===`, error);
    
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email exists' }, { status: 409 });
    }
    
    return NextResponse.json({
      error: 'Signup failed',
      details: error.message,
      time: Date.now() - startTime
    }, { status: 500 });
  }
}
