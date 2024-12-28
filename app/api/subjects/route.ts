import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Subject from "@/app/models/subject.model";
import Branch from "@/app/models/branch.model";
import Year from "@/app/models/academic/year.model";
import Semester from "@/app/models/academic/semester.model";
import Credit from "@/app/models/academic/credit.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDB();
    const subjects = await Subject.find({}).lean();
    
    // Manually populate the references
    const populatedSubjects = await Promise.all(subjects.map(async (subject) => {
      const [branch, year, semester, credit] = await Promise.all([
        Branch.findById(subject.branchId).lean(),
        Year.findById(subject.yearId).lean(),
        Semester.findById(subject.semesterId).lean(),
        Credit.findById(subject.creditId).lean()
      ]);

      return {
        ...subject,
        branch,
        year,
        semester,
        credit
      };
    }));

    return NextResponse.json(populatedSubjects);
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

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
    const { name, code, branchId, yearId, semesterId, creditId, description } = await req.json();

    // Create the subject
    const subject = await Subject.create({
      name,
      code,
      branchId,
      yearId,
      semesterId,
      creditId,
      description
    });

    // Manually populate the references
    const [branch, year, semester, credit] = await Promise.all([
      Branch.findById(branchId).lean(),
      Year.findById(yearId).lean(),
      Semester.findById(semesterId).lean(),
      Credit.findById(creditId).lean()
    ]);

    const populatedSubject = {
      ...subject.toObject(),
      branch,
      year,
      semester,
      credit
    };

    return NextResponse.json(populatedSubject, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create subject:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Subject code must be unique" },
        { status: 400 }
      );
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create subject" },
      { status: 500 }
    );
  }
} 