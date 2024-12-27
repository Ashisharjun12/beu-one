import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import College from "@/app/models/college.model";
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
    const colleges = await College.find({})
      .sort({ name: 1 });

    return NextResponse.json(colleges);
  } catch (error) {
    console.error("Failed to fetch colleges:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
} 