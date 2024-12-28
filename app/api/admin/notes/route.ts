import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Note from "@/app/models/note.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { generateFilePreviewURL } from '@/app/lib/appwrite';

export const dynamic = 'force-dynamic';

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
    const body = await req.json();

    // Extract fileId from the file object if it's an object
    const fileData = body.fileId;
    const fileId = typeof fileData === 'object' ? fileData.fileId : fileData;
    const fileUrl = typeof fileData === 'object' ? generateFilePreviewURL(fileId) : null;

    // Create note with extracted fileId
    const note = await Note.create({
      title: body.title,
      yearId: body.yearId,
      semesterId: body.semesterId,
      subject: body.subject,
      branch: body.branch,
      fileId: fileId,
      fileUrl: fileUrl,
      description: body.description,
      uploader: session.user.id
    });

    const populatedNote = await Note.findById(note._id)
      .populate('yearId')
      .populate('semesterId')
      .populate('subject')
      .populate('branch')
      .populate('uploader', 'name email');

    return NextResponse.json(populatedNote, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create note:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Note already exists" },
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