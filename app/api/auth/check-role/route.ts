import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import User from "@/app/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    const user = await User.findOne({ email: session.user.email });
    
    return NextResponse.json({ role: user?.role || 'user' });
  } catch {
    return NextResponse.json(
      { role: 'user' },
      { status: 500 }
    );
  }
} 