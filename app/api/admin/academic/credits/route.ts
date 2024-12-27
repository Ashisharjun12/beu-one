import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Credit from "@/app/models/academic/credit.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    await connectToDB();
    const credits = await Credit.find({}).sort({ value: 1 });
    return NextResponse.json(credits);
  } catch (error) {
    console.error("Failed to fetch credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const credit = await Credit.create(body);
    return NextResponse.json(credit, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create credit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create credit" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Credit ID is required" },
        { status: 400 }
      );
    }

    const credit = await Credit.findByIdAndDelete(id);
    
    if (!credit) {
      return NextResponse.json(
        { error: "Credit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Credit deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete credit:", error);
    return NextResponse.json(
      { error: "Failed to delete credit" },
      { status: 500 }
    );
  }
} 