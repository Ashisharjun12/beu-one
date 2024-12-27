"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Youtube, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import YouTube from 'react-youtube';
import VideoPlayer from "@/app/components/VideoPlayer";


interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface VideoLecture {
  _id: string;
  title: string;
  subject: Subject;
  type: 'single' | 'playlist';
  videoUrl: string;
  description?: string;
  createdAt: string;
}

function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function isPlaylistUrl(url: string): boolean {
  return url.includes('playlist?list=') || url.includes('&list=');
}

function getYouTubePlaylistId(url: string): string | null {
  const regExp = /[&?]list=([^&]+)/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function VideoLecturesPage() {
  const [lectures, setLectures] = useState<VideoLecture[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { toast } = useToast();

  const [newLecture, setNewLecture] = useState({
    title: "",
    subject: "",
    type: "single" as const,
    videoUrl: "",
    description: "",
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<VideoLecture | null>(null);
  const [itemToDelete, setItemToDelete] = useState<VideoLecture | null>(null);
  const [previewLecture, setPreviewLecture] = useState<VideoLecture | null>(null);

  useEffect(() => {
    fetchLectures();
    fetchSubjects();
  }, []);

  const fetchLectures = async () => {
    try {
      const response = await fetch("/api/admin/video-lectures");
      if (!response.ok) throw new Error("Failed to fetch lectures");
      const data = await response.json();
      setLectures(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lectures",
        variant: "destructive",
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/video-lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLecture),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create lecture");
      }

      const data = await response.json();
      setLectures([data, ...lectures]);

      // Reset form
      setNewLecture({
        title: "",
        subject: "",
        type: "single",
        videoUrl: "",
        description: "",
      });

      toast({
        title: "Success",
        description: "Video lecture added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add video lecture",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    try {
      const response = await fetch(`/api/admin/video-lectures/${itemToEdit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: itemToEdit.title,
          subject: itemToEdit.subject._id,
          type: itemToEdit.type,
          videoUrl: itemToEdit.videoUrl,
          description: itemToEdit.description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update lecture");
      }

      const updatedLecture = await response.json();
      setLectures(lectures.map(l => l._id === updatedLecture._id ? updatedLecture : l));
      setIsEditDialogOpen(false);
      setItemToEdit(null);

      toast({
        title: "Success",
        description: "Video lecture updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update video lecture",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: VideoLecture) => {
    try {
      const response = await fetch(`/api/admin/video-lectures/${item._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete lecture");
      }

      setLectures(lectures.filter(l => l._id !== item._id));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);

      toast({
        title: "Success",
        description: "Video lecture deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete video lecture",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Video Lecture</CardTitle>
          <CardDescription>Add YouTube videos or playlists</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={newLecture.subject}
                  onValueChange={(value) => setNewLecture({ ...newLecture, subject: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Video Type</Label>
                <RadioGroup
                  value={newLecture.type}
                  onValueChange={(value: 'single' | 'playlist') => 
                    setNewLecture({ ...newLecture, type: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single Video</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="playlist" id="playlist" />
                    <Label htmlFor="playlist">Playlist</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="videoUrl">YouTube URL</Label>
                <Input
                  id="videoUrl"
                  value={newLecture.videoUrl}
                  onChange={(e) => setNewLecture({ ...newLecture, videoUrl: e.target.value })}
                  placeholder={newLecture.type === 'single' ? 
                    "https://www.youtube.com/watch?v=..." : 
                    "https://www.youtube.com/playlist?list=..."
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newLecture.description}
                  onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
                  className="h-20"
                />
              </div>

              {newLecture.videoUrl && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="aspect-video mt-2">
                    {newLecture.type === 'single' && getYouTubeVideoId(newLecture.videoUrl) && (
                      <YouTube
                        videoId={getYouTubeVideoId(newLecture.videoUrl)!}
                        opts={{
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    )}
                    {newLecture.type === 'playlist' && getYouTubePlaylistId(newLecture.videoUrl) && (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/videoseries?list=${getYouTubePlaylistId(newLecture.videoUrl)}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit">Add Video Lecture</Button>
          </form>
        </CardContent>
      </Card>

      {/* Video Lectures List */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Video Lectures</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lectures.map((lecture) => (
                <TableRow key={lecture._id}>
                  <TableCell className="font-medium">{lecture.title}</TableCell>
                  <TableCell>{lecture.subject.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lecture.type === 'single' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {lecture.type === 'single' ? 'Single Video' : 'Playlist'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          window.location.href = `/preview?id=${lecture._id}`;
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setItemToEdit(lecture);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setItemToDelete(lecture);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      {/* Similar to the add form, but with itemToEdit state */}

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video lecture.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDelete && handleDelete(itemToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewLecture && (
        <Dialog open={!!previewLecture} onOpenChange={() => setPreviewLecture(null)}>
          <DialogContent className="max-w-6xl p-0">
            <VideoPlayer
              videoId={getYouTubeVideoId(previewLecture.videoUrl) || ''}
              playlistId={previewLecture.type === 'playlist' ? getYouTubePlaylistId(previewLecture.videoUrl) || undefined : undefined}
              title={previewLecture.title}
              description={previewLecture.description}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 