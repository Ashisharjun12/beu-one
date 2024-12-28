import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import User from "@/app/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role } = await req.json();

    // Prevent changing super_admin roles
    const targetUser = await User.findById(params.id);
    if (targetUser.role === 'super_admin') {
      return NextResponse.json(
        { error: "Cannot modify super admin role" },
        { status: 403 }
      );
    }

    await connectToDB();
    const user = await User.findByIdAndUpdate(
      params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user role" },
      { status: 500 }
    );
  }
} 