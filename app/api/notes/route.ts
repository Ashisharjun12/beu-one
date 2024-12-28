import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Note from "@/app/models/note.model";

export async function GET() {
  try {
    await connectToDB();
    const notes = await Note.find({})
      .populate({
        path: 'branch',
        select: 'name code'
      })
      .populate({
        path: 'subject',
        select: 'name code'
      })
      .populate({
        path: 'yearId',
        select: 'value label'
      })
      .populate({
        path: 'semesterId',
        select: 'value label'
      })
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