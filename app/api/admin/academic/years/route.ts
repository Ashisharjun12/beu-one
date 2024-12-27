import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import Year from "@/app/models/academic/year.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    await connectToDB();
    const years = await Year.find({}).sort({ value: 1 });
    return NextResponse.json(years);
  } catch (error) {
    console.error("Failed to fetch years:", error);
    return NextResponse.json(
      { error: "Failed to fetch years" },
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
    const year = await Year.create(body);
    return NextResponse.json(year, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create year:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create year" },
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
        { error: "Year ID is required" },
        { status: 400 }
      );
    }

    const year = await Year.findByIdAndDelete(id);
    
    if (!year) {
      return NextResponse.json(
        { error: "Year not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Year deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete year:", error);
    return NextResponse.json(
      { error: "Failed to delete year" },
      { status: 500 }
    );
  }
} 