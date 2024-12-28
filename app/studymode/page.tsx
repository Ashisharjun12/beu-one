"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  FileText,
  Loader2,
  Plus,
  Search,
  Video,
  X,
  GraduationCap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Paper {
  _id: string;
  title: string;
  subject: {
    name: string;
  };
}

interface Note {
  _id: string;
  title: string;
  subject: {
    name: string;
  };
}

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

interface StudySession {
  _id: string;
  title: string;
  description: string;
  papers: Paper[];
  notes: Note[];
  videos: Video[];
  subject: {
    name: string;
  };
  status: "active" | "completed" | "archived";
  createdAt: string;
}

// Add this CSS class to hide scrollbars
const hideScrollbarClass = "scrollbar-none";

export default function StudyModePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [availablePapers, setAvailablePapers] = useState<Paper[]>([]);
  const [availableNotes, setAvailableNotes] = useState<Note[]>([]);
  const [availableMidsemPapers, setAvailableMidsemPapers] = useState<Paper[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [branches, setBranches] = useState<Array<{ _id: string; name: string }>>([]);
  const [years, setYears] = useState<Array<{ _id: string; label: string }>>([]);
  const [searchResults, setSearchResults] = useState<Video[]>([]);

  useEffect(() => {
    fetchStudySessions();
  }, []);

  useEffect(() => {
    fetchAvailableContent();
  }, []);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchStudySessions = async () => {
    try {
      const response = await fetch('/api/study-sessions');
      if (!response.ok) throw new Error('Failed to fetch study sessions');
      const data = await response.json();
      setStudySessions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch study sessions",
        variant: "destructive",
      });
    }
  };

  const fetchAvailableContent = async () => {
    try {
      const [uniPapersRes, midsemPapersRes, notesRes] = await Promise.all([
        fetch('/api/papers/university'),
        fetch('/api/papers/midsem'),
        fetch('/api/notes')
      ]);

      if (!uniPapersRes.ok || !midsemPapersRes.ok || !notesRes.ok) {
        throw new Error('Failed to fetch content');
      }

      const [uniPapers, midsemPapers, notes] = await Promise.all([
        uniPapersRes.json(),
        midsemPapersRes.json(),
        notesRes.json()
      ]);

      setAvailablePapers(uniPapers);
      setAvailableMidsemPapers(midsemPapers);
      setAvailableNotes(notes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch available content",
        variant: "destructive",
      });
    }
  };

  const fetchFilters = async () => {
    try {
      const [branchesRes, yearsRes] = await Promise.all([
        fetch('/api/branches'),
        fetch('/api/academic/years')
      ]);

      if (!branchesRes.ok || !yearsRes.ok) throw new Error('Failed to fetch filters');

      const [branchesData, yearsData] = await Promise.all([
        branchesRes.json(),
        yearsRes.json()
      ]);

      setBranches(branchesData);
      setYears(yearsData);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const filterContent = (items: any[]) => {
    return items.filter(item => {
      const matchesSearch = searchFilter === "" || 
        item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.subject?.name.toLowerCase().includes(searchFilter.toLowerCase());
      
      const matchesBranch = selectedBranch === "all" || 
        item.subject?.branchId?._id === selectedBranch;
      
      const matchesYear = selectedYear === "all" || 
        item.subject?.yearId?._id === selectedYear;

      return matchesSearch && matchesBranch && matchesYear;
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Failed to search videos");
      const data = await response.json();
      setSearchResults(data.videos);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search videos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create maps to store paper and note metadata
      const paperTypes: Record<string, string> = {};
      const paperTitles: Record<string, string> = {};
      const paperUrls: Record<string, string> = {};
      const noteTitles: Record<string, string> = {};
      const noteUrls: Record<string, string> = {};

      // Collect paper metadata
      selectedPapers.forEach(paper => {
        paperTypes[paper._id] = paper.type || 'UniversityPaper'; // or 'MidsemPaper'
        paperTitles[paper._id] = paper.title;
        paperUrls[paper._id] = paper.fileUrl || '';
      });

      // Collect note metadata
      selectedNotes.forEach(note => {
        noteTitles[note._id] = note.title;
        noteUrls[note._id] = note.fileUrl || '';
      });

      const response = await fetch("/api/study-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          papers: selectedPapers.map(p => p._id),
          paperTypes,
          paperTitles,
          paperUrls,
          notes: selectedNotes.map(n => n._id),
          noteTitles,
          noteUrls,
          videos: selectedVideos,
        }),
      });

      if (!response.ok) throw new Error("Failed to create study session");

      const data = await response.json();
      setStudySessions([data, ...studySessions]);
      setIsCreating(false);
      setTitle("");
      setDescription("");
      setSelectedPapers([]);
      setSelectedNotes([]);
      setSelectedVideos([]);

      toast({
        title: "Success",
        description: "Study session created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create study session",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Study Mode
          </h1>
          <p className="text-gray-600 mt-1">
            Create personalized study sessions with papers, notes, and video lectures
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2">
              <Plus className="h-4 w-4" />
              Create Study Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="border-b pb-4">
              <DialogTitle>Create Study Session</DialogTitle>
              <DialogDescription>
                Add papers, notes, and videos to create your study session
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter session title"
                      className="border-gray-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter session description"
                      className="border-gray-200 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                <Tabs defaultValue="papers" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger 
                      value="papers" 
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Papers
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notes"
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger 
                      value="videos"
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Videos
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4 space-y-4">
                    <TabsContent value="papers" className="mt-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-3">
                            <Input
                              placeholder="Search papers..."
                              value={searchFilter}
                              onChange={(e) => setSearchFilter(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <Select
                            value={selectedBranch}
                            onValueChange={setSelectedBranch}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Branches</SelectItem>
                              {branches.map(branch => (
                                <SelectItem key={branch._id} value={branch._id}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={selectedYear}
                            onValueChange={setSelectedYear}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Years</SelectItem>
                              {years.map(year => (
                                <SelectItem key={year._id} value={year._id}>
                                  {year.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-medium">University Papers</h3>
                          <ScrollArea className={`h-[400px] ${hideScrollbarClass}`}>
                            <div className="space-y-2">
                              {filterContent(availablePapers).map((paper) => (
                                <div
                                  key={paper._id}
                                  className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-50"
                                >
                                  <Checkbox
                                    checked={selectedPapers.some(p => p._id === paper._id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedPapers([...selectedPapers, paper]);
                                      } else {
                                        setSelectedPapers(selectedPapers.filter(p => p._id !== paper._id));
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{paper.title}</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <Badge variant="outline">{paper.subject.name}</Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {paper.subject.yearId?.label}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {paper.subject.semesterId?.label}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-medium">Midsem Papers</h3>
                          <ScrollArea className={`h-[400px] ${hideScrollbarClass}`}>
                            <div className="space-y-2">
                              {filterContent(availableMidsemPapers).map((paper) => (
                                <div
                                  key={paper._id}
                                  className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-50"
                                >
                                  <Checkbox
                                    checked={selectedPapers.some(p => p._id === paper._id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedPapers([...selectedPapers, paper]);
                                      } else {
                                        setSelectedPapers(selectedPapers.filter(p => p._id !== paper._id));
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{paper.title}</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <Badge variant="outline">{paper.subject.name}</Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {paper.subject.yearId?.label}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {paper.subject.semesterId?.label}
                                      </Badge>
                                      {paper.college && (
                                        <Badge variant="secondary" className="text-xs">
                                          {paper.college.name}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="mt-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-3">
                            <Input
                              placeholder="Search notes..."
                              value={searchFilter}
                              onChange={(e) => setSearchFilter(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <Select
                            value={selectedBranch}
                            onValueChange={setSelectedBranch}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Branches</SelectItem>
                              {branches.map(branch => (
                                <SelectItem key={branch._id} value={branch._id}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={selectedYear}
                            onValueChange={setSelectedYear}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Years</SelectItem>
                              {years.map(year => (
                                <SelectItem key={year._id} value={year._id}>
                                  {year.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <ScrollArea className={`h-[400px] ${hideScrollbarClass}`}>
                          <div className="space-y-2">
                            {filterContent(availableNotes).map((note) => (
                              <div
                                key={note._id}
                                className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-50"
                              >
                                <Checkbox
                                  checked={selectedNotes.some(n => n._id === note._id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedNotes([...selectedNotes, note]);
                                    } else {
                                      setSelectedNotes(selectedNotes.filter(n => n._id !== note._id));
                                    }
                                  }}
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{note.title}</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <Badge variant="outline">{note.subject.name}</Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {note.yearId?.label}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {note.semesterId?.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>

                    <TabsContent value="videos" className="mt-0">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Search for video lectures..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                              className="flex-1"
                            />
                            <Button onClick={handleSearch} disabled={isLoading}>
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Search className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {selectedVideos.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-700">Selected Videos</h3>
                                <p className="text-xs text-gray-500">{selectedVideos.length} videos selected</p>
                              </div>
                              <ScrollArea className={`h-[200px] ${hideScrollbarClass}`}>
                                <div className="space-y-2">
                                  {selectedVideos.map((video) => (
                                    <div
                                      key={video.videoId}
                                      className="flex items-center gap-2 p-2 rounded-lg border bg-blue-50"
                                    >
                                      <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-24 h-16 object-cover rounded"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {video.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {video.channelTitle}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          setSelectedVideos(
                                            selectedVideos.filter(
                                              (v) => v.videoId !== video.videoId
                                            )
                                          )
                                        }
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          )}

                          {searchResults.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-700">Search Results</h3>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSearchResults([]);
                                    setSearchQuery('');
                                  }}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  Clear results
                                </Button>
                              </div>
                              <ScrollArea className={`h-[300px] ${hideScrollbarClass}`}>
                                <div className="space-y-2">
                                  {searchResults.map((video) => {
                                    const isSelected = selectedVideos.some(
                                      (v) => v.videoId === video.videoId
                                    );
                                    return (
                                      <div
                                        key={video.videoId}
                                        className={`flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 transition-colors ${
                                          isSelected ? 'border-blue-200 bg-blue-50' : ''
                                        }`}
                                      >
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setSelectedVideos([...selectedVideos, video]);
                                            } else {
                                              setSelectedVideos(
                                                selectedVideos.filter(
                                                  (v) => v.videoId !== video.videoId
                                                )
                                              );
                                            }
                                          }}
                                        />
                                        <img
                                          src={video.thumbnail}
                                          alt={video.title}
                                          className="w-24 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">
                                            {video.title}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {video.channelTitle}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </ScrollArea>
                            </div>
                          )}

                          {searchQuery && !isLoading && searchResults.length === 0 && (
                            <div className="text-center py-8">
                              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900">No videos found</h3>
                              <p className="text-gray-500">Try a different search term</p>
                            </div>
                          )}

                          {!searchQuery && !selectedVideos.length && (
                            <div className="text-center py-8">
                              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900">Add Video Lectures</h3>
                              <p className="text-gray-500">Search for videos to add to your study session</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSession}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Create Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {studySessions.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No study sessions yet</h3>
          <p className="text-gray-500 mb-4">Create your first study session to get started</p>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Study Session
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {studySessions.map((session) => (
          <Card key={session._id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle>{session.title}</CardTitle>
              <CardDescription>{session.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => router.push(`/studymode/${session._id}`)}
              >
                Start Studying
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 