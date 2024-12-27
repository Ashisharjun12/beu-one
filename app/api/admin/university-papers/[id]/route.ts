import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import UniversityPaper from "@/app/models/university-paper.model";
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
    const paper = await UniversityPaper.findById(params.id);
    
    if (!paper) {
      return NextResponse.json(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    // Delete file from Appwrite
    if (paper.fileId) {
      await deletePDF(paper.fileId);
    }

    // Delete paper from database
    await UniversityPaper.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Paper deleted successfully" });
  } catch (error) {
    console.error("Failed to delete paper:", error);
    return NextResponse.json(
      { error: "Failed to delete paper" },
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

    const { title, subject, year, description } = await req.json();

    await connectToDB();
    
    const paper = await UniversityPaper.findByIdAndUpdate(
      params.id,
      { title, subject, year, description },
      { new: true }
    )
    .populate('subject', 'name code')
    .populate('uploader', 'name email');

    if (!paper) {
      return NextResponse.json(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(paper);
  } catch (error) {
    console.error("Failed to update paper:", error);
    return NextResponse.json(
      { error: "Failed to update paper" },
      { status: 500 }
    );
  }
} 