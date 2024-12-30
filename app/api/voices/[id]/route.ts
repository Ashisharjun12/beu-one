import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Voice from "@/app/models/voice.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Update voice
export async function PATCH(
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
    const { content } = await req.json();

    // Find voice and check ownership
    const voice = await Voice.findById(params.id);
    if (!voice) {
      return NextResponse.json(
        { error: "Voice not found" },
        { status: 404 }
      );
    }

    if (voice.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this voice" },
        { status: 403 }
      );
    }

    // Update voice
    const updatedVoice = await Voice.findByIdAndUpdate(
      params.id,
      { content },
      { new: true }
    ).populate('user', 'name image');

    return NextResponse.json(updatedVoice);
  } catch (error) {
    console.error("Failed to update voice:", error);
    return NextResponse.json(
      { error: "Failed to update voice" },
      { status: 500 }
    );
  }
}

// Delete voice
export async function DELETE(
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

    // Find voice and check ownership
    const voice = await Voice.findById(params.id);
    if (!voice) {
      return NextResponse.json(
        { error: "Voice not found" },
        { status: 404 }
      );
    }

    if (voice.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this voice" },
        { status: 403 }
      );
    }

    await Voice.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Voice deleted successfully" });
  } catch (error) {
    console.error("Failed to delete voice:", error);
    return NextResponse.json(
      { error: "Failed to delete voice" },
      { status: 500 }
    );
  }
} 