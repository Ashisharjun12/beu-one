import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import StudySession from "@/app/models/study-session.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    const studySession = await StudySession.findOne({
      _id: params.id,
      userId: session.user.id
    })
    .populate({
      path: 'papers.paperId',
      select: 'title fileUrl'
    })
    .populate({
      path: 'notes.noteId',
      select: 'title fileUrl'
    });

    if (!studySession) {
      return NextResponse.json(
        { error: "Study session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(studySession);
  } catch (error) {
    console.error("Failed to fetch study session:", error);
    return NextResponse.json(
      { error: "Failed to fetch study session" },
      { status: 500 }
    );
  }
} 