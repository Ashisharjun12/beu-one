import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Branch from "@/app/models/branch.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Helper function to check admin role
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function POST(req: Request) {
  try {
    // Check if user is admin
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    await connectToDB();
    const body = await req.json();
    
    const newBranch = await Branch.create(body);
    
    return NextResponse.json(newBranch, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create branch:", error);
    return NextResponse.json(
      { error: error.code === 11000 ? "Branch already exists" : "Failed to create branch" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if user is admin
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    await connectToDB();
    const branches = await Branch.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(branches);
  } catch (error) {
    console.error("Failed to fetch branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('id');

    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();
    const deletedBranch = await Branch.findByIdAndDelete(branchId);

    if (!deletedBranch) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.error("Failed to delete branch:", error);
    return NextResponse.json(
      { error: "Failed to delete branch" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('id');
    const body = await req.json();

    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();
    const updatedBranch = await Branch.findByIdAndUpdate(
      branchId,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBranch);
  } catch (error: any) {
    console.error("Failed to update branch:", error);
    return NextResponse.json(
      { error: error.code === 11000 ? "Branch already exists" : "Failed to update branch" },
      { status: 500 }
    );
  }
} 