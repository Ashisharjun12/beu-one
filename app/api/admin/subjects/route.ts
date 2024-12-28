import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import { Subject } from "@/app/models/subject.model";
import { Branch } from "@/app/models/branch.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    await connectToDB();
    const subjects = await Subject.find({})
      .populate('branchId', 'name code')
      .populate('yearId', 'value label')
      .populate('semesterId', 'value label')
      .populate('creditId', 'value label')
      .sort({ createdAt: -1 });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    const body = await req.json();

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );
    }

    if (!body.code?.trim()) {
      return NextResponse.json(
        { error: "Subject code is required" },
        { status: 400 }
      );
    }

    if (!body.branchId || !body.yearId || !body.semesterId || !body.creditId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const subject = await Subject.create({
      name: body.title.trim(),
      code: body.code.trim().toUpperCase(),
      branchId: body.branchId,
      yearId: body.yearId,
      semesterId: body.semesterId,
      creditId: body.creditId,
      description: body.description?.trim()
    });
    
    const populatedSubject = await Subject.findById(subject._id)
      .populate('branchId')
      .populate('yearId')
      .populate('semesterId')
      .populate('creditId');

    return NextResponse.json(populatedSubject, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create subject:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    const subject = await Subject.findByIdAndDelete(id);
    
    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const subject = await Subject.findByIdAndUpdate(
      id,
      {
        name: body.title.trim(),
        code: body.code.trim().toUpperCase(),
        branchId: body.branchId,
        yearId: body.yearId,
        semesterId: body.semesterId,
        creditId: body.creditId,
        description: body.description?.trim()
      },
      { new: true }
    ).populate('branchId', 'name code')
     .populate('yearId', 'value label')
     .populate('semesterId', 'value label')
     .populate('creditId', 'value label');

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subject);
  } catch (error: any) {
    console.error("Failed to update subject:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Subject code must be unique" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}


