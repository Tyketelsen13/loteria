import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "./mongodb";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Timeout for Vercel
          const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout')), 4000)
          );

          const authPromise = async () => {
            const client = await clientPromise;
            const users = client.db(process.env.MONGODB_DB).collection('users');
            
            const user = await users.findOne({ email: credentials.email });
            
            if (user && await bcrypt.compare(credentials.password, user.password)) {
              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                image: user.image
              };
            }
            return null;
          };

          const result = await Promise.race([authPromise(), timeoutPromise]);
          return result;
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
        
        // Optimized for Vercel - skip database fetch in session callback
        // User data should be fresh from JWT token
        if (token.name) session.user.name = token.name;
        if (token.image) session.user.image = token.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // Vercel optimization
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
  },
};
