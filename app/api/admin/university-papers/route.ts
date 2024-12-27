import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import UniversityPaper from "@/app/models/university-paper.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

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
    const { title, subject, year, description, fileId } = await req.json();

    if (!title || !subject || !year || !fileId) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const paper = await UniversityPaper.create({
      title,
      subject,
      year,
      description,
      fileId,
      uploader: session.user.id,
    });

    const populatedPaper = await UniversityPaper.findById(paper._id)
      .populate('subject', 'name code')
      .populate('uploader', 'name email');

    return NextResponse.json(populatedPaper, { status: 201 });
  } catch (error) {
    console.error("Failed to create university paper:", error);
    return NextResponse.json(
      { error: "Failed to create university paper" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    const papers = await UniversityPaper.find({})
      .populate('subject', 'name code')
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