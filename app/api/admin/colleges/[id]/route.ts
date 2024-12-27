import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import College from "@/app/models/college.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

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
    const college = await College.findByIdAndDelete(params.id);
    
    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "College deleted successfully" });
  } catch (error) {
    console.error("Failed to delete college:", error);
    return NextResponse.json(
      { error: "Failed to delete college" },
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

    const { name, location } = await req.json();

    if (!name || !location) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    await connectToDB();
    
    // Check if another college already has this name
    const existingCollege = await College.findOne({ 
      name, 
      _id: { $ne: params.id } 
    });
    
    if (existingCollege) {
      return NextResponse.json(
        { error: "College with this name already exists" },
        { status: 400 }
      );
    }

    const college = await College.findByIdAndUpdate(
      params.id,
      { name, location },
      { new: true }
    );

    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(college);
  } catch (error) {
    console.error("Failed to update college:", error);
    return NextResponse.json(
      { error: "Failed to update college" },
      { status: 500 }
    );
  }
} 