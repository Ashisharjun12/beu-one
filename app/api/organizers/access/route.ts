import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Organizer from "@/app/models/organizer.model";
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
        { error: "Organizer ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();
    const organizer = await Organizer.findById(id);
    
    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 }
      );
    }

    const fileUrl = generateFileLink(organizer.fileId);
    
    // Update organizer with the new URL
    await Organizer.findByIdAndUpdate(id, { 
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