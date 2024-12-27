import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import College from "@/app/models/college.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    await connectToDB();
    const colleges = await College.find({}).sort({ name: 1 });
    return NextResponse.json(colleges);
  } catch (error) {
    console.error("Failed to fetch colleges:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    const { name, place } = await req.json();

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "College name is required" },
        { status: 400 }
      );
    }

    if (!place?.trim()) {
      return NextResponse.json(
        { error: "College place is required" },
        { status: 400 }
      );
    }

    const college = await College.create({
      name: name.trim(),
      place: place.trim()
    });

    return NextResponse.json(college, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create college:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "College name must be unique" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create college" },
      { status: 500 }
    );
  }
} 