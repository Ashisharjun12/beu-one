import { NextResponse } from "next/server";
import { google } from 'googleapis';

const youtube = google.youtube('v3');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const response = await youtube.search.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet'],
      q: query,
      maxResults: 5,
      type: ['video'],
      videoDuration: 'medium',
    });

    const videos = response.data.items?.map(item => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
    })) || [];

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json(
      { error: "Failed to search videos" },
      { status: 500 }
    );
  }
} 