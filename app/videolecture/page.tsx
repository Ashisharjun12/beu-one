"use client";

import dynamic from 'next/dynamic';
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "plyr-react/plyr.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface VideoDetails {
  title: string;
  description: string;
  channelTitle: string;
  viewCount: string;
}

// Dynamically import Plyr with no SSR
const Plyr = dynamic(() => import('plyr-react'), {
  ssr: false,
});

export default function VideoLecturePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoId = searchParams.get("v");
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const plyrProps = {
    source: {
      type: "video",
      sources: [
        {
          src: `https://www.youtube.com/embed/${videoId}`,
          provider: "youtube",
        },
      ],
    },
    options: {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'airplay',
        'fullscreen',
      ],
      settings: ['captions', 'quality', 'speed'],
      quality: {
        default: 1080,
        options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240],
      },
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      },
      youtube: {
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
      },
    },
  };

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      const response = await fetch(`/api/youtube/video-details?videoId=${videoId}`);
      if (!response.ok) throw new Error("Failed to fetch video details");
      const data = await response.json();
      setVideoDetails(data);
    } catch (error) {
      console.error("Error fetching video details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!videoId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>No video selected</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            asChild
          >
            <a 
              href={`https://youtube.com/watch?v=${videoId}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Open in YouTube
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <Plyr {...plyrProps} />
            </div>
            
            {videoDetails && (
              <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  {videoDetails.title}
                </h1>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>{videoDetails.channelTitle}</p>
                  <p>{videoDetails.viewCount} views</p>
                </div>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {videoDetails.description}
                  </p>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Sidebar - Related Content */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Course Content</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  This is a single lecture video. For more related content:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Check out the channel for more videos</li>
                  <li>• Browse our notes section for related topics</li>
                  <li>• Ask our AI assistant for recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 