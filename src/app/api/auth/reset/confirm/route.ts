import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  
  const user = await db.collection("users").findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  });

  if (!user) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);

  await db.collection("users").updateOne(
    { _id: user._id },
    {
      $set: {
        password: hashed,
      },
      $unset: {
        resetToken: "",
        resetTokenExpiry: "",
      },
    }
  );

  return NextResponse.json({ ok: true });
}
