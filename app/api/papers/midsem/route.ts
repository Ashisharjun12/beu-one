import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import MidsemPaper from "@/app/models/midsem-paper.model";

export async function GET() {
  try {
    await connectToDB();
    const papers = await MidsemPaper.find({})
      .populate('subject', 'name code')
      .populate('college', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(papers);
  } catch (error) {
    console.error("Failed to fetch midsem papers:", error);
    return NextResponse.json(
      { error: "Failed to fetch midsem papers" },
      { status: 500 }
    );
  }
} 