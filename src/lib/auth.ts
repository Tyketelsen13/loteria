import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "./mongodb";
import bcrypt from "bcrypt";

// Skip database operations during build time
const skipDB = process.env.SKIP_DB_VALIDATION === "true";

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
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const user = await db.collection("users").findOne({ email: credentials.email });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return { 
          id: user._id.toString(), 
          email: user.email, 
          name: user.name,
          image: user.image 
        };
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
};
