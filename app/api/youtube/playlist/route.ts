import { NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const playlistId = searchParams.get('id');

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID is required" },
        { status: 400 }
      );
    }

    // First, get playlist details
    const playlistResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
    );

    if (!playlistResponse.ok) {
      throw new Error("Failed to fetch playlist details");
    }

    // Then get playlist items
    const itemsResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
    );

    if (!itemsResponse.ok) {
      throw new Error("Failed to fetch playlist items");
    }

    const itemsData = await itemsResponse.json();

    // Transform the data to match our needs
    const items = itemsData.items
      .filter((item: any) => item.snippet.title !== "Private video") // Filter out private videos
      .map((item: any) => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        description: item.snippet.description,
      }));

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("YouTube API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch playlist items" },
      { status: 500 }
    );
  }
} 