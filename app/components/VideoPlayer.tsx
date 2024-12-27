"use client";

import { useState, useEffect } from "react";
import YouTube from 'react-youtube';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  playlistId?: string;
  title: string;
  description?: string;
  isEmbedded?: boolean;
}

interface PlaylistItem {
  videoId: string;
  title: string;
  thumbnail: string;
  description?: string;
}

export default function VideoPlayer({ 
  videoId, 
  playlistId, 
  title, 
  description,
  isEmbedded = false 
}: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState(videoId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistItems();
    }
  }, [playlistId]);

  const fetchPlaylistItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/youtube/playlist?id=${playlistId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch playlist");
      }
      const data = await response.json();
      setPlaylistItems(data.items);
    } catch (error: any) {
      console.error("Error fetching playlist:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const PlaylistSidebar = () => (
    <div className="w-80 border-l bg-background overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-background z-10">
        <h3 className="font-semibold">Playlist Videos</h3>
      </div>
      <div className="divide-y">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-500">{error}</div>
        ) : (
          playlistItems.map((item) => (
            <button
              key={item.videoId}
              onClick={() => setCurrentVideoId(item.videoId)}
              className={cn(
                "w-full p-4 flex gap-3 hover:bg-accent transition-colors text-left",
                currentVideoId === item.videoId && "bg-accent"
              )}
            >
              <div className="flex-shrink-0 w-32 aspect-video relative rounded overflow-hidden">
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">
                  {item.title}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  if (isEmbedded) {
    return (
      <div className="flex h-full">
        <div className="flex-1">
          <YouTube
            videoId={currentVideoId}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 0,
                modestbranding: 1,
                rel: 0,
              },
            }}
            className="w-full h-full"
          />
        </div>
        {playlistId && <PlaylistSidebar />}
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background flex",
      isFullscreen ? "p-0" : "p-6"
    )}>
      <div className="bg-white rounded-lg shadow-lg flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="relative aspect-video bg-black">
            <YouTube
              videoId={currentVideoId}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 1,
                  modestbranding: 1,
                  rel: 0,
                },
              }}
              className="absolute inset-0"
            />
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold">{title}</h2>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {playlistId && <PlaylistSidebar />}
      </div>
    </div>
  );
}