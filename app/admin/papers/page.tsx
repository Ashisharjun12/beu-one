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
import { FileUp, Eye, Download, Pencil, Trash2, Loader2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadPDF } from "@/app/lib/appwrite";
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

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface UniversityPaper {
  _id: string;
  title: string;
  subject: Subject;
  year: number;
  description?: string;
  fileId: string;
  fileUrl: string | null;
  createdAt: string;
}

interface MidsemPaper {
  _id: string;
  title: string;
  subject: Subject;
  year: number;
  college: string;
  description?: string;
  fileId: string;
  fileUrl: string | null;
  createdAt: string;
}

interface College {
  _id: string;
  name: string;
  code: string;
}

type PaperType = 'university' | 'midsem';

export default function PapersPage() {
  const [papers, setPapers] = useState<(UniversityPaper | MidsemPaper)[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'university' | 'midsem'>('all');

  const [newPaper, setNewPaper] = useState({
    title: "",
    type: "university" as PaperType,
    subject: "",
    year: new Date().getFullYear(),
    college: "",
    description: "",
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<UniversityPaper | MidsemPaper | null>(null);
  const [itemToDelete, setItemToDelete] = useState<UniversityPaper | MidsemPaper | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);

  useEffect(() => {
    fetchPapers();
    fetchSubjects();
    fetchColleges();
  }, []);

  const fetchPapers = async () => {
    try {
      const [uniRes, midsemRes] = await Promise.all([
        fetch("/api/admin/university-papers"),
        fetch("/api/admin/midsem-papers")
      ]);

      if (!uniRes.ok || !midsemRes.ok) 
        throw new Error("Failed to fetch papers");

      const [uniPapers, midsemPapers] = await Promise.all([
        uniRes.json(),
        midsemRes.json()
      ]);

      const combined = [...uniPapers, ...midsemPapers].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPapers(combined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch papers",
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

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/colleges");
      if (!response.ok) throw new Error("Failed to fetch colleges");
      const data = await response.json();
      setColleges(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch colleges",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
    }
  };

  function isMidsemPaper(paper: UniversityPaper | MidsemPaper): paper is MidsemPaper {
    return 'college' in paper;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fileId = await uploadPDF(selectedFile);

      const endpoint = newPaper.type === 'university' 
        ? "/api/admin/university-papers"
        : "/api/admin/midsem-papers";

      const submitData = {
        title: newPaper.title,
        subject: newPaper.subject,
        year: newPaper.year,
        description: newPaper.description,
        fileId,
        ...(newPaper.type === 'midsem' && { college: newPaper.college }),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create paper");
      }

      const data = await response.json();
      setPapers([data, ...papers]);

      // Reset form
      setNewPaper({
        title: "",
        type: "university",
        subject: "",
        year: new Date().getFullYear(),
        college: "",
        description: "",
      });
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast({
        title: "Success",
        description: "Paper uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload paper",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    try {
      const endpoint = isMidsemPaper(itemToEdit)
        ? `/api/admin/midsem-papers/${itemToEdit._id}`
        : `/api/admin/university-papers/${itemToEdit._id}`;

      // Create a copy of the data to send
      const submitData = {
        title: itemToEdit.title,
        subject: itemToEdit.subject._id, // Send only the ID
        year: itemToEdit.year,
        description: itemToEdit.description,
        ...(isMidsemPaper(itemToEdit) && { college: itemToEdit.college }),
      };

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update paper");
      }

      const updatedPaper = await response.json();
      setPapers(papers.map(p => p._id === updatedPaper._id ? updatedPaper : p));
      setIsEditDialogOpen(false);
      setItemToEdit(null);

      toast({
        title: "Success",
        description: "Paper updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update paper",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: UniversityPaper | MidsemPaper) => {
    try {
      const endpoint = isMidsemPaper(item)
        ? `/api/admin/midsem-papers/${item._id}`
        : `/api/admin/university-papers/${item._id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete paper");
      }

      setPapers(papers.filter(p => p._id !== item._id));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);

      toast({
        title: "Success",
        description: "Paper deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete paper",
        variant: "destructive",
      });
    }
  };

  const handleAccessFile = async (item: UniversityPaper | MidsemPaper) => {
    setIsLoading(true);
    try {
      const endpoint = isMidsemPaper(item)
        ? "/api/midsem-papers/access"
        : "/api/university-papers/access";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate access");
      }

      const { fileUrl } = await response.json();
      setPapers(papers.map(p => p._id === item._id ? { ...p, fileUrl } : p));

      toast({
        title: "Success",
        description: "File access generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate file access",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPapers = papers.filter(paper => {
    if (filter === 'all') return true;
    return filter === 'university' ? !isMidsemPaper(paper) : isMidsemPaper(paper);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Paper</CardTitle>
          <CardDescription>Upload question papers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paper Type</Label>
                <RadioGroup
                  defaultValue="university"
                  value={newPaper.type}
                  onValueChange={(value: PaperType) => setNewPaper({ ...newPaper, type: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="university" id="university" />
                    <Label htmlFor="university">University Paper</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="midsem" id="midsem" />
                    <Label htmlFor="midsem">Mid Semester Paper</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPaper.title}
                  onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={newPaper.subject}
                  onValueChange={(value) => setNewPaper({ ...newPaper, subject: value })}
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
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min={2000}
                  max={new Date().getFullYear()}
                  value={newPaper.year}
                  onChange={(e) => setNewPaper({ ...newPaper, year: parseInt(e.target.value) })}
                  required
                />
              </div>

              {newPaper.type === 'midsem' && (
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Select
                    value={newPaper.college}
                    onValueChange={(value) => setNewPaper({ ...newPaper, college: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select College" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college._id} value={college._id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newPaper.description}
                  onChange={(e) => setNewPaper({ ...newPaper, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">PDF File</Label>
                <Input
                  id="file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4 mr-2" />
                  Upload Paper
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Papers List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Papers</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter(current => {
              const options: ('all' | 'university' | 'midsem')[] = ['all', 'university', 'midsem'];
              const currentIndex = options.indexOf(current);
              return options[(currentIndex + 1) % options.length];
            })}
          >
            <Filter className="w-4 h-4 mr-2" />
            {filter === 'all' ? 'All Papers' : 
             filter === 'university' ? 'University Papers' : 'Midsem Papers'}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Year</TableHead>
                {filter !== 'university' && <TableHead>College</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPapers.map((paper) => (
                <TableRow key={paper._id}>
                  <TableCell className="font-medium">{paper.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isMidsemPaper(paper) ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {isMidsemPaper(paper) ? 'Midsem' : 'University'}
                    </span>
                  </TableCell>
                  <TableCell>{paper.subject.name}</TableCell>
                  <TableCell>{paper.year}</TableCell>
                  {filter !== 'university' && (
                    <TableCell>
                      {isMidsemPaper(paper) ? paper.college : '-'}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* File actions */}
                      {paper.fileUrl ? (
                        <>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={paper.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={paper.fileUrl} download>
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAccessFile(paper)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileUp className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      {/* Edit/Delete actions */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setItemToEdit(paper);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setItemToDelete(paper);
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {itemToEdit ? (isMidsemPaper(itemToEdit) ? 'Midsem' : 'University') : ''} Paper
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={itemToEdit?.title || ''}
                  onChange={(e) => setItemToEdit(prev => prev ? { ...prev, title: e.target.value } : null)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-subject">Subject</Label>
                <Select
                  value={itemToEdit?.subject._id || ''}
                  onValueChange={(value) => setItemToEdit(prev => 
                    prev ? { ...prev, subject: value } : null
                  )}
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

              <div>
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  type="number"
                  min={2000}
                  max={new Date().getFullYear()}
                  value={itemToEdit?.year || ''}
                  onChange={(e) => setItemToEdit(prev => 
                    prev ? { ...prev, year: parseInt(e.target.value) } : null
                  )}
                  required
                />
              </div>

              {itemToEdit && isMidsemPaper(itemToEdit) && (
                <div>
                  <Label htmlFor="edit-college">College</Label>
                  <Select
                    value={itemToEdit.college}
                    onValueChange={(value) => setItemToEdit(prev => 
                      prev && isMidsemPaper(prev) ? { ...prev, college: value } : prev
                    )}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select College" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college._id} value={college._id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={itemToEdit?.description || ''}
                  onChange={(e) => setItemToEdit(prev => 
                    prev ? { ...prev, description: e.target.value } : null
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the paper.
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
    </div>
  );
} 