import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import MidsemPaper from "@/app/models/midsem-paper.model";
import College from "@/app/models/college.model";

export async function GET() {
  try {
    await connectToDB();
    
    // First fetch papers with subject population
    const papers = await MidsemPaper.find({})
      .populate('subject', 'name code')
      .populate({
        path: 'subject',
        populate: [
          { path: 'branchId', select: 'name code' },
          { path: 'semesterId', select: 'value label' },
          { path: 'yearId', select: 'value label' },
          { path: 'creditId', select: 'theory practical total' }
        ]
      })
      .sort({ createdAt: -1 });

    // Get all unique college IDs from papers
    const collegeIds = [...new Set(papers.map(paper => paper.college))];

    // Fetch all colleges in one query
    const colleges = await College.find({
      _id: { $in: collegeIds }
    }).select('_id name');

    // Create a map of college IDs to college names for quick lookup
    const collegeMap = new Map(
      colleges.map(college => [college._id.toString(), college.name])
    );

    // Transform papers to include college names
    const transformedPapers = papers.map(paper => {
      const paperObj = paper.toObject();
      return {
        ...paperObj,
        college: paperObj.college ? {
          name: collegeMap.get(paperObj.college.toString()) || 'Unknown College'
        } : undefined
      };
    });

    return NextResponse.json(transformedPapers);
  } catch (error) {
    console.error("Failed to fetch midsem papers:", error);
    return NextResponse.json(
      { error: "Failed to fetch midsem papers" },
      { status: 500 }
    );
  }
} 