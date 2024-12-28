import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Note from "@/app/models/note.model";

export const dynamic = 'force-dynamic';
export const maxDuration = 9; // Set to 9 seconds for safety margin

export async function GET() {
  try {
    await connectToDB();
    
    // Include label fields in populate
    const notes = await Note.find({})
      .select('title yearId semesterId subject branch fileUrl') 
      .populate('yearId', 'value label') // Add label field
      .populate('semesterId', 'value label') // Add label field
      .populate('subject', 'name code')
      .populate('branch', 'name code')
      .sort({ createdAt: -1 })
      .lean()
      .limit(20);

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
} 