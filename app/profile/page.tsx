"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  FileText,
  Video,
  Calendar,
  Clock,
  GraduationCap,
  Settings,
  Loader2,
  ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StudySession {
  _id: string;
  title: string;
  description: string;
  papers: Array<{
    title: string;
    fileUrl: string;
  }>;
  notes: Array<{
    title: string;
    fileUrl: string;
  }>;
  videos: Array<{
    title: string;
    videoId: string;
    thumbnail: string;
  }>;
  createdAt: string;
  status: "active" | "completed" | "archived";
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user) {
      fetchStudySessions();
    }
  }, [session, status]);

  const fetchStudySessions = async () => {
    try {
      const response = await fetch("/api/study-sessions");
      if (!response.ok) throw new Error("Failed to fetch study sessions");
      const data = await response.json();
      setStudySessions(data);
    } catch (error) {
      console.error("Error fetching study sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-blue-100">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                  {session.user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{session.user.name}</h1>
                <p className="text-gray-500">{session.user.email}</p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="secondary">
                    {session.user.role?.charAt(0).toUpperCase() + session.user.role?.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50">
                    {studySessions.length} Study Sessions
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Sessions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Study Sessions</h2>
          <Button 
            onClick={() => router.push('/studymode')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Create New Session
          </Button>
        </div>

        {studySessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Study Sessions Yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first study session to organize your learning materials
              </p>
              <Button 
                onClick={() => router.push('/studymode')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studySessions.map((session) => (
              <Card 
                key={session._id} 
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => router.push(`/studymode/${session._id}`)}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-lg font-semibold line-clamp-1">
                      {session.title}
                    </span>
                    <Badge 
                      variant={
                        session.status === "completed" 
                          ? "default" 
                          : session.status === "archived" 
                            ? "secondary" 
                            : "outline"
                      }
                    >
                      {session.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Created {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {session.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="content" className="mt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>{session.papers.length} Papers</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <span>{session.notes.length} Notes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Video className="h-4 w-4 text-purple-600" />
                          <span>{session.videos.length} Videos</span>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="details" className="mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Last accessed 2 days ago</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/studymode/${session._id}`);
                          }}
                        >
                          Continue Learning
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 