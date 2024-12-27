import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Branch from "@/app/models/branch.model";

export async function GET() {
  try {
    await connectToDB();
    const branches = await Branch.find({}).sort({ name: 1 });
    return NextResponse.json(branches);
  } catch (error) {
    console.error("Failed to fetch branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
} 