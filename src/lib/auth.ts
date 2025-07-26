import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "./mongodb";
import bcrypt from "bcrypt";

// Skip database operations during build time
const skipDB = process.env.SKIP_DB_VALIDATION === "true" || 
              process.env.VERCEL_ENV === "preview" ||
              process.env.VERCEL_ENV === "production" ||
              !process.env.MONGODB_URI;

export const authOptions: NextAuthOptions = {
  adapter: skipDB ? undefined : MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (skipDB) return null;
        if (!credentials || !credentials.email || !credentials.password) return null;
        
        try {
          const client = await clientPromise;
          const db = client.db(process.env.MONGODB_DB);
          const user = await db.collection("users").findOne({ email: credentials.email });
          
          if (!user || !user.password) {
            console.log('User not found or no password for:', credentials.email);
            return null;
          }
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }
          
          console.log('User authenticated successfully:', credentials.email);
          return { 
            id: user._id.toString(), 
            email: user.email, 
            name: user.name,
            image: user.image 
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: { 
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.sub || token.id;
        
        // Skip database operations during build time
        if (!skipDB) {
          // Fetch fresh user data from database to include image
          const client = await clientPromise;
          const db = client.db(process.env.MONGODB_DB);
          const user = await db.collection("users").findOne({ email: session.user.email });
          if (user) {
            session.user.image = user.image;
            session.user.name = user.name;
          }
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug logging
};

// Helper function to get authenticated user from either NextAuth session or JWT token
export async function getAuthenticatedUser(request: Request) {
  try {
    // First try NextAuth session (works in Vercel serverless functions)
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      return {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        source: 'nextauth'
      };
    }

    // If no NextAuth session, try JWT token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Ensure we have the JWT secret (required for Vercel deployment)
      if (!process.env.NEXTAUTH_SECRET) {
        console.error('NEXTAUTH_SECRET environment variable is required for JWT verification');
        return null;
      }
      
      const jwt = await import('jsonwebtoken');
      
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET) as any;
        if (decoded?.email) {
          return {
            email: decoded.email,
            name: decoded.name,
            image: decoded.image,
            source: 'jwt'
          };
        }
      } catch (jwtError) {
        console.log('JWT verification failed:', jwtError);
      }
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
