"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayCircle, ListVideo } from "lucide-react";
import Link from "next/link";

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  playlistId?: string;
}

interface Playlist {
  _id: string;
  title: string;
  description: string;
  videos: Video[];
  thumbnail?: string;
}

export default function WatchPage() {
  const { id } = useParams();
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [relatedPlaylists, setRelatedPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    fetchVideoDetails();
  }, [id]);

  const fetchVideoDetails = async () => {
    try {
      // Fetch current video
      const videoRes = await fetch(`/api/videos/${id}`);
      const videoData = await videoRes.json();
      setCurrentVideo(videoData);

      // If video is part of a playlist, fetch playlist details
      if (videoData.playlistId) {
        const playlistRes = await fetch(`/api/playlists/${videoData.playlistId}`);
        const playlistData = await playlistRes.json();
        setCurrentPlaylist(playlistData);
      }

      // Fetch related content
      const [relatedVideosRes, relatedPlaylistsRes] = await Promise.all([
        fetch(`/api/videos/related/${id}`),
        fetch(`/api/playlists/related/${id}`)
      ]);

      const [relatedVideosData, relatedPlaylistsData] = await Promise.all([
        relatedVideosRes.json(),
        relatedPlaylistsRes.json()
      ]);

      setRelatedVideos(relatedVideosData);
      setRelatedPlaylists(relatedPlaylistsData);
    } catch (error) {
      console.error("Failed to fetch video details:", error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Main Content */}
      <div className="space-y-6">
        {/* Video Player Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              {currentVideo?.url && (
                <iframe
                  src={currentVideo.url}
                  className="w-full h-full"
                  allowFullScreen
                />
              )}
            </div>
            <h1 className="text-2xl font-bold">{currentVideo?.title}</h1>
            <p className="text-muted-foreground">{currentVideo?.description}</p>
          </div>

          {/* Playlist Sidebar */}
          {currentPlaylist && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ListVideo className="w-5 h-5" />
                Playlist Videos
              </h2>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                  {currentPlaylist.videos.map((video) => (
                    <Link 
                      key={video._id} 
                      href={`/watch/${video._id}`}
                      className={`block p-2 rounded-lg hover:bg-accent ${
                        video._id === id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex gap-2">
                        {video.thumbnail ? (
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-24 h-16 bg-muted rounded flex items-center justify-center">
                            <PlayCircle className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-2">{video.title}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Related Content Section - Always at Bottom */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Related Content</h2>
          <Tabs defaultValue="videos">
            <TabsList>
              <TabsTrigger value="videos">Related Videos</TabsTrigger>
              <TabsTrigger value="playlists">Related Playlists</TabsTrigger>
            </TabsList>
            <TabsContent value="videos">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedVideos.map((video) => (
                  <Link key={video._id} href={`/watch/${video._id}`}>
                    <Card>
                      <CardContent className="p-3 space-y-2">
                        {video.thumbnail ? (
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full aspect-video object-cover rounded"
                          />
                        ) : (
                          <div className="w-full aspect-video bg-muted rounded flex items-center justify-center">
                            <PlayCircle className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <h3 className="font-medium line-clamp-2">{video.title}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="playlists">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedPlaylists.map((playlist) => (
                  <Link key={playlist._id} href={`/playlist/${playlist._id}`}>
                    <Card>
                      <CardContent className="p-3 space-y-2">
                        {playlist.thumbnail ? (
                          <img 
                            src={playlist.thumbnail} 
                            alt={playlist.title}
                            className="w-full aspect-video object-cover rounded"
                          />
                        ) : (
                          <div className="w-full aspect-video bg-muted rounded flex items-center justify-center">
                            <ListVideo className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <h3 className="font-medium line-clamp-2">{playlist.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {playlist.videos.length} videos
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 