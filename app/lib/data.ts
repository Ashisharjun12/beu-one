import { connectToDB } from "@/app/lib/db";
import Branch from "@/app/models/branch.model";

export async function getBranches() {
  try {
    await connectToDB();
    const branches = await Branch.find({}).sort({ name: 1 });
    return JSON.parse(JSON.stringify(branches)); // Serialize for Next.js
  } catch (error) {
    console.error("Failed to fetch branches:", error);
    return [];
  }
} 