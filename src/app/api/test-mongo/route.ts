import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    // List collections as a simple test
    const collections = await db.listCollections().toArray();
    return NextResponse.json({ ok: true, collections: collections.map(c => c.name) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
