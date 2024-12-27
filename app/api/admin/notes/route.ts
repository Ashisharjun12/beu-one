import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Note from "@/app/models/note.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import Year from "@/app/models/academic/year.model";
import Semester from "@/app/models/academic/semester.model";

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
    const { title, yearId, semesterId, subject, branch, description, fileId } = await req.json();

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Validate references exist
    const [year, semester] = await Promise.all([
      Year.findById(yearId),
      Semester.findById(semesterId)
    ]);

    if (!year) {
      return NextResponse.json(
        { error: "Invalid year selected" },
        { status: 400 }
      );
    }

    if (!semester) {
      return NextResponse.json(
        { error: "Invalid semester selected" },
        { status: 400 }
      );
    }

    const note = await Note.create({
      title: title.trim(),
      yearId,
      semesterId,
      subject,
      branch,
      description: description?.trim(),
      fileId,
      uploader: session.user.id
    });

    const populatedNote = await Note.findById(note._id)
      .populate('yearId', 'value label')
      .populate('semesterId', 'value label')
      .populate('subject', 'name code')
      .populate('branch', 'name code')
      .populate('uploader', 'name email');

    return NextResponse.json(populatedNote, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create note:", error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: "Please fill all required fields" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create note" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDB();
    const notes = await Note.find({})
      .populate('yearId', 'value label')
      .populate('semesterId', 'value label')
      .populate('subject', 'name code')
      .populate('branch', 'name code')
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
} 