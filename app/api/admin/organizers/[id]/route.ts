import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Organizer from "@/app/models/organizer.model";
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
    const organizer = await Organizer.findById(params.id);
    
    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 }
      );
    }

    // Delete file from Appwrite
    if (organizer.fileId) {
      await deletePDF(organizer.fileId);
    }

    // Delete organizer from database
    await Organizer.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Organizer deleted successfully" });
  } catch (error) {
    console.error("Failed to delete organizer:", error);
    return NextResponse.json(
      { error: "Failed to delete organizer" },
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

    const { title, branch, year, description } = await req.json();

    await connectToDB();
    
    const organizer = await Organizer.findByIdAndUpdate(
      params.id,
      { title, branch, year, description },
      { new: true }
    )
    .populate('branch', 'name code')
    .populate('uploader', 'name email');

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(organizer);
  } catch (error) {
    console.error("Failed to update organizer:", error);
    return NextResponse.json(
      { error: "Failed to update organizer" },
      { status: 500 }
    );
  }
} 