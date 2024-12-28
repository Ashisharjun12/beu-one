import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { google } from 'googleapis';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const youtube = google.youtube('v3');

async function searchYouTubeVideos(query: string) {
  try {
    const response = await youtube.search.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet'],
      q: query,
      maxResults: 3,
      type: ['video'],
      videoDuration: 'medium',
    });

    return response.data.items?.map(item => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Check if message is asking for video lectures
    const isAskingForVideo = message.toLowerCase().includes('video') || 
                            message.toLowerCase().includes('lecture') ||
                            message.toLowerCase().includes('watch');

    let aiResponse = await model.generateContent(message);
    let responseText = aiResponse.response.text();
    let videos = null;

    if (isAskingForVideo) {
      // Generate a search query for YouTube
      const searchQueryPrompt = `Generate a concise YouTube search query for: ${message}`;
      const searchQueryResponse = await model.generateContent(searchQueryPrompt);
      const searchQuery = searchQueryResponse.response.text();
      
      videos = await searchYouTubeVideos(searchQuery);

      if (videos) {
        responseText += "\n\nHere are some relevant video lectures:\n\n";
        videos.forEach((video, index) => {
          responseText += `${index + 1}. ${video.title}\n`;
        });
        responseText += "\nWould you like to watch any of these lectures?";
      }
    }

    return NextResponse.json({ 
      response: responseText,
      videos: videos,
      isVideoResponse: isAskingForVideo && videos !== null
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
} 