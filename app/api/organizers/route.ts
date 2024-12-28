import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Organizer from "@/app/models/organizer.model";

export const dynamic = 'force-dynamic';
export const maxDuration = 9; // Set to 9 seconds for safety margin

export async function GET() {
  try {
    await connectToDB();
    
    const organizers = await Organizer.find({})
      .select('title yearId branch fileUrl')
      .populate('yearId', 'value label')
      .populate('branch', 'name code')
      .sort({ createdAt: -1 })
      .lean()
      .limit(20);

    return NextResponse.json(organizers);
  } catch (error) {
    console.error("Failed to fetch organizers:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizers" },
      { status: 500 }
    );
  }
} 