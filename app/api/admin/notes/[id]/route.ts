import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Note from "@/app/models/note.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { deletePDF } from "@/app/lib/appwrite";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    const note = await Note.findById(params.id);
    
    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    // Delete file from Appwrite
    if (note.fileId) {
      await deletePDF(note.fileId);
    }

    // Delete note from database
    await Note.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Failed to delete note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, subject, branch, year, semester, description } = await req.json();

    await connectToDB();
    
    const note = await Note.findByIdAndUpdate(
      params.id,
      { title, subject, branch, year, semester, description },
      { new: true }
    )
    .populate('subject', 'name code')
    .populate('branch', 'name code')
    .populate('uploader', 'name email');

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Failed to update note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
} 