import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import VideoLecture from "@/app/models/video-lecture.model";
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
    const { title, subject, type, videoUrl, description } = await req.json();

    if (!title || !subject || !type || !videoUrl) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const lecture = await VideoLecture.create({
      title,
      subject,
      type,
      videoUrl,
      description,
      uploader: session.user.id,
    });

    const populatedLecture = await VideoLecture.findById(lecture._id)
      .populate('subject', 'name code')
      .populate('uploader', 'name email');

    return NextResponse.json(populatedLecture, { status: 201 });
  } catch (error) {
    console.error("Failed to create video lecture:", error);
    return NextResponse.json(
      { error: "Failed to create video lecture" },
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
    const lectures = await VideoLecture.find({})
      .populate('subject', 'name code')
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(lectures);
  } catch (error) {
    console.error("Failed to fetch video lectures:", error);
    return NextResponse.json(
      { error: "Failed to fetch video lectures" },
      { status: 500 }
    );
  }
} 