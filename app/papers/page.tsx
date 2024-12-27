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
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const renderPapers = () => (
    <div className="grid gap-6">
      {papers.map((paper) => (
        <Card 
          key={paper._id} 
          className="hover:shadow-lg transition-all border-l-4 hover:scale-[1.02] transform duration-200"
          style={{
            borderLeftColor: activeTab === 'university' ? '#3b82f6' : '#8b5cf6'
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{paper.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {paper.subject.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {paper.subject.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {paper.subject.branchId?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {paper.fileUrl ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-blue-50 hover:text-blue-600"
                          asChild
                        >
                          <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="hover:bg-green-50 hover:text-green-600"
                          asChild
                        >
                          <a href={paper.fileUrl} download>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="space-y-2">
                    {activeTab === 'midsem' && paper.college && (
                      <div className="flex items-center gap-1">
                        <School className="h-4 w-4 text-purple-500" />
                        <span>{paper.college.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span>{paper.subject.name} ({paper.subject.code})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4 text-green-500" />
                      <span>
                        {paper.subject.branchId?.name} ({paper.subject.branchId?.code})
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span>
                        {paper.subject.yearId?.label} • {paper.subject.semesterId?.label}
                      </span>
                    </div>
                    
                  </div>
                </div>
              </div>
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
          Previous Year Papers
        </h1>
        <p className="text-gray-600">
          Access previous year question papers for all subjects
        </p>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <TabsContent value="university">
              {papers.length > 0 ? renderPapers() : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No university papers found</h3>
                  <p className="text-gray-500">Papers will be added soon</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="midsem">
              {papers.length > 0 ? renderPapers() : (
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