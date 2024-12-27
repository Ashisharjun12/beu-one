import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Semester from "@/app/models/academic/semester.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    await connectToDB();
    const semesters = await Semester.find({}).sort({ value: 1 });
    return NextResponse.json(semesters);
  } catch (error) {
    console.error("Failed to fetch semesters:", error);
    return NextResponse.json(
      { error: "Failed to fetch semesters" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { value, label } = await req.json();

    // Validate required fields
    if (!value || !label) {
      return NextResponse.json(
        { error: "Value and label are required" },
        { status: 400 }
      );
    }

    // Validate semester value range
    if (value < 1 || value > 8) {
      return NextResponse.json(
        { error: "Semester value must be between 1 and 8" },
        { status: 400 }
      );
    }

    const semester = await Semester.create({
      value,
      label: label.trim()
    });

    return NextResponse.json(semester, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create semester:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create semester" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Semester ID is required" },
        { status: 400 }
      );
    }

    const semester = await Semester.findByIdAndDelete(id);
    
    if (!semester) {
      return NextResponse.json(
        { error: "Semester not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Semester deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete semester:", error);
    return NextResponse.json(
      { error: "Failed to delete semester" },
      { status: 500 }
    );
  }
} 