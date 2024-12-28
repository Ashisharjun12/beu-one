import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import User from "@/app/models/user.model";
import Note from "@/app/models/note.model";
import UniversityPaper from "@/app/models/university-paper.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    const [
      totalUsers,
      totalAdmins,
      totalNotes,
      totalPapers
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
      Note.countDocuments({}),
      UniversityPaper.countDocuments({})
    ]);

    return NextResponse.json({
      totalUsers,
      totalAdmins,
      totalNotes,
      totalPapers
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
} 