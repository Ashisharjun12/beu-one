import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import VideoLecture from "@/app/models/video-lecture.model";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');

    await connectToDB();
    const query = subject ? { subject } : {};
    
    const lectures = await VideoLecture.find(query)
      .populate('subject', 'name code')
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(lectures);
  } catch (error) {
    console.error("Failed to fetch lectures:", error);
    return NextResponse.json(
      { error: "Failed to fetch lectures" },
      { status: 500 }
    );
  }
} 