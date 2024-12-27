import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import VideoLecture from "@/app/models/video-lecture.model";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const lecture = await VideoLecture.findById(params.id)
      .populate('subject', 'name code')
      .populate('uploader', 'name email');

    if (!lecture) {
      return NextResponse.json(
        { error: "Lecture not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(lecture);
  } catch (error) {
    console.error("Failed to fetch lecture:", error);
    return NextResponse.json(
      { error: "Failed to fetch lecture" },
      { status: 500 }
    );
  }
} 