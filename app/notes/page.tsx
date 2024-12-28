"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Eye,
  Loader2,
  BookOpen,
  GraduationCap,
  Calendar,
  Search,
  BookMarked
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Note {
  _id: string;
  title: string;
  description: string;
  branch: {
    name: string;
    code: string;
  };
  subject: {
    name: string;
    code: string;
  };
  yearId: {
    value: number;
    label: string;
  };
  semesterId: {
    value: number;
    label: string;
  };
  fileUrl: string | null;
}

interface Organizer {
  _id: string;
  title: string;
  description: string;
  branch: {
    name: string;
    code: string;
  };
  yearId: {
    value: number;
    label: string;
  };
  fileUrl: string | null;
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'organizers'>('notes');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const [notesRes, organizersRes] = await Promise.all([
        fetch('/api/notes'),
        fetch('/api/organizers')
      ]);

      if (!notesRes.ok || !organizersRes.ok) {
        throw new Error('Failed to fetch content');
      }

      const [notesData, organizersData] = await Promise.all([
        notesRes.json(),
        organizersRes.json()
      ]);

      setNotes(notesData);
      setOrganizers(organizersData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContent = activeTab === 'notes' ? 
    notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBranch = selectedBranch === "all" || note.branch._id === selectedBranch;
      const matchesYear = selectedYear === "all" || note.yearId._id === selectedYear;

      return matchesSearch && matchesBranch && matchesYear;
    }) :
    organizers.filter(organizer => {
      const matchesSearch = 
        organizer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organizer.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBranch = selectedBranch === "all" || organizer.branch._id === selectedBranch;
      const matchesYear = selectedYear === "all" || organizer.yearId._id === selectedYear;

      return matchesSearch && matchesBranch && matchesYear;
    });

  const renderContent = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredContent.map((item) => (
        <Card key={item._id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-medium line-clamp-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {'subject' in item && (
                  <Badge variant="outline" className="bg-blue-50">
                    {item.subject.name}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {item.branch.name}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  {item.yearId?.label}
                </div>
                {'semesterId' in item && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4 text-green-500" />
                    {item.semesterId?.label}
                  </div>
                )}
              </div>

              {item.fileUrl && (
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" size="sm" asChild>
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </a>
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" size="sm" asChild>
                    <a href={item.fileUrl} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Notes & Study Materials
        </h1>
        <p className="text-gray-600">
          Access comprehensive notes and study materials
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by title, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={selectedBranch}
            onValueChange={setSelectedBranch}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {[...notes, ...organizers].map(item => item.branch)
                .filter((branch, index, self) => 
                  branch && self.findIndex(b => b?._id === branch?._id) === index
                )
                .map(branch => branch && (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {[...notes, ...organizers].map(item => item.yearId)
                .filter((year, index, self) => 
                  year && self.findIndex(y => y?._id === year?._id) === index
                )
                .map(year => year && (
                  <SelectItem key={year._id} value={year._id}>
                    {year.label}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs 
        defaultValue="notes" 
        className="space-y-6"
        onValueChange={(value) => setActiveTab(value as 'notes' | 'organizers')}
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger 
            value="notes" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <BookOpen className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger 
            value="organizers" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <BookMarked className="h-4 w-4" />
            Organizers
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="notes">
              {filteredContent.length > 0 ? renderContent() : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No notes found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="organizers">
              {filteredContent.length > 0 ? renderContent() : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No organizers found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default NotesPage; 