import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Organizer from "@/app/models/organizer.model";

export async function GET() {
  try {
    await connectToDB();
    const organizers = await Organizer.find({})
      .populate({
        path: 'branch',
        select: 'name code'
      })
      .populate({
        path: 'yearId',
        select: 'value label'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(organizers);
  } catch (error) {
    console.error("Failed to fetch organizers:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizers" },
      { status: 500 }
    );
  }
} 