"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Eye,
  Loader2,
  BookOpen,
  School,
  GraduationCap,
  Calendar,
  Star,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    code: string;
    branchId: {
      name: string;
      code: string;
    };
    semesterId: {
      value: number;
      label: string;
    };
    yearId: {
      value: number;
      label: string;
    };
    creditId?: {
      theory: number;
      practical: number;
      total: number;
    };
  };
  college?: {
    name: string;
  };
  fileUrl: string | null;
}

function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'university' | 'midsem'>('university');
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    fetchPapers(activeTab);
  }, [activeTab]);

  const fetchPapers = async (type: 'university' | 'midsem') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/papers/${type}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} papers`);
      }
      const data = await response.json();
      setPapers(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch papers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'university' | 'midsem');
  };

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBranch = selectedBranch === "all" || paper.subject.branchId?._id === selectedBranch;
    const matchesYear = selectedYear === "all" || paper.subject.yearId?._id === selectedYear;

    return matchesSearch && matchesBranch && matchesYear;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Previous Year Papers
        </h1>
        <p className="text-gray-600">
          Access previous year question papers for all subjects
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search papers by title, subject..."
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
              {papers.map(paper => paper.subject.branchId).filter((branch, index, self) => 
                branch && self.findIndex(b => b?._id === branch?._id) === index
              ).map(branch => branch && (
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
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {papers.map(paper => paper.subject.yearId).filter((year, index, self) => 
                year && self.findIndex(y => y?._id === year?._id) === index
              ).map(year => year && (
                <SelectItem key={year._id} value={year._id}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs 
        defaultValue="university" 
        className="space-y-6" 
        onValueChange={handleTabChange}
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger 
            value="university" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <BookOpen className="h-4 w-4" />
            University Papers
          </TabsTrigger>
          <TabsTrigger 
            value="midsem" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <School className="h-4 w-4" />
            Midsem Papers
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
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
            <TabsContent value="university">
              {filteredPapers.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <div className="rounded-md border bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Paper Details</TableHead>
                            <TableHead className="w-[30%]">Subject Info</TableHead>
                            <TableHead className="w-[20%]">Academic Info</TableHead>
                            <TableHead className="w-[10%] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPapers.map((paper) => (
                            <TableRow key={paper._id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{paper.title}</div>
                                  {activeTab === 'midsem' && paper.college && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <School className="h-4 w-4" />
                                      {paper.college.name}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <Badge variant="outline" className="bg-blue-50">
                                    {paper.subject.name}
                                  </Badge>
                                  <div className="flex flex-wrap gap-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {paper.subject.code}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {paper.subject.branchId?.name}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-orange-500" />
                                    {paper.subject.yearId?.label}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <GraduationCap className="h-4 w-4 text-green-500" />
                                    {paper.subject.semesterId?.label}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {paper.fileUrl ? (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="hidden sm:flex hover:bg-blue-50 hover:text-blue-600"
                                        asChild
                                      >
                                        <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer">
                                          <Eye className="h-4 w-4" />
                                        </a>
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="hidden sm:flex hover:bg-green-50 hover:text-green-600"
                                        asChild
                                      >
                                        <a href={paper.fileUrl} download>
                                          <Download className="h-4 w-4" />
                                        </a>
                                      </Button>
                                      {/* Mobile view buttons */}
                                      <div className="sm:hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                        <Button variant="outline" size="sm" className="w-full">
                                          <Eye className="h-4 w-4 mr-2" />
                                          View/Download
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <Button variant="ghost" size="sm" disabled>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="grid gap-4 md:hidden">
                    {filteredPapers.map((paper) => (
                      <Card key={paper._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-medium line-clamp-2">{paper.title}</h3>
                              {activeTab === 'midsem' && paper.college && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <School className="h-4 w-4" />
                                  {paper.college.name}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-blue-50">
                                {paper.subject.name}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {paper.subject.code}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                {paper.subject.yearId?.label}
                              </div>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-4 w-4 text-green-500" />
                                {paper.subject.semesterId?.label}
                              </div>
                            </div>

                            {paper.fileUrl && (
                              <div className="flex gap-2 pt-2">
                                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" size="sm" asChild>
                                  <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </a>
                                </Button>
                                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" size="sm" asChild>
                                  <a href={paper.fileUrl} download>
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
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No papers found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="midsem">
              {filteredPapers.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <div className="rounded-md border bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Paper Details</TableHead>
                            <TableHead className="w-[30%]">Subject Info</TableHead>
                            <TableHead className="w-[20%]">Academic Info</TableHead>
                            <TableHead className="w-[10%] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPapers.map((paper) => (
                            <TableRow key={paper._id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{paper.title}</div>
                                  {activeTab === 'midsem' && paper.college && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <School className="h-4 w-4" />
                                      {paper.college.name}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <Badge variant="outline" className="bg-blue-50">
                                    {paper.subject.name}
                                  </Badge>
                                  <div className="flex flex-wrap gap-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {paper.subject.code}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {paper.subject.branchId?.name}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-orange-500" />
                                    {paper.subject.yearId?.label}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <GraduationCap className="h-4 w-4 text-green-500" />
                                    {paper.subject.semesterId?.label}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {paper.fileUrl ? (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="hidden sm:flex hover:bg-blue-50 hover:text-blue-600"
                                        asChild
                                      >
                                        <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer">
                                          <Eye className="h-4 w-4" />
                                        </a>
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="hidden sm:flex hover:bg-green-50 hover:text-green-600"
                                        asChild
                                      >
                                        <a href={paper.fileUrl} download>
                                          <Download className="h-4 w-4" />
                                        </a>
                                      </Button>
                                      {/* Mobile view buttons */}
                                      <div className="sm:hidden">
                                        <Button variant="outline" size="sm" className="w-full">
                                          <Eye className="h-4 w-4 mr-2" />
                                          View/Download
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <Button variant="ghost" size="sm" disabled>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="grid gap-4 md:hidden">
                    {filteredPapers.map((paper) => (
                      <Card key={paper._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-medium line-clamp-2">{paper.title}</h3>
                              {activeTab === 'midsem' && paper.college && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <School className="h-4 w-4" />
                                  {paper.college.name}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-blue-50">
                                {paper.subject.name}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {paper.subject.code}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                {paper.subject.yearId?.label}
                              </div>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-4 w-4 text-green-500" />
                                {paper.subject.semesterId?.label}
                              </div>
                            </div>

                            {paper.fileUrl && (
                              <div className="flex gap-2 pt-2">
                                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" size="sm" asChild>
                                  <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </a>
                                </Button>
                                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" size="sm" asChild>
                                  <a href={paper.fileUrl} download>
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
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No midsem papers found</h3>
                  <p className="text-gray-500">Papers will be added soon</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

export default PapersPage;