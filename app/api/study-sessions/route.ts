import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import StudySession from "@/app/models/study-session.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    // Fetch study sessions for the current user
    const studySessions = await StudySession.find({ 
      userId: session.user.id 
    })
    .populate({
      path: 'papers',
      populate: {
        path: 'paperId',
        select: 'title subject fileUrl'
      }
    })
    .populate({
      path: 'notes',
      populate: {
        path: 'noteId',
        select: 'title subject fileUrl'
      }
    })
    .sort({ createdAt: -1 });

    return NextResponse.json(studySessions);
  } catch (error) {
    console.error("Failed to fetch study sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch study sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    await connectToDB();

    // Format the papers and notes data
    const formattedData = {
      userId: session.user.id,
      title: body.title,
      description: body.description,
      papers: body.papers.map((paperId: string) => ({
        paperId,
        paperType: body.paperTypes[paperId], // 'UniversityPaper' or 'MidsemPaper'
        title: body.paperTitles[paperId],
        fileUrl: body.paperUrls[paperId]
      })),
      notes: body.notes.map((noteId: string) => ({
        noteId,
        title: body.noteTitles[noteId],
        fileUrl: body.noteUrls[noteId]
      })),
      videos: body.videos,
      status: "active"
    };

    const studySession = await StudySession.create(formattedData);
    return NextResponse.json(studySession);
  } catch (error) {
    console.error("Failed to create study session:", error);
    return NextResponse.json(
      { error: "Failed to create study session" },
      { status: 500 }
    );
  }
} 