import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import UniversityPaper from "@/app/models/university-paper.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    const body = await req.json();

    // Extract fileId from the file object
    const fileData = body.fileId;
    const fileId = typeof fileData === 'object' ? fileData.fileId : fileData;

    // Create paper with the correct fileId and uploader
    const paper = await UniversityPaper.create({
      title: body.title,
      subject: body.subject,
      year: body.year,
      fileId: fileId,
      fileUrl: body.fileUrl,
      description: body.description,
      uploader: session.user.id
    });

    const populatedPaper = await UniversityPaper.findById(paper._id)
      .populate('subject')
      .populate('year')
      .populate('uploader', 'name email');

    return NextResponse.json(populatedPaper, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create university paper:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Paper already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create university paper" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDB();
    const papers = await UniversityPaper.find({})
      .populate('subject')
      .populate('year')
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 });
    return NextResponse.json(papers);
  } catch (error) {
    console.error("Failed to fetch university papers:", error);
    return NextResponse.json(
      { error: "Failed to fetch university papers" },
      { status: 500 }
    );
  }
} 