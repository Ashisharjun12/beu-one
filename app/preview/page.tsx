"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import VideoPlayer from "../components/VideoPlayer";

interface VideoLecture {
  _id: string;
  title: string;
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  type: 'single' | 'playlist';
  videoUrl: string;
  description?: string;
}

function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getYouTubePlaylistId(url: string): string | null {
  const regExp = /[&?]list=([^&]+)/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const lectureId = searchParams.get('id');
  const [lecture, setLecture] = useState<VideoLecture | null>(null);
  const [relatedLectures, setRelatedLectures] = useState<VideoLecture[]>([]);

  useEffect(() => {
    if (lectureId) {
      fetchLecture(lectureId);
    }
  }, [lectureId]);

  const fetchLecture = async (id: string) => {
    try {
      const response = await fetch(`/api/video-lectures/${id}`);
      if (!response.ok) throw new Error("Failed to fetch lecture");
      const data = await response.json();
      setLecture(data);

      // Fetch related lectures (same subject)
      const relatedResponse = await fetch(`/api/video-lectures?subject=${data.subject._id}`);
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        setRelatedLectures(relatedData.filter((l: VideoLecture) => l._id !== id));
      }
    } catch (error) {
      console.error("Error fetching lecture:", error);
    }
  };

  if (!lecture) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/admin/video-lectures">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Video Lectures
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="rounded-lg overflow-hidden bg-card">
              <div className="aspect-video bg-black">
                <VideoPlayer
                  videoId={getYouTubeVideoId(lecture.videoUrl) || ''}
                  playlistId={lecture.type === 'playlist' ? getYouTubePlaylistId(lecture.videoUrl) || undefined : undefined}
                  title={lecture.title}
                  description={lecture.description}
                  isEmbedded={true}
                />
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold">{lecture.title}</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {lecture.subject.name} • {lecture.type === 'playlist' ? 'Playlist' : 'Single Video'}
                </p>
                {lecture.description && (
                  <p className="mt-4 text-muted-foreground">{lecture.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-card">
              <h2 className="p-4 font-semibold border-b">Related Videos</h2>
              <div className="divide-y">
                {relatedLectures.map((relatedLecture) => (
                  <Link
                    key={relatedLecture._id}
                    href={`/preview?id=${relatedLecture._id}`}
                    className="block p-4 hover:bg-accent transition-colors"
                  >
                    <h3 className="font-medium line-clamp-2">{relatedLecture.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {relatedLecture.type === 'playlist' ? 'Playlist' : 'Single Video'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 