import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// During build, return a minimal handler to prevent build failures
const buildHandler = () => new Response("Build mode", { status: 200 });

let GET, POST;

if (process.env.SKIP_DB_VALIDATION === "true" || !process.env.MONGODB_URI) {
  GET = buildHandler;
  POST = buildHandler;
} else {
  const handler = NextAuth(authOptions);
  GET = handler;
  POST = handler;
}

export { GET, POST };
