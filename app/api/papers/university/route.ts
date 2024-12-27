import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import UniversityPaper from "@/app/models/university-paper.model";

export async function GET() {
  try {
    await connectToDB();
    const papers = await UniversityPaper.find({})
      .populate('subject', 'name code branch semester year credits')
      .populate({
        path: 'subject',
        populate: [
          { path: 'branchId', select: 'name code' },
          { path: 'semesterId', select: 'value label' },
          { path: 'yearId', select: 'value label' },
          { path: 'creditId', select: 'theory practical total' }
        ]
      })
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