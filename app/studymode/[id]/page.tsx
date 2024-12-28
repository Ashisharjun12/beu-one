"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  BookOpen,
  Video,
  Download,
  Eye,
  X,
  Menu,
  Loader2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

interface StudySession {
  _id: string;
  title: string;
  description: string;
  papers: Array<{
    paperId: string;
    title: string;
    fileUrl: string;
  }>;
  notes: Array<{
    noteId: string;
    title: string;
    fileUrl: string;
  }>;
  videos: Array<{
    videoId: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
  }>;
}

export default function StudySessionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<StudySession | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchStudySession();
    }
  }, [params.id]);

  const fetchStudySession = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/study-sessions/${params.id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch study session");
      }

      const data = await response.json();
      setSession(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch study session",
        variant: "destructive",
      });
      router.push('/studymode'); // Redirect back to study mode page on error
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading study session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <X className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Study Session Not Found</h3>
          <p className="text-gray-500 mb-4">The study session you're looking for doesn't exist</p>
          <Button onClick={() => router.push('/studymode')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentVideo = session?.videos[currentVideoIndex];

  const plyrProps = currentVideo ? {
    ref: playerRef,
    source: {
      type: "video",
      sources: [
        {
          src: `https://www.youtube.com/embed/${currentVideo.videoId}`,
          provider: "youtube",
        },
      ],
    },
    options: {
      loadSprite: false,
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
      },
      youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1
      },
      controls: [
        'play-large',
        'rewind',
        'play',
        'fast-forward',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'pip',
        'airplay',
        'fullscreen'
      ],
      settings: ['captions', 'quality', 'speed'],
      invertTime: false,
      displayDuration: true,
      hideControls: true,
      resetOnEnd: true
    },
  } : null;

  const ContentSection = ({ className = "" }) => (
    <div className={`space-y-6 ${className}`}>
          {/* Videos Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Video Lectures</h3>
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
              {session.videos.map((video, index) => (
                <button
                  key={video.videoId}
                  onClick={() => setCurrentVideoIndex(index)}
              className={`w-full text-left p-3 rounded-lg text-sm hover:bg-gray-100 transition-colors ${
                currentVideoIndex === index ? "bg-blue-50 text-blue-600 border border-blue-200" : "border"
              }`}
            >
              <div className="flex gap-3">
                <div className="w-24 h-16 flex-shrink-0 rounded-md overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-2 font-medium">{video.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{video.channelTitle}</p>
                </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Papers Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Papers</h3>
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
              {session.papers.map((paper) => (
                <div
                  key={paper.paperId}
              className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 flex-shrink-0 text-blue-600" />
                  <span className="truncate text-sm">{paper.title}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" asChild>
                        <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a href={paper.fileUrl} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
              {session.notes.map((note) => (
                <div
                  key={note.noteId}
              className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                  <BookOpen className="h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="truncate text-sm">{note.title}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" asChild>
                        <a href={note.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a href={note.fileUrl} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{session.title}</h1>
          </div>
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-80">
              <ContentSection />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="aspect-video bg-black">
            {currentVideo ? (
              <div key={currentVideo.videoId}>
                <Plyr {...plyrProps} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No video selected</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-4">
            {currentVideo ? (
              <>
                <h2 className="text-xl font-semibold mb-2">{currentVideo.title}</h2>
                <p className="text-gray-500">{currentVideo.channelTitle}</p>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <p>Select a video from below to start watching</p>
              </div>
            )}
          </div>

          {/* Mobile Content - Shows below video on mobile */}
          <div className="lg:hidden p-4 bg-gray-50 border-t">
            <ContentSection />
          </div>
        </div>

        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 border-l bg-white">
          <div className="sticky top-14">
            <ContentSection className="p-4" />
          </div>
        </div>
      </div>
    </div>
  );
} 