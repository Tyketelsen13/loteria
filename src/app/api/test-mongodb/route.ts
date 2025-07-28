import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    console.log('MongoDB Atlas Diagnostic - Starting comprehensive test');
    
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB;
    
    console.log('MongoDB Atlas Diagnostic - Configuration:');
    console.log('- URI provided:', !!uri);
    console.log('- Database name:', dbName);
    console.log('- Skip validation:', process.env.SKIP_DB_VALIDATION);
    
    if (!uri) {
      return NextResponse.json({
        success: false,
        message: 'MONGODB_URI environment variable is missing',
        step: 'configuration'
      }, { status: 500 });
    }
    
    // Parse connection string to extract details
    const uriParts = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/\?]+)/);
    if (uriParts) {
      console.log('MongoDB Atlas Diagnostic - Connection details:');
      console.log('- Username:', uriParts[1]);
      console.log('- Cluster:', uriParts[3]);
      console.log('- Password length:', uriParts[2].length);
    }
    
    console.log('MongoDB Atlas Diagnostic - Testing connection...');
    
    // Test connection with detailed error handling
    const client = new MongoClient(uri);
    
    try {
      // Set a timeout for connection
      await client.connect();
      console.log('MongoDB Atlas Diagnostic - Client connected successfully');
      
      // Test admin ping
      const adminDb = client.db().admin();
      const pingResult = await adminDb.ping();
      console.log('MongoDB Atlas Diagnostic - Ping successful:', pingResult);
      
      // Test database access
      if (dbName) {
        const db = client.db(dbName);
        console.log('MongoDB Atlas Diagnostic - Testing database access...');
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log('MongoDB Atlas Diagnostic - Collections found:', collections.length);
        
        // Test a simple operation
        const testCollection = db.collection('test');
        const testDoc = { test: true, timestamp: new Date() };
        const insertResult = await testCollection.insertOne(testDoc);
        console.log('MongoDB Atlas Diagnostic - Test insert successful:', insertResult.insertedId);
        
        // Clean up test document
        await testCollection.deleteOne({ _id: insertResult.insertedId });
        console.log('MongoDB Atlas Diagnostic - Test cleanup successful');
        
        // Check users collection
        const usersCollection = db.collection('users');
        const userCount = await usersCollection.countDocuments();
        console.log('MongoDB Atlas Diagnostic - Users count:', userCount);
        
        await client.close();
        
        return NextResponse.json({
          success: true,
          message: 'MongoDB Atlas connection successful',
          details: {
            cluster: uriParts ? uriParts[3] : 'unknown',
            database: dbName,
            collectionsCount: collections.length,
            usersCount: userCount,
            ping: pingResult
          }
        });
      } else {
        await client.close();
        return NextResponse.json({
          success: false,
          message: 'Database name not specified',
          step: 'database_selection'
        }, { status: 500 });
      }
      
    } catch (connectionError) {
      await client.close().catch(() => {}); // Safe cleanup
      throw connectionError;
    }
    
  } catch (error) {
    console.error('MongoDB Atlas Diagnostic - Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as any)?.code;
    const errorCodeName = (error as any)?.codeName;
    
    // Provide specific guidance based on error type
    let troubleshooting: any[] = [];
    
    if (errorCode === 8000 || errorCodeName === 'AtlasError') {
      troubleshooting = [
        'Check if username and password are correct',
        'Verify the database user exists in MongoDB Atlas',
        'Ensure password does not contain special characters or is properly URL-encoded',
        'Check if database user has proper permissions (read/write to database)'
      ];
    } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      troubleshooting = [
        'Check your internet connection',
        'Verify IP address is whitelisted in MongoDB Atlas Network Access',
        'Try adding 0.0.0.0/0 temporarily to allow all IPs',
        'Check if firewall is blocking the connection'
      ];
    } else if (errorMessage.includes('DNS') || errorMessage.includes('hostname')) {
      troubleshooting = [
        'Check if cluster hostname is correct',
        'Verify cluster is not paused or deleted',
        'Try getting a fresh connection string from MongoDB Atlas'
      ];
    }
    
    return NextResponse.json({
      success: false,
      message: 'MongoDB Atlas connection failed',
      error: {
        message: errorMessage,
        code: errorCode,
        codeName: errorCodeName
      },
      troubleshooting,
      nextSteps: [
        '1. Log into MongoDB Atlas (https://cloud.mongodb.com/)',
        '2. Go to Database Access and check user credentials',
        '3. Go to Network Access and verify IP whitelist',
        '4. Get a fresh connection string from Connect button',
        '5. Check if cluster is active and not paused'
      ]
    }, { status: 500 });
  }
}
