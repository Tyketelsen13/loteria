import { NextRequest } from 'next/server';
import { GET } from '@/app/api/user-profile/route';

// Mock the Next.js environment
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init = {}) => ({
      json: () => Promise.resolve(data),
      status: init.status || 200,
      headers: new Map([['content-type', 'application/json']])
    }))
  }
}));

// Mock MongoDB client
jest.mock('@/lib/mongodb', () => {
  const mockDb = {
    collection: jest.fn(() => ({
      findOne: jest.fn()
    }))
  };
  
  const mockClient = {
    db: jest.fn(() => mockDb)
  };
  
  return {
    __esModule: true,
    default: Promise.resolve(mockClient)
  };
});

describe('/api/user-profile', () => {
  let mockRequest: any;
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock request - simplified for testing
    mockRequest = {} as NextRequest;

    // Get the mocked MongoDB instances
    const clientPromise = require('@/lib/mongodb').default;
    clientPromise.then((client: any) => {
      mockDb = client.db();
      mockCollection = mockDb.collection();
    });
  });

  it('returns specific user when tyketelsen@aol.com exists', async () => {
    const mockUser = {
      email: 'tyketelsen@aol.com',
      name: 'Tyler Ketelsen'
    };

    // Mock the MongoDB client and collection
    const clientPromise = require('@/lib/mongodb').default;
    await clientPromise.then((client: any) => {
      const db = client.db();
      const collection = db.collection();
      collection.findOne
        .mockResolvedValueOnce(mockUser) // First call finds tyketelsen@aol.com
        .mockResolvedValueOnce(null); // Second call shouldn't happen
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: 'ok',
      user: {
        name: 'Tyler Ketelsen',
        email: 'tyketelsen@aol.com'
      }
    });
  });

  it('returns first user when tyketelsen@aol.com does not exist', async () => {
    const mockFallbackUser = {
      email: 'first@example.com',
      name: 'First User'
    };

    const clientPromise = require('@/lib/mongodb').default;
    await clientPromise.then((client: any) => {
      const db = client.db();
      const collection = db.collection();
      collection.findOne
        .mockResolvedValueOnce(null) // First call doesn't find tyketelsen@aol.com
        .mockResolvedValueOnce(mockFallbackUser); // Second call finds first user
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: 'ok',
      user: {
        name: 'First User',
        email: 'first@example.com'
      }
    });
  });

  it('returns 404 when no users exist in database', async () => {
    const clientPromise = require('@/lib/mongodb').default;
    await clientPromise.then((client: any) => {
      const db = client.db();
      const collection = db.collection();
      collection.findOne
        .mockResolvedValueOnce(null) // tyketelsen@aol.com not found
        .mockResolvedValueOnce(null); // No users found at all
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      status: 'no_users',
      message: 'No users found in database'
    });
  });

  it('handles database connection errors', async () => {
    const clientPromise = require('@/lib/mongodb').default;
    await clientPromise.then((client: any) => {
      const db = client.db();
      const collection = db.collection();
      collection.findOne.mockRejectedValue(new Error('Database connection failed'));
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Database connection failed'
    });
  });

  it('uses correct database name from environment', async () => {
    const originalEnv = process.env.MONGODB_DB;
    process.env.MONGODB_DB = 'test-database';

    const mockUser = {
      email: 'tyketelsen@aol.com',
      name: 'Tyler Ketelsen'
    };

    const clientPromise = require('@/lib/mongodb').default;
    await clientPromise.then((client: any) => {
      const db = client.db();
      const collection = db.collection();
      collection.findOne.mockResolvedValueOnce(mockUser);
    });

    await GET(mockRequest);

    // Verify the correct database was accessed
    const client = await clientPromise;
    expect(client.db).toHaveBeenCalledWith('test-database');

    // Restore original environment
    process.env.MONGODB_DB = originalEnv;
  });

  it('calls findOne with correct parameters for specific user', async () => {
    const mockUser = {
      email: 'tyketelsen@aol.com',
      name: 'Tyler Ketelsen'
    };

    const clientPromise = require('@/lib/mongodb').default;
    await clientPromise.then((client: any) => {
      const db = client.db();
      const collection = db.collection();
      collection.findOne.mockResolvedValueOnce(mockUser);
    });

    await GET(mockRequest);

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection();

    // Check first call for specific user
    expect(collection.findOne).toHaveBeenCalledWith(
      { email: 'tyketelsen@aol.com' },
      { projection: { email: 1, name: 1, _id: 0 } }
    );
  });

  it('calls findOne with correct parameters for fallback user', async () => {
    const mockFallbackUser = {
      email: 'first@example.com',
      name: 'First User'
    };

    const clientPromise = require('@/lib/mongodb').default;
    await clientPromise.then((client: any) => {
      const db = client.db();
      const collection = db.collection();
      collection.findOne
        .mockResolvedValueOnce(null) // tyketelsen@aol.com not found
        .mockResolvedValueOnce(mockFallbackUser); // fallback user found
    });

    await GET(mockRequest);

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection();

    // Check second call for any user
    expect(collection.findOne).toHaveBeenCalledWith(
      {},
      { projection: { email: 1, name: 1, _id: 0 } }
    );
  });

  it('handles user with no name field', async () => {
    const mockUser = {
      email: 'noname@example.com'
      // name field is missing
    };

    const clientPromise = require('@/lib/mongodb').default;
    await clientPromise.then((client: any) => {
      const db = client.db();
      const collection = db.collection();
      collection.findOne.mockResolvedValueOnce(mockUser);
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: 'ok',
      user: {
        name: 'User', // Default fallback name
        email: 'noname@example.com'
      }
    });
  });

  it('returns correct content type header', async () => {
    const mockUser = {
      email: 'tyketelsen@aol.com',
      name: 'Tyler Ketelsen'
    };

    const clientPromise = require('@/lib/mongodb').default;
    await clientPromise.then((client: any) => {
      const db = client.db();
      const collection = db.collection();
      collection.findOne.mockResolvedValueOnce(mockUser);
    });

    const response = await GET(mockRequest);

    expect(response.headers.get('content-type')).toContain('application/json');
  });

  it('logs appropriate debug information', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const mockUser = {
      email: 'tyketelsen@aol.com',
      name: 'Tyler Ketelsen'
    };

    const clientPromise = require('@/lib/mongodb').default;
    await clientPromise.then((client: any) => {
      const db = client.db();
      const collection = db.collection();
      collection.findOne.mockResolvedValueOnce(mockUser);
    });

    await GET(mockRequest);

    expect(consoleSpy).toHaveBeenCalledWith('User profile - Raw user data:', mockUser);
    expect(consoleSpy).toHaveBeenCalledWith('User profile - Returning:', {
      status: 'ok',
      user: {
        name: 'Tyler Ketelsen',
        email: 'tyketelsen@aol.com'
      }
    });

    consoleSpy.mockRestore();
  });
});
