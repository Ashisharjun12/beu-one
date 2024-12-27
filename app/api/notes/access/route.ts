import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Note from "@/app/models/note.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { generateFileLink } from "@/app/lib/appwrite";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();
    const note = await Note.findById(id);
    
    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    // Generate a new file URL
    const fileUrl = generateFileLink(note.fileId);
    
    // Update note with the new URL
    await Note.findByIdAndUpdate(id, { 
      fileUrl,
      lastAccessedBy: session.user.id,
      lastAccessedAt: new Date()
    });

    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error("Failed to generate file access:", error);
    return NextResponse.json(
      { error: "Failed to generate file access" },
      { status: 500 }
    );
  }
} 