import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Voice from "@/app/models/voice.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const voice = await Voice.create({
      content: content.trim(),
      user: session.user.id,
    });

    const populatedVoice = await Voice.findById(voice._id)
      .populate('user', 'name image')
      .lean();

    return NextResponse.json(populatedVoice, { status: 201 });
  } catch (error) {
    console.error("Failed to create voice:", error);
    return NextResponse.json(
      { error: "Failed to create voice" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDB();
    const voices = await Voice.find({ status: 'active' })
      .populate('user', 'name image')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(voices);
  } catch (error) {
    console.error("Failed to fetch voices:", error);
    return NextResponse.json(
      { error: "Failed to fetch voices" },
      { status: 500 }
    );
  }
} 