import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Organizer from "@/app/models/organizer.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import Year from "@/app/models/academic/year.model";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    const { title, yearId, branch, description, fileId } = await req.json();

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!yearId) {
      return NextResponse.json(
        { error: "Year is required" },
        { status: 400 }
      );
    }

    if (!branch) {
      return NextResponse.json(
        { error: "Branch is required" },
        { status: 400 }
      );
    }

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Validate year reference exists
    const year = await Year.findById(yearId);
    if (!year) {
      return NextResponse.json(
        { error: "Invalid year selected" },
        { status: 400 }
      );
    }

    const organizer = await Organizer.create({
      title: title.trim(),
      yearId,
      branch,
      description: description?.trim(),
      fileId,
      uploader: session.user.id  // Add uploader from session
    });

    const populatedOrganizer = await Organizer.findById(organizer._id)
      .populate('yearId', 'value label')
      .populate('branch', 'name code')
      .populate('uploader', 'name email');

    return NextResponse.json(populatedOrganizer, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create organizer:", error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: "Please fill all required fields" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create organizer" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDB();
    const organizers = await Organizer.find({})
      .populate('yearId', 'value label')
      .populate('branch', 'name code')
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 });
    return NextResponse.json(organizers);
  } catch (error) {
    console.error("Failed to fetch organizers:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizers" },
      { status: 500 }
    );
  }
} 