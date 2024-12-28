import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Note from "@/app/models/note.model";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Set max duration to 300 seconds

export async function GET() {
  try {
    await connectToDB();
    
    // Use lean() for better performance and select only needed fields
    const notes = await Note.find({})
      .select('title yearId semesterId subject branch fileUrl description uploader')
      .populate('yearId', 'value label')
      .populate('semesterId', 'value label')
      .populate('subject', 'name code')
      .populate('branch', 'name code')
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 })
      .lean()
      .limit(50); // Limit results for better performance

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
} 